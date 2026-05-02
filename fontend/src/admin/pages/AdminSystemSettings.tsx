import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { dataService } from '../../services/dataService';

const AdminSystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // States
  const [settings, setSettings] = useState<any>({});
  const [paymentProviders, setPaymentProviders] = useState<any[]>([]);
  const [notifyTemplates, setNotifyTemplates] = useState<any[]>([]);
  const [passwordForm, setPasswordForm] = useState({ old: '', new: '', confirm: '' });

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [resSettings, resPayments, resNotify] = await Promise.all([
        dataService.getAdminSettings(),
        dataService.getPaymentProviders(),
        dataService.getNotificationTemplates()
      ]);
      setSettings(resSettings || {});
      setPaymentProviders(resPayments || []);
      setNotifyTemplates(resNotify || []);
      setHasChanges(false);
    } catch (err) {
      toast.error('Lỗi tải cấu hình: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleSettingChange = (name: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleProviderToggle = (id: string, active: boolean) => {
    setPaymentProviders(prev => prev.map(p => p.id === id ? { ...p, is_active: active } : p));
    setHasChanges(true);
  };

  const handleTemplateChange = (id: string, field: string, value: string) => {
    setNotifyTemplates(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    if (!hasChanges) return;
    
    // Basic validation
    if (settings.vat_rate < 0 || settings.vat_rate > 100) return toast.error('VAT không hợp lệ');
    if (settings.default_shipping_fee < 0) return toast.error('Phí ship không hợp lệ');

    try {
      setIsSaving(true);
      
      const confirmSave = window.confirm("Xác nhận lưu tất cả cấu hình hệ thống hiện tại?");
      if (!confirmSave) return;

      await Promise.all([
        dataService.updateAdminSettings(settings),
        dataService.updatePaymentProviders(paymentProviders),
        dataService.updateNotificationTemplate(notifyTemplates[0]?.id || 'order_created', notifyTemplates[0]),
        // Ignoring loyalty for now if they don't have multiple rules
      ]);
      toast.success('Lưu cấu hình hệ thống thành công!');
      setHasChanges(false);
    } catch (err) {
      toast.error('Lỗi lưu cấu hình: ' + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const resetChanges = () => {
    const cf = window.confirm('Bạn có chắc muốn hủy các thay đổi chưa lưu?');
    if (cf) loadData();
  };

  const changeAdminPassword = () => {
    if (passwordForm.new.length < (settings.password_policy?.min_length || 8)) return toast.error('Mật khẩu mới quá ngắn!');
    if (passwordForm.new !== passwordForm.confirm) return toast.error('Mật khẩu không khớp!');
    toast.success('Đổi mật khẩu thành công (MOCK)');
    setPasswordForm({ old: '', new: '', confirm: '' });
  };

  if (loading) {
    return <div className="p-8"><div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-primary animate-spin mx-auto mt-20"></div></div>;
  }

  return (
    <div className="p-8 bg-surface min-h-screen text-on-surface">
      <div className="max-w-6xl mx-auto space-y-8 pb-32">
        {/* Page Header */}
        <div className="mb-10">
          <nav className="flex text-[10px] uppercase tracking-widest text-secondary font-bold mb-2 gap-2">
            <span>Quản trị</span>
            <span className="text-outline">/</span>
            <span className="text-primary">Cài đặt hệ thống</span>
          </nav>
          <h2 className="text-[2.75rem] font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-on-surface to-slate-500">
            Cấu Hình & Thiết Lập
          </h2>
          <p className="mt-2 text-secondary font-medium text-sm">Quản lý toàn bộ thông số, chính sách và cơ chế hoạt động của e-commerce portal.</p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 bg-surface-container-low p-2 rounded-2xl mb-8 w-fit shadow-inner">
          {[
            { id: 'general', icon: 'tune', label: 'Hệ thống (General)' },
            { id: 'orders', icon: 'local_shipping', label: 'Vận hành & Đơn hàng' },
            { id: 'payments', icon: 'payments', label: 'Thanh toán' },
            { id: 'notifications', icon: 'notifications', label: 'Thông báo' },
            { id: 'security', icon: 'security', label: 'Bảo mật' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 font-bold rounded-xl text-sm transition-all flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'bg-surface-container-lowest text-primary shadow-sm ring-1 ring-slate-200' 
                  : 'text-secondary hover:text-on-surface hover:bg-surface-container-lowest/50'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${activeTab === tab.id ? 'font-black' : ''}`}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- TAB CONTENT --- */}
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-8">
            
            {activeTab === 'general' && (
              <>
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                    <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                    <h3 className="text-xl font-bold uppercase tracking-tight">Thông tin cơ bản</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 md:col-span-1 space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-wider text-secondary">Tên hệ thống</label>
                      <input className="w-full bg-surface-container-low border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all" type="text" value={settings.system_name || ''} onChange={e => handleSettingChange('system_name', e.target.value)} />
                    </div>
                    <div className="col-span-2 md:col-span-1 space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-wider text-secondary">Tên thương hiệu hiển thị</label>
                      <input className="w-full bg-surface-container-low border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all" value={settings.brand_name || ''} onChange={e => handleSettingChange('brand_name', e.target.value)} />
                    </div>
                    <div className="col-span-2 md:col-span-1 space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-wider text-secondary">Email liên hệ</label>
                      <input className="w-full bg-surface-container-low border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all" type="email" value={settings.support_email || ''} onChange={e => handleSettingChange('support_email', e.target.value)} />
                    </div>
                    <div className="col-span-2 md:col-span-1 space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-wider text-secondary">Hotline / Switchboard</label>
                      <input className="w-full bg-surface-container-low border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all" type="text" value={settings.support_phone || ''} onChange={e => handleSettingChange('support_phone', e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                    <div className="w-2 h-6 bg-tertiary rounded-full"></div>
                    <h3 className="text-xl font-bold uppercase tracking-tight">Khu vực & Tiền tệ</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-wider text-secondary">Ngôn ngữ mặc định</label>
                      <select className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm" value={settings.default_language || 'vi'} onChange={e => handleSettingChange('default_language', e.target.value)}>
                        <option value="vi">Tiếng Việt</option>
                        <option value="en">English (US)</option>
                        <option value="ko">Korean</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-wider text-secondary">Múi giờ hệ thống</label>
                      <select className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm" value={settings.default_timezone || 'Asia/Ho_Chi_Minh'} onChange={e => handleSettingChange('default_timezone', e.target.value)}>
                        <option value="Asia/Ho_Chi_Minh">(GMT+07:00) Ho Chi Minh</option>
                        <option value="Asia/Seoul">(GMT+09:00) Seoul</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-wider text-secondary">Tiền tệ</label>
                      <select className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm" value={settings.currency || 'VND'} onChange={e => handleSettingChange('currency', e.target.value)}>
                        <option value="VND">VND (đ)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'orders' && (
              <>
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                    <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
                    <h3 className="text-xl font-bold uppercase tracking-tight">Cấu hình Vận hành & Giao hàng</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-wider text-secondary">Phí vận chuyển mặc định (VND)</label>
                      <input className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm" type="number" value={settings.default_shipping_fee || 0} onChange={e => handleSettingChange('default_shipping_fee', Number(e.target.value))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-wider text-secondary">Mức Free Ship (VND)</label>
                      <input className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm" type="number" value={settings.free_shipping_threshold || 0} onChange={e => handleSettingChange('free_shipping_threshold', Number(e.target.value))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-wider text-secondary">VAT chung (%)</label>
                      <input className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm" type="number" value={settings.vat_rate || 0} onChange={e => handleSettingChange('vat_rate', Number(e.target.value))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-wider text-secondary">Thời gian xử lý chuẩn</label>
                      <input className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm" type="text" value={settings.order_processing_time || ''} onChange={e => handleSettingChange('order_processing_time', e.target.value)} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'payments' && (
              <>
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                    <div className="w-2 h-6 bg-green-500 rounded-full"></div>
                    <h3 className="text-xl font-bold uppercase tracking-tight">Cổng thanh toán hỗ trợ</h3>
                  </div>
                  <div className="space-y-4">
                    {paymentProviders.map(provider => (
                      <div key={provider.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="font-bold text-on-surface">{provider.name}</p>
                          <p className="text-xs text-secondary mt-1 tracking-wide uppercase">ID Cổng: {provider.id}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={provider.is_active} onChange={e => handleProviderToggle(provider.id, e.target.checked)} />
                          <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'notifications' && (
              <>
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                    <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
                    <h3 className="text-xl font-bold uppercase tracking-tight">Kênh gửi tự động</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    {[
                      { key: 'enable_email_notifications', label: 'Email Marketing/System', icon: 'mail' },
                      { key: 'enable_sms_notifications', label: 'SMS Gateway', icon: 'sms' },
                      { key: 'enable_push_notifications', label: 'App Push Notifications', icon: 'notifications_active' }
                    ].map(ch => (
                      <div key={ch.key} className="p-4 border border-slate-100 rounded-xl text-center flex flex-col items-center">
                        <span className="material-symbols-outlined text-3xl text-secondary mb-3">{ch.icon}</span>
                        <p className="text-sm font-bold mb-4">{ch.label}</p>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={settings[ch.key] || false} onChange={e => handleSettingChange(ch.key, e.target.checked)} />
                          <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-slate-50">
                    <h4 className="font-bold text-on-surface mb-4">Mẫu Template: Đơn hàng mới</h4>
                    {notifyTemplates.map(tpl => (
                      <div key={tpl.id} className="space-y-4">
                        <div className="space-y-1.5">
                           <label className="text-[11px] font-black uppercase tracking-wider text-secondary">Tiêu đề (Subject)</label>
                           <input className="w-full bg-surface-container border-none rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-purple-200" value={tpl.title} onChange={e => handleTemplateChange(tpl.id, 'title', e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[11px] font-black uppercase tracking-wider text-secondary">Nội dung (Body Variables: {'{{orderId}}'}, {'{{total}}'})</label>
                           <textarea rows={3} className="w-full bg-surface-container border-none rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-purple-200 resize-none" value={tpl.body} onChange={e => handleTemplateChange(tpl.id, 'body', e.target.value)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                    <div className="w-2 h-6 bg-red-600 rounded-full"></div>
                    <h3 className="text-xl font-bold uppercase tracking-tight">An ninh hệ thống</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8 mb-10">
                    <div className="flex items-start gap-4 p-5 bg-red-50 rounded-xl border border-red-100">
                       <input type="checkbox" id="require_2fa" className="mt-1 w-5 h-5 accent-red-600 cursor-pointer" checked={settings.require_2fa || false} onChange={e => handleSettingChange('require_2fa', e.target.checked)} />
                       <div>
                         <label htmlFor="require_2fa" className="font-bold text-red-900 cursor-pointer">Bắt buộc 2FA cho mọi Admin</label>
                         <p className="text-xs text-red-800 mt-1">Sử dụng Google Authenticator hoặc tin nhắn OTP SMS để đăng nhập.</p>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[11px] font-black uppercase tracking-wider text-secondary">Thời gian Timeout Session (Phút)</label>
                       <input className="w-full bg-surface border-none rounded-xl px-4 py-3 text-sm" type="number" min="5" value={settings.session_timeout_minutes || 30} onChange={e => handleSettingChange('session_timeout_minutes', Number(e.target.value))} />
                    </div>
                  </div>

                  <hr className="border-slate-50 mb-8" />

                  <h4 className="font-bold mb-4 font-on-surface">Cập nhật Mật khẩu System Admin</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-black uppercase tracking-wider text-secondary">Mật khẩu hiện hành</label>
                       <input className="w-full bg-surface-container border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" type="password" value={passwordForm.old} onChange={e => setPasswordForm(p => ({...p, old: e.target.value}))} />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-black uppercase tracking-wider text-secondary">Mật khẩu mới</label>
                       <input className="w-full bg-surface-container border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" type="password" value={passwordForm.new} onChange={e => setPasswordForm(p => ({...p, new: e.target.value}))} />
                    </div>
                    <div className="col-span-2 md:col-span-1 space-y-1.5">
                       <label className="text-[11px] font-black uppercase tracking-wider text-secondary">Xác nhận mật khẩu</label>
                       <input className="w-full bg-surface-container border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" type="password" value={passwordForm.confirm} onChange={e => setPasswordForm(p => ({...p, confirm: e.target.value}))} />
                    </div>
                    <div className="col-span-2 md:col-span-1 flex items-end">
                       <button onClick={changeAdminPassword} className="inline-flex items-center justify-center gap-2 w-full h-10 px-6 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 cursor-pointer active:scale-[0.98]">
                         Đổi mật khẩu
                       </button>
                    </div>
                  </div>

                </div>
              </>
            )}

          </div>

          {/* Quick Toggles (Sidebar/Right) */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className={`p-8 rounded-2xl border transition-colors ${settings.maintenance_mode ? 'bg-orange-50 border-orange-200 shadow-lg shadow-orange-500/10' : 'bg-surface-container-high/50 border-transparent'}`}>
              <div className="flex items-center gap-3 mb-6">
                <span className={`material-symbols-outlined text-3xl ${settings.maintenance_mode ? 'text-orange-500' : 'text-slate-400'}`}>construction</span>
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-on-surface opacity-60">Maintenance Mode</h4>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between group cursor-pointer" onClick={() => handleSettingChange('maintenance_mode', !settings.maintenance_mode)}>
                  <div>
                    <p className={`text-sm font-bold ${settings.maintenance_mode ? 'text-orange-900' : 'text-on-surface'}`}>Công tắc Bảo trì</p>
                    <p className="text-[10px] text-secondary mt-1 max-w-[200px] leading-relaxed">Tạm ngừng nhận đơn hàng và bảo vệ API/DB cho Developer.</p>
                  </div>
                  <div className="relative inline-flex items-center">
                    <div className={`w-12 h-6 rounded-full transition-colors ${settings.maintenance_mode ? 'bg-orange-500' : 'bg-surface-variant'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.maintenance_mode ? 'translate-x-6' : ''}`}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl overflow-hidden relative">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>
              <h5 className="text-white font-black text-xl mb-2 relative z-10">Lotte Mart Core v3.0</h5>
              <p className="text-white/60 text-xs leading-relaxed mb-6 font-medium relative z-10">Dữ liệu cấu hình hệ thống luôn được Backup định kì. Không nên sửa đổi liên tục trong giờ cao điểm.</p>
              
              <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Database Size</span>
                  <span className="text-green-400 font-black">2.4 GB</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Environment</span>
                  <span className="text-blue-400 font-bold px-2 py-0.5 bg-blue-500/10 rounded">PRODUCTION</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Latest Backup</span>
                  <span className="text-slate-300 font-medium">Hôm nay, 03:00 AM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 p-5 z-30 flex justify-between items-center shadow-2xl animate-slide-up">
          <div className="flex items-center gap-4 ml-6 lg:ml-[280px]">
            <span className="material-symbols-outlined text-orange-500 animate-pulse text-3xl">info</span>
            <p className="text-sm font-bold text-on-surface">Có thay đổi mới chưa lưu.</p>
          </div>
          <div className="flex items-center gap-3 pr-8">
            <button onClick={resetChanges} disabled={isSaving} className="inline-flex items-center justify-center gap-2 h-10 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-[0.98] border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed">Hoàn tác</button>
            <button onClick={saveSettings} disabled={isSaving} className="inline-flex items-center justify-center gap-2 h-10 px-10 bg-green-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-600/15 hover:bg-green-700 hover:-translate-y-0.5 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
              {isSaving ? 'Đang lưu...' : 'Lưu tất cả'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSystemSettings;