import React, { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { loadTickets, loadMessages, createTicket, addMessage } from '../slices/supportSlice';
import { dataService } from '../services/dataService';
import { toast } from '../components/Toast/toastEvent';
import { socket } from '../services/socket';

const SupportCenter: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tickets, messages, status } = useAppSelector(state => state.support);
  const { user: currentUser } = useAppSelector(state => state.auth);

  const [activeTab, setActiveTab] = useState<'all' | 'OPEN' | 'CLOSED'>('all');
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(loadTickets(undefined));
    }
  }, [dispatch, currentUser?.id]);

  useEffect(() => {
    if (activeTicketId) {
      dispatch(loadMessages(activeTicketId));
      socket.emit('join_ticket', activeTicketId);
    }
    
    const handleNewMessage = (msg: any) => {
      if (msg.ticket_id === activeTicketId) {
        dispatch(addMessage(msg));
      }
    };
    
    socket.on('new_message', handleNewMessage);
    
    return () => {
      if (activeTicketId) {
        socket.emit('leave_ticket', activeTicketId);
      }
      socket.off('new_message', handleNewMessage);
    };
  }, [dispatch, activeTicketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTicketId]);

  const handleCreateTicket = async () => {
    if (!newSubject.trim()) return toast.warning('Vui lòng nhập tiêu đề');
    try {
      const ticket = await dataService.createSupportTicket({
        subject: newSubject,
        message: newSubject, // User currently only inputs subject in simple UI, using as message
        priority: 'medium',
        category: 'general'
      });
      dispatch(createTicket(ticket));
      toast.success('Đã tạo phiếu hỗ trợ thành công');
      setIsCreating(false);
      setNewSubject('');
      const tid = ticket._id || ticket.id;
      setActiveTicketId(tid);
      dispatch(loadMessages(tid));
    } catch (err: any) {
      toast.error('Lỗi khi tạo phiếu: ' + err.message);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeTicketId) return;
    const optimisticMsg = {
      id: `temp_${Date.now()}`,
      ticket_id: activeTicketId,
      sender_type: 'user',
      content: replyText,
      created_at: new Date().toISOString()
    };
    
    const originalText = replyText;
    setReplyText('');
    dispatch(addMessage(optimisticMsg as any));
    
    try {
      await dataService.sendMessage(activeTicketId, currentUser?.id || 0, originalText);
      dispatch(loadTickets(undefined));
    } catch (err: any) {
      toast.error('Lỗi khi gửi tin nhắn: ' + err.message);
      // Here we would ideally remove the optimistic message, simplified for now
    }
  };

  const filteredTickets = (tickets || []).filter(t => {
    if (activeTab === 'OPEN') return t.status !== 'CLOSED' && t.status !== 'RESOLVED';
    if (activeTab === 'CLOSED') return t.status === 'CLOSED' || t.status === 'RESOLVED';
    return true;
  }).sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  const activeTicket = (tickets || []).find(t => (t._id || t.id) === activeTicketId);
  const currentMessages = activeTicketId ? messages[activeTicketId] || [] : [];

  return (
    <div className="flex flex-col rounded-xl border border-primary/10 overflow-hidden" style={{ minHeight: '70vh' }}>
      <main className="flex flex-1 overflow-hidden" style={{ minHeight: '65vh' }}>
        {/* Sidebar */}
        <aside className="w-full md:w-80 lg:w-96 border-r border-primary/10 bg-white dark:bg-slate-900 flex flex-col shrink-0 h-full">
          <div className="p-4 border-b border-primary/10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Phiếu hỗ trợ của tôi</h3>
              <button onClick={() => { setIsCreating(true); setActiveTicketId(null); }} className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                <span className="material-symbols-outlined text-sm">add</span> Tạo mới
              </button>
            </div>
            <div className="flex gap-2 p-1 bg-primary/5 rounded-lg text-xs font-bold uppercase tracking-wider">
              <button onClick={() => setActiveTab('all')} className={`flex-1 py-1.5 rounded-md shadow-sm transition-colors ${activeTab === 'all' ? 'bg-white dark:bg-slate-800 text-primary' : 'text-slate-500 hover:text-slate-700'}`}>Tất cả</button>
              <button onClick={() => setActiveTab('OPEN')} className={`flex-1 py-1.5 rounded-md shadow-sm transition-colors ${activeTab === 'OPEN' ? 'bg-white dark:bg-slate-800 text-primary' : 'text-slate-500 hover:text-slate-700'}`}>Đang xử lý</button>
              <button onClick={() => setActiveTab('CLOSED')} className={`flex-1 py-1.5 rounded-md shadow-sm transition-colors ${activeTab === 'CLOSED' ? 'bg-white dark:bg-slate-800 text-primary' : 'text-slate-500 hover:text-slate-700'}`}>Đã đóng</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {status === 'loading' && <div className="text-center p-4"><span className="material-symbols-outlined animate-spin text-primary">autorenew</span><p className="text-sm mt-1">Đang tải...</p></div>}
            {filteredTickets.length === 0 && status !== 'loading' && (
              <div className="text-center p-6 text-slate-500 flex flex-col items-center">
                 <span className="material-symbols-outlined text-3xl mb-2 opacity-50">inbox</span>
                 Chưa có phiếu hỗ trợ nào.
              </div>
            )}
            <div className="flex flex-col">
              {filteredTickets.map(ticket => (
                <div key={`ticket-${ticket._id || ticket.id || ticket.ticket_code}-${ticket.created_at}`} onClick={() => { setActiveTicketId(ticket._id || ticket.id); setIsCreating(false); }} className={`p-4 border-b border-primary/5 cursor-pointer relative transition-colors ${activeTicketId === (ticket._id || ticket.id) ? 'bg-primary/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                  {activeTicketId === (ticket._id || ticket.id) && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs font-semibold uppercase ${ticket.status === 'CLOSED' || ticket.status === 'RESOLVED' ? 'text-slate-400' : 'text-emerald-600'}`}>
                      {ticket.status}
                    </span>
                    <span className="text-[10px] text-slate-400">{new Date(ticket.updated_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 mb-1">
                    {ticket.subject}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1 flex flex-col bg-background-light dark:bg-background-dark overflow-hidden h-full">
          {isCreating ? (
             <div className="p-8 max-w-2xl mx-auto w-full h-full flex flex-col justify-center">
               <h2 className="text-2xl font-bold mb-6 text-center">Tạo phiếu hỗ trợ mới</h2>
               <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-primary/10">
                 <div className="mb-4">
                   <label className="block text-sm font-bold mb-2">Chủ đề / Vấn đề cần hỗ trợ</label>
                   <input value={newSubject} onChange={e => setNewSubject(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-primary focus:border-primary outline-none transition-shadow" placeholder="Ví dụ: Thiếu sản phẩm trong đơn hàng" />
                 </div>
                 <button onClick={handleCreateTicket} className="bg-primary text-white px-6 py-3 rounded-xl font-bold w-full hover:bg-primary/90 transition-colors shadow-md shadow-primary/20">Gửi yêu cầu</button>
               </div>
             </div>
          ) : activeTicketId && activeTicket ? (
            <div className="flex flex-col h-full">
              {/* Thread Header */}
              <div className="p-4 bg-white dark:bg-slate-900 border-b border-primary/10 flex items-center justify-between shadow-sm z-10 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">receipt_long</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-tight mb-0.5">
                      {activeTicket.subject}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">
                        {activeTicket.status}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Bắt đầu {new Date(activeTicket.created_at).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-6 scrollbar-hide">
                {currentMessages.length === 0 && <div className="text-center text-slate-500 text-sm py-10">Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện.</div>}
                
                {currentMessages.map((msg, idx) => {
                  const isUser = msg.sender_type === 'user' || msg.sender_type === 'USER' || msg.sender === 'user';
                  return (
                    <div key={`msg-${msg._id || msg.id || idx}-${msg.created_at}`} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex ${isUser ? 'flex-col items-end' : 'items-start gap-3'} max-w-[80%] sm:max-w-[70%]`}>
                        {!isUser && (
                          <div className="size-8 rounded-full bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            <span className="material-symbols-outlined text-xl text-slate-500">support_agent</span>
                          </div>
                        )}
                        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                          {!isUser && <span className="text-[11px] font-bold text-slate-600 mb-1">Hỗ trợ khách hàng</span>}
                          <div className={`p-3 rounded-2xl shadow-sm text-sm ${isUser ? 'bg-primary text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-primary/5'}`}>
                            {msg.content || (msg as any).text}
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1">{new Date(msg.created_at).toLocaleTimeString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Thread Input */}
              {activeTicket.status !== 'CLOSED' && activeTicket.status !== 'RESOLVED' && (
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-primary/10 shrink-0">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-xl border border-primary/10 focus-within:border-primary/40 transition-colors">
                      <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm resize-none h-12 py-2 outline-none"
                        placeholder="Viết phản hồi..."
                      />
                      <button onClick={handleSendReply} className="bg-primary text-white size-10 shrink-0 rounded-lg flex items-center justify-center hover:bg-primary/90 shadow-md transition-transform active:scale-95">
                        <span className="material-symbols-outlined text-base z">send</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 space-y-4 text-center">
              <div className="size-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-5xl opacity-50 text-slate-500">forum</span>
              </div>
              <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300">Trung tâm hỗ trợ khách hàng</h3>
              <p className="max-w-xs text-sm leading-relaxed">Chọn một phiếu hỗ trợ từ danh sách bên trái hoặc tạo mới để được trợ giúp ngay.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default SupportCenter;