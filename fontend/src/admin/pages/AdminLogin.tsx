import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { adminLogin, clearAdminError } from '../slices/adminAuthSlice';

const AdminLogin: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
    const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((state) => state.adminAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      dispatch(clearAdminError());
      return;
    }

    const resultAction = await dispatch(adminLogin({ email, password }));
    if (adminLogin.fulfilled.match(resultAction)) {
      navigate('/admin/dashboard', { replace: true });
    }
  };

  return (
    <div className="relative min-h-screen bg-surface text-on-surface flex flex-col items-center justify-center overflow-hidden font-body antialiased">
      {/* Background Texture */}
      <div className="absolute inset-0 bg-subtle-pattern pointer-events-none" />
      
      {/* Animated Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary-container/20 rounded-full blur-3xl" />

      <main className="relative z-10 w-full max-w-[480px] px-6">
        {/* Logo & Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-4">
            <span className="text-primary font-black text-4xl tracking-tighter uppercase">Lotte Mart</span>
          </div>
          <h1 className="text-on-surface font-headline text-2xl font-bold tracking-tight mb-2">
            Hệ thống Quản trị Master
          </h1>
          <p className="text-secondary text-sm font-medium opacity-70">
            Vui lòng đăng nhập để tiếp tục điều hành hệ thống.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_20px_40px_rgba(25,28,30,0.06)] p-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            
            {/* Admin ID / Email */}
            <div className="space-y-2">
              <label className="block text-on-surface text-xs font-bold uppercase tracking-wider">
                Email hoặc Admin ID
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
                <input
                  className="w-full bg-surface-container-low border-none rounded-xl py-3.5 pl-11 pr-4 text-on-surface text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none placeholder:text-secondary/50"
                  placeholder="admin@lottemart.vn"
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) dispatch(clearAdminError());
                  }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-on-surface text-xs font-bold uppercase tracking-wider">
                  Mật khẩu
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <input
                  className="w-full bg-surface-container-low border-none rounded-xl py-3.5 pl-11 pr-12 text-on-surface text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none placeholder:text-secondary/50"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) dispatch(clearAdminError());
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-secondary hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  className="peer h-5 w-5 rounded border-none bg-surface-container-high text-primary focus:ring-primary/20 transition-all cursor-pointer"
                  type="checkbox"
                />
                <span className="text-sm text-secondary font-medium group-hover:text-on-surface transition-colors">
                  Ghi nhớ phiên đăng nhập
                </span>
              </label>
              <a href="#" className="text-sm font-semibold text-primary hover:text-primary-container transition-colors">
                Quên mật khẩu?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-primary hover:bg-primary-container text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Đang đăng nhập...' : 'Đăng nhập hệ thống'}
              <span className="material-symbols-outlined text-[20px]">{status === 'loading' ? 'hourglass_empty' : 'login'}</span>
            </button>
          </form>

          {/* Branch selector removed from login page */}
        </div>

        {/* Footer Info */}
        <footer className="mt-10 text-center space-y-4">
          <p className="text-sm text-secondary font-medium">
            Vui lòng liên hệ <span className="text-on-surface font-bold">Bộ phận IT</span> nếu gặp sự cố truy cập.
          </p>
          <div className="flex items-center justify-center gap-6 opacity-40 grayscale hover:opacity-100 transition-opacity">
            <img
              className="h-6 w-auto"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCev-ZA-MHmKBePJrx2eTF5MSatXftQ-T4XTev4OUMVHBtiA2XTsCCmD0G2acwNAxqwAWJSREzVagnCzIORG26mY8BA08-ylRa6grsVA0uDH8vCDStgFU2nmEyhxlTF-o47nAFewU1UVEioDkaq4hDMuzDhuH9pML2DjyB-q1yY0YOrnbQ13YyLb7BgGgv9Lwa01un_I3d9ua0h3acsyy9YiclXD0w8EiLtzOeTXttwvUFJH-sAP3ooJqa6rqOE3K8pPlwKGrs1BI"
              alt="Security badge"
            />
            <div className="h-4 w-[1px] bg-outline-variant" />
            <img
              className="h-6 w-auto"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnJ0Oau7HqjA4RaWYWGSrkeGzW6626qotZF7vzt2Fvka5TN4VLWkaJx8KbW19RopFDHlqiELyOGFd1qZtD8mQ4-lp_1p3fFuSqyQHnhEJyish9INAKRVXv8HXcOXAc-Z8_4pattj_Eu2ovuGKE_bgRAdw7o93f1vKt_77ahV23JPyFyREHHD962ZfGOJW8HjOJR9Jbx8Xj3lpGbF2k_d-QsIPtmxfZYui6Di86Ui0_dCZAHdbwHOb24V-mxAZFkb4YJ6HJKhTZ9k4"
              alt="Enterprise badge"
            />
          </div>
          <p className="text-[10px] text-secondary/60 font-medium tracking-widest uppercase">
            © 2024 Lotte Mart Vietnam • Internal Security Protocol v4.2
          </p>
        </footer>
      </main>

      {/* Floating Support Button */}
      <div className="fixed bottom-8 right-8">
        <button type="button" className="h-14 w-14 bg-surface-container-lowest text-secondary rounded-full shadow-lg border border-surface-container-high flex items-center justify-center hover:text-primary hover:shadow-xl transition-all">
          <span className="material-symbols-outlined text-[24px]">contact_support</span>
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
