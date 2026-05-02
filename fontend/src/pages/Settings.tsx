// src/pages/Settings.tsx
import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { updateUserSettingsThunk } from '../slices/authSlice';
import { dataService } from '../services/dataService';
import { toast } from '../components/Toast/toastEvent';
import type { User } from '../types';

// ─── Toggle component ────────────────────────────────────────────
const Toggle: React.FC<{
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
}> = ({ checked, onChange, disabled, ariaLabel }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`w-12 h-6 rounded-full relative flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${
      checked ? 'bg-primary' : 'bg-surface-dim'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`absolute w-4 h-4 rounded-full transition-all ${
        checked ? 'right-1 bg-on-primary' : 'left-1 bg-on-surface-variant'
      }`}
    />
  </button>
);

// ─── Confirm Modal ───────────────────────────────────────────────
const ConfirmModal: React.FC<{
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}> = ({ open, title, message, onConfirm, onCancel, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div
        className="bg-surface-container-lowest rounded-xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-on-surface mb-2">{title}</h3>
        <p className="text-sm text-on-surface-variant mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 font-bold text-on-surface hover:bg-surface-container-high rounded-full transition-all"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Settings: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const userId = Number(user?.id);

  // ─── Password state ──────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwLoading, setPwLoading] = useState(false);

  // ─── Notification preferences ────────────────────────────────
  const prefs = user?.preferences || {};
  const security = user?.security || {};
  const settings = user?.settings || {};

  // ─── Modal ───────────────────────────────────────────────────
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // ─── Saving indicator ────────────────────────────────────────
  const [saving, setSaving] = useState(false);

  // ─── Loading state ───────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant animate-spin">progress_activity</span>
          <p className="text-on-surface-variant">Đang tải cài đặt...</p>
        </div>
      </div>
    );
  }

  // ─── Helpers ─────────────────────────────────────────────────
  const updatePreference = async (key: string, value: boolean) => {
    if (!Number.isFinite(userId)) {
      toast.error('ID người dùng không hợp lệ');
      return;
    }
    setSaving(true);
    try {
      await dispatch(
        updateUserSettingsThunk({
          userId,
          patch: { preferences: { [key]: value } } as Partial<User>,
        })
      ).unwrap();
      toast.success('Đã cập nhật tùy chọn');
    } catch (e: any) {
      toast.error(e?.message || 'Lỗi khi cập nhật');
    } finally {
      setSaving(false);
    }
  };

  const updateSecurity = async (key: string, value: any) => {
    if (!Number.isFinite(userId)) {
      toast.error('ID người dùng không hợp lệ');
      return;
    }
    setSaving(true);
    try {
      await dispatch(
        updateUserSettingsThunk({
          userId,
          patch: { security: { [key]: value } } as Partial<User>,
        })
      ).unwrap();
      toast.success('Đã cập nhật bảo mật');
    } catch (e: any) {
      toast.error(e?.message || 'Lỗi khi cập nhật');
    } finally {
      setSaving(false);
    }
  };

  const updateAccountSetting = async (key: string, value: any) => {
    if (!Number.isFinite(userId)) {
      toast.error('ID người dùng không hợp lệ');
      return;
    }
    setSaving(true);
    try {
      await dispatch(
        updateUserSettingsThunk({
          userId,
          patch: { settings: { [key]: value } } as Partial<User>,
        })
      ).unwrap();
      toast.success('Đã cập nhật cài đặt');
    } catch (e: any) {
      toast.error(e?.message || 'Lỗi khi cập nhật');
    } finally {
      setSaving(false);
    }
  };

  // ─── Password change ────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!currentPassword.trim()) errors.current = 'Vui lòng nhập mật khẩu hiện tại';
    if (!newPassword.trim()) errors.new = 'Vui lòng nhập mật khẩu mới';
    else if (newPassword.length < 6) errors.new = 'Mật khẩu mới tối thiểu 6 ký tự';
    if (!confirmPassword.trim()) errors.confirm = 'Vui lòng xác nhận mật khẩu mới';
    else if (newPassword !== confirmPassword) errors.confirm = 'Mật khẩu xác nhận không khớp';

    if (Object.keys(errors).length > 0) {
      setPwErrors(errors);
      return;
    }

    setPwErrors({});
    setPwLoading(true);
    try {
      if (!Number.isFinite(userId)) throw new Error('ID người dùng không hợp lệ');
      await dataService.changePassword(userId, currentPassword, newPassword);
      toast.success('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.message || 'Đổi mật khẩu thất bại');
      if (err?.message?.includes('hiện tại')) {
        setPwErrors({ current: err.message });
      }
    } finally {
      setPwLoading(false);
    }
  };

  // ─── Logout all devices ──────────────────────────────────────
  const handleLogoutAllDevices = async () => {
    setLogoutLoading(true);
    try {
      if (!Number.isFinite(userId)) throw new Error('ID người dùng không hợp lệ');
      await dataService.logoutAllDevices(userId);
      toast.success('Đã đăng xuất khỏi tất cả thiết bị khác');
      setLogoutModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Thao tác thất bại');
    } finally {
      setLogoutLoading(false);
    }
  };

  // ─── Notification items config ───────────────────────────────
  const notificationItems = [
    {
      key: 'notification_email_promo',
      label: 'Nhận email khuyến mãi',
      desc: 'Gửi các ưu đãi đặc biệt qua email của bạn',
      value: prefs.notification_email_promo ?? false,
    },
    {
      key: 'notification_sms_order',
      label: 'Nhận SMS cập nhật đơn hàng',
      desc: 'Thông báo trạng thái đơn hàng qua tin nhắn văn bản',
      value: prefs.notification_sms_order ?? true,
    },
    {
      key: 'notification_push_order',
      label: 'Nhận thông báo đơn hàng',
      desc: 'Cập nhật ứng dụng khi đơn hàng đang được giao',
      value: prefs.notification_push_order ?? true,
    },
    {
      key: 'notification_promo',
      label: 'Nhận thông báo khuyến mãi',
      desc: 'Thông báo đẩy về các sự kiện flash sale hàng ngày',
      value: prefs.notification_promo ?? true,
    },
    {
      key: 'notification_system',
      label: 'Nhận thông báo từ Lotte Mart',
      desc: 'Tin tức hệ thống và các thay đổi quan trọng',
      value: prefs.notification_system ?? false,
    },
  ];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Không rõ';
    try {
      return new Date(dateStr).toLocaleString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <header className="mb-2">
        <h1 className="text-3xl font-extrabold font-headline text-on-surface mb-2">Cài đặt</h1>
        <p className="text-on-surface-variant text-lg">
          Quản lý mật khẩu, bảo mật và tùy chọn thông báo của bạn
        </p>
      </header>

      {/* ════════════════ Security Section ════════════════ */}
      <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-surface-container-high rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">lock</span>
          </div>
          <h2 className="text-xl font-bold font-headline">Mật khẩu &amp; Bảo mật</h2>
        </div>

        {/* Change Password Form */}
        <form onSubmit={handleChangePassword} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current password */}
            <div className="space-y-2 col-span-2 md:col-span-1">
              <label htmlFor="currentPw" className="text-sm font-semibold text-on-surface-variant px-1">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <input
                  id="currentPw"
                  aria-label="Mật khẩu hiện tại"
                  className={`w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/40 transition-all outline-none ${
                    pwErrors.current ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="••••••••"
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <span
                  className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 cursor-pointer hover:text-on-surface"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                >
                  {showCurrentPw ? 'visibility_off' : 'visibility'}
                </span>
              </div>
              {pwErrors.current && (
                <p className="text-xs text-red-500 px-1">{pwErrors.current}</p>
              )}
            </div>

            <div className="md:col-span-1"></div>

            {/* New password */}
            <div className="space-y-2">
              <label htmlFor="newPw" className="text-sm font-semibold text-on-surface-variant px-1">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  id="newPw"
                  aria-label="Mật khẩu mới"
                  className={`w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/40 transition-all outline-none ${
                    pwErrors.new ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="Nhập mật khẩu mới"
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <span
                  className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 cursor-pointer hover:text-on-surface"
                  onClick={() => setShowNewPw(!showNewPw)}
                >
                  {showNewPw ? 'visibility_off' : 'visibility'}
                </span>
              </div>
              {pwErrors.new && (
                <p className="text-xs text-red-500 px-1">{pwErrors.new}</p>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <label htmlFor="confirmPw" className="text-sm font-semibold text-on-surface-variant px-1">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <input
                  id="confirmPw"
                  aria-label="Xác nhận mật khẩu mới"
                  className={`w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/40 transition-all outline-none ${
                    pwErrors.confirm ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="Xác nhận mật khẩu"
                  type={showConfirmPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <span
                  className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 cursor-pointer hover:text-on-surface"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                >
                  {showConfirmPw ? 'visibility_off' : 'visibility'}
                </span>
              </div>
              {pwErrors.confirm && (
                <p className="text-xs text-red-500 px-1">{pwErrors.confirm}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pwLoading}
              className="px-8 py-3 bg-signature-gradient text-on-primary font-bold rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:translate-y-[-2px] transition-all active:scale-95 disabled:opacity-50"
            >
              {pwLoading ? 'Đang lưu...' : 'Đổi mật khẩu'}
            </button>
          </div>

          {/* 2FA & Login Security */}
          <div className="pt-6 mt-8 space-y-6">
            {/* 2FA Toggle */}
            <div className="flex items-center justify-between py-4">
              <div className="flex gap-4 items-start">
                <div className="mt-1 w-10 h-10 bg-surface-container-high rounded-lg flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified_user
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-on-surface">Xác thực 2 yếu tố</h3>
                  <p className="text-sm text-on-surface-variant">
                    Thêm một lớp bảo mật cho tài khoản của bạn
                  </p>
                </div>
              </div>
              <Toggle
                checked={security.two_factor_enabled ?? false}
                onChange={(val) => updateSecurity('two_factor_enabled', val)}
                disabled={saving}
                ariaLabel="Bật/tắt xác thực 2 yếu tố"
              />
            </div>

            {/* Login info */}
            <div className="bg-surface-container-low p-6 rounded-xl flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-on-surface">Bảo mật đăng nhập</h3>
                <p className="text-sm text-on-surface-variant">
                  Đang đăng nhập trên: {security.last_login_device || 'Không rõ'}
                </p>
                <p className="text-[11px] font-medium text-green-600 uppercase tracking-wider">
                  Lần đăng nhập cuối: {formatDate(security.last_login_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLogoutModalOpen(true)}
                className="text-sm font-bold text-primary px-4 py-2 hover:bg-primary-fixed rounded-lg transition-colors"
              >
                Đăng xuất khỏi tất cả thiết bị
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* ════════════════ Notifications Section ════════════════ */}
      <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-surface-container-high rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">notifications_active</span>
          </div>
          <h2 className="text-xl font-bold font-headline">Tùy chọn thông báo</h2>
        </div>

        <div className="space-y-2">
          {notificationItems.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-5 px-4 rounded-xl hover:bg-surface-container-low transition-colors"
            >
              <div>
                <h4 className="font-bold text-on-surface">{item.label}</h4>
                <p className="text-sm text-on-surface-variant">{item.desc}</p>
              </div>
              <Toggle
                checked={item.value}
                onChange={(val) => updatePreference(item.key, val)}
                disabled={saving}
                ariaLabel={item.label}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════ Account Settings Section ════════════════ */}
      <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-surface-container-high rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">tune</span>
          </div>
          <h2 className="text-xl font-bold font-headline">Tùy chọn tài khoản</h2>
        </div>

        <div className="space-y-2">
          {/* Language */}
          <div className="flex items-center justify-between py-5 px-4 rounded-xl hover:bg-surface-container-low transition-colors">
            <div>
              <h4 className="font-bold text-on-surface">Ngôn ngữ</h4>
              <p className="text-sm text-on-surface-variant">Chọn ngôn ngữ hiển thị</p>
            </div>
            <select
              aria-label="Chọn ngôn ngữ"
              value={settings.language || 'vi'}
              onChange={(e) => updateAccountSetting('language', e.target.value)}
              disabled={saving}
              className="bg-surface-container-highest border-none rounded-lg px-4 py-2 text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/40 outline-none cursor-pointer"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
              <option value="ko">한국어</option>
            </select>
          </div>

          {/* Profile visibility */}
          <div className="flex items-center justify-between py-5 px-4 rounded-xl hover:bg-surface-container-low transition-colors">
            <div>
              <h4 className="font-bold text-on-surface">Hiển thị hồ sơ</h4>
              <p className="text-sm text-on-surface-variant">Cho phép người khác xem hồ sơ của bạn</p>
            </div>
            <Toggle
              checked={settings.privacy_profile_visible ?? true}
              onChange={(val) => updateAccountSetting('privacy_profile_visible', val)}
              disabled={saving}
              ariaLabel="Ẩn/hiện hồ sơ"
            />
          </div>

          {/* Marketing */}
          <div className="flex items-center justify-between py-5 px-4 rounded-xl hover:bg-surface-container-low transition-colors">
            <div>
              <h4 className="font-bold text-on-surface">Nhận thông tin marketing</h4>
              <p className="text-sm text-on-surface-variant">Nhận thông tin ưu đãi và chương trình mới</p>
            </div>
            <Toggle
              checked={settings.marketing_opt_in ?? true}
              onChange={(val) => updateAccountSetting('marketing_opt_in', val)}
              disabled={saving}
              ariaLabel="Nhận thông tin marketing"
            />
          </div>

          {/* SMS opt-in (phone visibility) */}
          <div className="flex items-center justify-between py-5 px-4 rounded-xl hover:bg-surface-container-low transition-colors">
            <div>
              <h4 className="font-bold text-on-surface">Hiển thị số điện thoại</h4>
              <p className="text-sm text-on-surface-variant">
                {user.phone ? `SĐT: ${user.phone}` : 'Chưa cập nhật số điện thoại'} — Nhận SMS quảng cáo
              </p>
            </div>
            <Toggle
              checked={settings.sms_opt_in ?? true}
              onChange={(val) => updateAccountSetting('sms_opt_in', val)}
              disabled={saving}
              ariaLabel="Hiển thị/ẩn số điện thoại"
            />
          </div>
        </div>
      </section>

      {/* ─── Confirm logout modal ────────────────────────────── */}
      <ConfirmModal
        open={logoutModalOpen}
        title="Đăng xuất tất cả thiết bị?"
        message="Bạn sẽ được giữ đăng nhập trên thiết bị hiện tại. Tất cả các phiên đăng nhập khác sẽ bị kết thúc."
        onConfirm={handleLogoutAllDevices}
        onCancel={() => setLogoutModalOpen(false)}
        loading={logoutLoading}
      />
    </div>
  );
};

export default Settings;