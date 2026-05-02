import React, { useState, useEffect, useCallback } from 'react';
import { supportService } from '../../services/supportService';
import { toast } from '../../components/Toast/toastEvent';
import { useAppSelector } from '../../store';
import { 
  PageHeader, SearchBar, FilterBar, StatusBadge, EmptyState, 
  LoadingOverlay, PaginationControl, DetailDrawer, 
  FormSection, StatCard, cls, AdminErrorBoundary 
} from '../components/AdminUI';
import { format } from 'date-fns';
import { socket } from '../../services/socket';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Mở' },
  { value: 'pending', label: 'Treo' },
  { value: 'in_progress', label: 'Đang xử lý' },
  { value: 'waiting_customer', label: 'Chờ khách' },
  { value: 'resolved', label: 'Đã giải quyết' },
  { value: 'closed', label: 'Đã đóng' }
];

const PRIORITY_OPTIONS = [
  { value: 'urgent', label: '⚡ Urgent' },
  { value: 'high', label: '🔴 High' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'low', label: '🟢 Low' }
];

const AdminSupportTickets: React.FC = () => {
  const { user } = useAppSelector(s => s.auth);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  
  // Query state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [total, setTotal] = useState(0);

  // Detail & Modals
  const [detailTicket, setDetailTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [internalNoteText, setInternalNoteText] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, listRes] = await Promise.all([
        supportService.stats(),
        supportService.listTickets({ page, limit: 15, search, status: statusFilter, priority: priorityFilter })
      ]);
      setStats(statsRes || {});
      setTickets(listRes?.data || []);
      setTotal(listRes?.meta?.total || 0);
    } catch (err: any) {
      toast.error('Lỗi tải ticket');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, priorityFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  // Socket
  useEffect(() => {
    const tId = detailTicket?._id || detailTicket?.id;
    if (tId) {
      socket.emit('join_ticket', tId);
      
      const handleNewMessage = (msg: any) => {
        if (msg.ticket_id === tId) {
          setDetailTicket((prev: any) => {
            if (!prev) return prev;
            // Filter duplicates by comparing id (we handle optimistic temp ids too just in case)
            const exists = (prev.thread || []).some((m: any) => (m._id || m.id) === (msg._id || msg.id) && !String(m._id || m.id).startsWith('temp'));
            if (exists) return prev;
            
            return {
              ...prev,
              thread: [...(prev.thread || []), msg],
              messages: [...(prev.messages || []), msg]
            };
          });
        }
      };
      
      socket.on('new_message', handleNewMessage);
      
      return () => {
        socket.emit('leave_ticket', tId);
        socket.off('new_message', handleNewMessage);
      };
    }
  }, [detailTicket?._id, detailTicket?.id]);

  const reloadDetail = async (id: string) => {
    try {
      const res = await supportService.detail(id);
      if (res) setDetailTicket(res);
    } catch {}
  };

  const submitReply = async () => {
    if (!detailTicket || !replyText.trim()) return;
    
    // Optimistic UI for Admin
    const tempMsg = {
      _id: `temp_${Date.now()}`,
      sender_type: 'agent',
      sender_name: user?.full_name || 'Hỗ trợ Lotte',
      content: replyText,
      created_at: new Date().toISOString()
    };
    setDetailTicket((prev: any) => ({
      ...prev,
      thread: [...(prev.thread || []), tempMsg]
    }));
    
    const textToSend = replyText;
    setReplyText('');
    
    try {
      await supportService.reply(detailTicket._id || detailTicket.id, { content: textToSend, sender_name: user?.full_name || 'Hỗ trợ Lotte' });
      // We don't call reloadDetail, socket will echo or it's already there
      loadData(); // Just refresh the stats/list
    } catch {
      toast.error('Lỗi phản hồi');
    }
  };

  const submitInternalNote = async () => {
    if (!detailTicket || !internalNoteText.trim()) return;
    try {
      await supportService.internalNote(detailTicket._id || detailTicket.id, { content: internalNoteText, author_name: user?.full_name });
      toast.success('Đã lưu ghi chú nội bộ');
      setInternalNoteText('');
      await reloadDetail(detailTicket._id || detailTicket.id);
    } catch {
      toast.error('Lỗi lưu ghi chú');
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!detailTicket) return;
    try {
      await supportService.updateStatus(detailTicket._id || detailTicket.id, { status });
      toast.success(`Chuyển trạng thái thành ${status}`);
      await reloadDetail(detailTicket._id || detailTicket.id);
      loadData();
    } catch {
      toast.error('Lỗi cập nhật trạng thái');
    }
  };

  const handleAssignMe = async () => {
    if (!detailTicket) return;
    try {
      await supportService.assignAgent(detailTicket._id || detailTicket.id, { assigned_agent_name: user?.full_name });
      toast.success('Đã nhận xử lý ticket này');
      await reloadDetail(detailTicket._id || detailTicket.id);
      loadData();
    } catch {
      toast.error('Lỗi nhận xử lý');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': case 'closed': return 'slate';
      case 'open': return 'danger';
      case 'in_progress': case 'pending': return 'primary';
      case 'waiting_customer': return 'warning';
      default: return 'slate';
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'urgent': case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <AdminErrorBoundary>
      <div className="p-8 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader 
          title="Hỗ Trợ Khách Hàng (Support Tickets)" 
          subtitle="Tiếp nhận và xử lý yêu cầu hỗ trợ từ user"
          breadcrumbs={['Quản trị', 'Customer Support']}
        />

        {/* STATS */}
        <div className="grid grid-cols-5 gap-4">
          <StatCard title="Đang Mở" value={stats.open || 0} icon="inbox" color="primary" />
          <StatCard title="Ưu tiên cao" value={stats.high_priority || 0} icon="warning" color="danger" />
          <StatCard title="Chưa có ai nhận" value={stats.unassigned || 0} icon="person_off" color="warning" />
          <StatCard title="Đã Giải Quyết" value={stats.resolved || 0} icon="task_alt" color="success" />
          <StatCard title="Đã Đóng" value={stats.closed || 0} icon="drafts" color="slate" />
        </div>

        {/* TOOLBAR */}
        <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <SearchBar value={search} onChange={setSearch} placeholder="Tìm theo subject, ticket code, email..." />
          <FilterBar 
            filters={[
              {
                label: 'Trạng thái',
                value: statusFilter,
                options: STATUS_OPTIONS,
                onChange: setStatusFilter
              },
              {
                label: 'Mức ưu tiên',
                value: priorityFilter,
                options: PRIORITY_OPTIONS,
                onChange: setPriorityFilter
              }
            ]}
          />
        </div>

        {/* LIST */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 min-h-[400px] relative">
          {loading && <LoadingOverlay visible={loading} />}
          
          {tickets.length === 0 && !loading ? (
            <EmptyState icon="support_agent" title="Không có ticket nào" />
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">Ticket</th>
                  <th className="px-6 py-4">Chủ Đề</th>
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Agent Nhận</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                 {tickets.map(t => (
                   <tr key={t._id || t.id} className="hover:bg-slate-50/50">
                     <td className="px-6 py-4">
                        <div className="font-mono text-xs font-bold text-slate-800 mb-1">{t.ticket_code || `#${String(t._id || t.id).slice(-6).toUpperCase()}`}</div>
                        <StatusBadge status={getStatusColor(t.status)} label={t.status} />
                     </td>
                     <td className="px-6 py-4 max-w-[250px] truncate">
                        <div className="font-bold text-slate-800 truncate mb-1">{t.subject}</div>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${getPriorityColor(t.priority)}`}>
                          {t.priority}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-slate-500">
                        <div className="font-semibold text-slate-700">{t.user_name}</div>
                        <div className="text-xs">{t.user_email}</div>
                     </td>
                     <td className="px-6 py-4">
                        {t.assigned_agent_name ? (
                          <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-bold border border-blue-200">
                            <span className="material-symbols-outlined text-[14px]">support_agent</span>
                            {t.assigned_agent_name}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Chưa phân công</span>
                        )}
                     </td>
                     <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => { setDetailTicket(t); reloadDetail(t._id || t.id); }} className="text-primary font-bold hover:underline">Xử lý</button>
                     </td>
                   </tr>
                 ))}
              </tbody>
            </table>
          )}
        </div>
        <PaginationControl page={page} total={total} pageSize={15} onChange={setPage} />
      </div>

      {/* DETAIL DRAWER */}
      <DetailDrawer
        open={!!detailTicket}
        onClose={() => setDetailTicket(null)}
        title={detailTicket?.ticket_code ? `Ticket ${detailTicket.ticket_code}` : 'Support Ticket'}
        width="max-w-2xl"
      >
         {detailTicket && (
           <div className="space-y-6">
             <div className="flex justify-between items-start">
               <div>
                  <h3 className="font-black text-xl text-slate-800 mb-2">{detailTicket.subject}</h3>
                  <div className="flex gap-2 mb-4">
                    <StatusBadge status={getStatusColor(detailTicket.status)} label={detailTicket.status} />
                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border border-slate-100 ${getPriorityColor(detailTicket.priority)}`}>{detailTicket.priority}</span>
                  </div>
               </div>
               {(!detailTicket.assigned_agent_id) && detailTicket.status !== 'closed' && (
                 <button onClick={handleAssignMe} className={cls.btnPrimary + ' !py-1 !text-xs'}>Nhận Ticket</button>
               )}
             </div>

             <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
               <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Thông tin khách hàng</div>
               <div className="font-bold text-slate-800">{detailTicket.user_name}</div>
               <div className="text-sm text-slate-600">{detailTicket.user_email}</div>
               {detailTicket.order_id && <div className="text-sm text-blue-600 mt-1 cursor-pointer">Order Ref: {detailTicket.order_id}</div>}
             </div>

             {/* THREAD */}
             <FormSection title={`Lịch sử trao đổi (${detailTicket.thread?.length || detailTicket.messages?.length || 0})`}>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {(detailTicket.thread?.length ? detailTicket.thread : detailTicket.messages || []).map((msg: any, idx: number) => {
                    const isAgent = msg.sender_type === 'agent' || msg.sender === 'agent' || msg.sender_type === 'admin';
                    return (
                      <div key={idx} className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}>
                        <div className="text-[10px] text-slate-400 font-bold mb-1 ml-1">{msg.sender_name} • {format(new Date(msg.created_at), 'dd/MM HH:mm')}</div>
                        <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${isAgent ? 'bg-primary text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                          {msg.content}
                          {msg.attachments?.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {msg.attachments.map((att: string, i: number) => (
                                <img key={i} src={att} alt="attachment" className="w-16 h-16 object-cover rounded opacity-90 border border-white/20" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
             </FormSection>

             {/* ACTION PANEL */}
             {detailTicket.status !== 'closed' && (
               <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                 <div className="flex bg-slate-50 border-b border-slate-200 divide-x divide-slate-200">
                   <div className="px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-widest bg-white">Phản hồi khách</div>
                   {/* INTERNAL NOTE TAB CAN BE ADDED HERE */}
                 </div>
                 <div className="p-4 space-y-4 bg-white">
                   <textarea 
                     className={cls.input + ' min-h-[100px]'} 
                     value={replyText} 
                     onChange={e => setReplyText(e.target.value)} 
                     placeholder="Viết tin nhắn gửi khách hàng..."
                   />
                   <div className="flex justify-between items-center">
                     <div className="flex gap-2">
                       {detailTicket.status !== 'waiting_customer' && (
                         <button onClick={() => handleUpdateStatus('waiting_customer')} className={cls.btnSecondary + ' !py-1 !text-xs'}>Chờ khách phản hồi</button>
                       )}
                       {detailTicket.status !== 'resolved' && (
                         <button onClick={() => handleUpdateStatus('resolved')} className={cls.btnSecondary + ' !py-1 !text-xs !text-green-600'}>Đánh dấu Resolved</button>
                       )}
                     </div>
                     <button onClick={submitReply} className={cls.btnPrimary}>Gửi tin nhắn</button>
                   </div>
                 </div>
               </div>
             )}

             {/* INTERNAL NOTES */}
             <FormSection title={`Ghi chú nội bộ (${detailTicket.internal_notes?.length || 0})`}>
               {detailTicket.internal_notes?.map((note: any, nIdx: number) => (
                 <div key={nIdx} className="bg-amber-50 p-3 rounded-lg border border-amber-100 mb-2">
                   <div className="text-[10px] text-amber-600 font-bold uppercase mb-1">{note.author_name} • {format(new Date(note.created_at), 'dd/MM HH:mm')}</div>
                   <div className="text-sm text-slate-800 italic">{note.content}</div>
                 </div>
               ))}
               {detailTicket.status !== 'closed' && (
                 <div className="flex gap-2 mt-2">
                   <input type="text" className={cls.input + ' flex-1'} placeholder="Thêm ghi chú nội bộ (khách không thấy)..." value={internalNoteText} onChange={e => setInternalNoteText(e.target.value)} />
                   <button onClick={submitInternalNote} className={cls.btnSecondary}>Lưu Note</button>
                 </div>
               )}
             </FormSection>

           </div>
         )}
      </DetailDrawer>
    </div>
    </AdminErrorBoundary>
  );
};

export default AdminSupportTickets;
