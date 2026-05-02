import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { login, loginWithGoogle, sendOTP, verifyOTP, clearAuthMessages, hydrateOAuthSession } from '../slices/authSlice';
import { toast } from '../components/Toast/toastEvent';
import { setupGoogleSignIn } from '../utils/googleIdentity';
import { authService } from '../services/authService';

const Login: React.FC = () => {
  const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
  const isGoogleConfigured = googleClientId.length > 0;
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [errors, setErrors] = useState<{identifier?:string, password?:string, form?:string}>({});

  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const getErrorText = (error: unknown, fallback: string) => {
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error) {
      return (error as { message?: string }).message || fallback;
    }
    return fallback;
  };

  const mapGoogleAuthError = (error: unknown): string => {
    const text = getErrorText(error, 'Đăng nhập Google thất bại');
    const normalized = text.toLowerCase();

    if (normalized.includes('popup')) {
      return 'Popup Google đã bị chặn hoặc đã đóng. Vui lòng cho phép popup và thử lại.';
    }

    if (normalized.includes('origin') || normalized.includes('not allowed')) {
      return 'Google OAuth chưa cho phép domain hiện tại. Vui lòng cấu hình Authorized JavaScript origins trên Google Cloud Console.';
    }

    if (normalized.includes('credential')) {
      return 'Google không trả về credential hợp lệ. Vui lòng thử lại.';
    }

    if (normalized.includes('chưa sẵn sàng') || normalized.includes('initialize')) {
      return 'Không thể khởi tạo Google Identity Services. Vui lòng tải lại trang.';
    }

    return text;
  };

  const getSafeRedirect = () => {
    const searchParams = new URLSearchParams(location.search);
    const redirect = searchParams.get('redirect');

    if (
      redirect &&
      redirect.startsWith('/') &&
      redirect !== '/login' &&
      redirect !== '/register' &&
      !redirect.startsWith('/admin') &&
      !redirect.includes('redirect=')
    ) {
      return redirect;
    }

    return '/';
  };

  const handlePostLoginRedirect = () => {
    navigate(getSafeRedirect(), { replace: true });
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const oauthToken = searchParams.get('oauth_token');
    const oauthRefresh = searchParams.get('oauth_refresh') || undefined;
    const oauthUser = searchParams.get('oauth_user');
    const oauthError = searchParams.get('oauth_error');
    const oauthMessage = searchParams.get('oauth_message');

    if (oauthError) {
      setErrors({ form: oauthMessage || 'Đăng nhập Facebook thất bại. Vui lòng thử lại.' });
      return;
    }

    if (oauthToken && oauthUser) {
      try {
        const raw = decodeURIComponent(oauthUser);
        const base64 = raw.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
        const user = JSON.parse(atob(padded));
        dispatch(hydrateOAuthSession({ token: oauthToken, refreshToken: oauthRefresh, user }));
        handlePostLoginRedirect();
      } catch (err) {
        setErrors({ form: 'Không thể xử lý dữ liệu đăng nhập Facebook.' });
      }
    }
  }, [location.search, dispatch]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('expired')) {
      toast.warning("Phiên đã hết hạn, vui lòng đăng nhập lại");
    }
  }, [location.search]);

  useEffect(() => {
    if (!isGoogleConfigured) {
      return;
    }
    
    setupGoogleSignIn({
      containerId: 'google-login-btn-container',
      onSuccess: async (credential) => {
        dispatch(clearAuthMessages());
        setSocialLoading('google');
        try {
          await dispatch(loginWithGoogle(credential)).unwrap();
          handlePostLoginRedirect();
        } catch (err: any) {
          setErrors({ form: mapGoogleAuthError(err) });
        } finally {
          setSocialLoading(null);
        }
      },
      onError: (errMessage) => {
        setSocialLoading(null);
        setErrors({ form: errMessage });
      }
    });

  }, [isGoogleConfigured, dispatch]);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCountdown]);

  useEffect(() => {
    if (authState.error) {
      setErrors((prev) => ({ ...prev, form: authState.error || undefined }));
    }
  }, [authState.error]);

  // Real-time validation
  useEffect(() => {
    if (Object.keys(errors).length > 0 && !errors.form) {
      validate();
    }
  }, [identifier, password]);

  function validate() {
    const e:any = {};
    if (loginMode === 'password') {
      if (!identifier) e.identifier = 'Vui lòng nhập email hoặc số điện thoại.';
      if (!password) e.password = 'Vui lòng nhập mật khẩu.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    dispatch(clearAuthMessages());
    try {
      await dispatch(login({ emailOrPhone: identifier, password })).unwrap();
      handlePostLoginRedirect();
    } catch (err: any) {
      setErrors({ form: getErrorText(err, 'Đăng nhập thất bại') });
    }
  }



  const handleFacebookLogin = async () => {
    dispatch(clearAuthMessages());
    setSocialLoading('facebook');
    try {
      const nextPath = getSafeRedirect();
      window.location.href = authService.getFacebookOAuthUrl(nextPath);
    } catch (err: any) {
      setErrors({ form: getErrorText(err, 'Đăng nhập Facebook thất bại') });
      setSocialLoading(null);
    } finally {
      // no-op: redirect flow handles loading state
    }
  };

  const handleSendOTP = async () => {
    if (!phone.trim()) {
      setErrors({ form: 'Vui lòng nhập số điện thoại' });
      return;
    }
    dispatch(clearAuthMessages());
    try {
      await dispatch(sendOTP(phone.trim())).unwrap();
      setResendCountdown(60);
      toast.success('Mã OTP đã được gửi');
    } catch (err: any) {
      setErrors({ form: getErrorText(err, 'Gửi OTP thất bại') });
    }
  };

  const handleVerifyOTP = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!phone.trim() || !otp.trim()) {
      setErrors({ form: 'Vui lòng nhập đầy đủ số điện thoại và OTP' });
      return;
    }
    dispatch(clearAuthMessages());
    try {
      await dispatch(verifyOTP({ phone: phone.trim(), otp: otp.trim() })).unwrap();
      handlePostLoginRedirect();
    } catch (err: any) {
      setErrors({ form: getErrorText(err, 'Xác thực OTP thất bại') });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased">
      {/* Left Side: Illustrative Banner (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary/10">
        <div
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-60"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC0vaFcvRm0NyqmZh5tQaEcOGY7W6X08oj_iaRWnbSIibquhhza_mYSoJTNCVrqL0O2S5xlDSsZvDBSpMSIO-L8z-tIEA_0qSpFgLAsoV0LVXL4ovN_1golU_F2JrI7plsdhXRYtneBLDFNUbemDES_cqr3fCfKsA6k_XNRDin7PebVpp3Op3zd5IiGMkhWRUphSmjderaX0Rg2-4fzUhpkAZrwXJygWYKW1o5Q2qxPo3OoGVzFspMzbdpfa8WK_520bnrKZFGhuTc")',
          }}
        />
        <div className="relative z-10 flex flex-col justify-center px-20 text-slate-900 dark:text-slate-100">
          <div className="mb-8 flex items-center gap-3">
            <div className="p-3 bg-primary rounded-xl text-white">
              <span className="material-symbols-outlined text-3xl">shopping_cart</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Lotte Mart</h1>
          </div>
          <h2 className="text-5xl font-black leading-tight mb-6">
            Trải nghiệm mua sắm <br />
            <span className="text-primary">tiện lợi tại nhà</span>
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 max-w-md leading-relaxed">
            Hàng ngàn sản phẩm tươi ngon, chất lượng từ Lotte Mart đang chờ đón bạn. Đăng nhập ngay để nhận ưu đãi độc quyền.
          </p>
          <div className="mt-12 flex gap-4">
            <div className="flex -space-x-3">
              <img
                className="h-10 w-10 rounded-full border-2 border-white"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXpp7ANLy-cW-fHpKcURla6hBSP_UlYCZbNnxuC0ayWPALta8dFxn9mNxKFVsevtBkcnpXzeRZ5dq7rwTyZ7m0Zb17JgPhNBQJOOCyYXo31BvkkYUGUm3KxooFh_9cHaQOR3MLuZqkRIGKq5a9LgbWA9s9dKnyRWBGP9-T8qGVdnj6DrTloqhFiMVWJVWsKE7use9pQbB1h5pjib6KYBbVpuAZoNGzjAozLuDpZvzy6r64Wam7T5exwFOMp9QrQjwBLXKyu1oQ0dw"
                alt="User avatar 1"
              />
              <img
                className="h-10 w-10 rounded-full border-2 border-white"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHVrzc9rlOiZwcGMAz0oIa7AFxK831BW_DL-woMP8v1AnDk1ptdZa6FLA-CCfYH83DNlIldje7JBqHbUBIPJdOWKVHeBar0hOQaJnX3lXi7-I6SHN72vZYvbcNf-julCBvYBJAlyCSWBCzLXQthPCe1iniABUP2UTOKMIYCLxI737dhhJ3E4wIBOneit93hkRQby1En9ARzAR8Ca49k0R-ByLgsC3WBQwhQhm7HLHWi_9Ol3jshbriN5aEy7Y6FHU1sOlSqu8B4G4"
                alt="User avatar 2"
              />
              <img
                className="h-10 w-10 rounded-full border-2 border-white"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpozpESZBnPQ1xMaX-NaO28RkjLMd08a2nGVudSdW9eikqj9gDL4D2yhntsxDyZR0uTlbMojLex9sA5JMP-3kQ9B7HYX2KQdWRL3M0hgzFwxjtMDfJFjluYJlM4dJet-WrwEZ8K1x4pCl-t5mXf3mDhAnIUwZnJK1y8RruOYHOw96aSC9FPmt9QEDg_zpZGPzdSiw3UqWRhsM9c9TEgn97oOOBG2euyQLzRmQXWXq6VECMU8Y6kXqz4mSn-6jXBnpWYFQy1eMW_0Q"
                alt="User avatar 3"
              />
            </div>
            <p className="text-sm font-medium flex items-center text-slate-600 dark:text-slate-400">
              Hơn 1tr+ khách hàng tin dùng
            </p>
          </div>
        </div>

        {/* Abstract decorative elements */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-20 -mb-20 blur-3xl" />
        <div className="absolute top-0 left-0 w-48 h-48 bg-primary/10 rounded-full -ml-10 -mt-10 blur-2xl" />
      </div>

      {/* Right Side: Login Form - CĂN GIỮA THEO CHIỀU NGANG */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-background-dark">
        <div className="w-full max-w-120 flex flex-col items-center">
          {/* Header Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined">shopping_bag</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Lotte Mart</span>
          </div>

          <div className="mb-10 text-center">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Chào mừng trở lại!</h3>
            <p className="text-slate-500 dark:text-slate-400">Vui lòng nhập thông tin để tiếp tục mua sắm</p>
          </div>

          <div className="w-full grid grid-cols-2 gap-2 mb-5">
            <button
              type="button"
              onClick={() => {
                setLoginMode('password');
                setErrors({});
                dispatch(clearAuthMessages());
              }}
              className={`px-4 py-2 rounded-xl font-semibold border transition ${loginMode === 'password' ? 'bg-primary text-white border-primary' : 'bg-white text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'}`}
            >
              Email/Password
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('otp');
                setErrors({});
                dispatch(clearAuthMessages());
              }}
              className={`px-4 py-2 rounded-xl font-semibold border transition ${loginMode === 'otp' ? 'bg-primary text-white border-primary' : 'bg-white text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'}`}
            >
              Phone OTP
            </button>
          </div>

          {errors.form && <div className="w-full p-3 mb-4 bg-red-100 text-red-600 rounded-lg text-sm font-medium">{errors.form}</div>}
          {authState.successMessage && !errors.form && (
            <div className="w-full p-3 mb-4 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">{authState.successMessage}</div>
          )}

          {loginMode === 'password' ? (
          <form className="w-full space-y-5" onSubmit={onSubmit}>
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email hoặc SĐT</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  mail
                </span>
                <input
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border ${errors.identifier ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-white`}
                  placeholder="email@example.com hoặc 0912..."
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  aria-invalid={!!errors.identifier}
                />
              </div>
              {errors.identifier && <div className="text-red-500 text-sm mt-1 font-medium">{errors.identifier}</div>}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mật khẩu</label>
                <a className="text-sm font-semibold text-primary hover:underline" href="#">
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  lock
                </span>
                <input
                  className={`w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-white`}
                  placeholder="Nhập mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && <div className="text-red-500 text-sm mt-1 font-medium">{errors.password}</div>}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                className="h-5 w-5 text-primary focus:ring-primary border-slate-300 rounded transition-all cursor-pointer"
                id="remember-me"
                type="checkbox"
              />
              <label className="ml-3 text-sm text-slate-600 dark:text-slate-400 cursor-pointer" htmlFor="remember-me">
                Ghi nhớ tôi
              </label>
            </div>

            {/* Submit Button */}
            <button
              className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] disabled:opacity-70"
              type="submit"
              disabled={authState.loading}
            >
              {authState.loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
          ) : (
            <form className="w-full space-y-4" onSubmit={handleVerifyOTP}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Số điện thoại</label>
                <input
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-white"
                  placeholder="Nhập số điện thoại"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={handleSendOTP}
                disabled={authState.loading || resendCountdown > 0}
                className="w-full py-3 border border-primary text-primary font-semibold rounded-xl disabled:opacity-50"
              >
                {resendCountdown > 0 ? `Gửi lại OTP sau ${resendCountdown}s` : 'Gửi OTP'}
              </button>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mã OTP</label>
                <input
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-white"
                  placeholder="Nhập mã OTP"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>

              <button
                className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] disabled:opacity-70"
                type="submit"
                disabled={authState.loading}
              >
                {authState.loading ? 'Đang xác thực OTP...' : 'Xác thực OTP'}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-8 w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-background-dark text-slate-500">Hoặc tiếp tục với</span>
            </div>
          </div>

          {/* Social Sign In */}
          <div className={`grid ${isGoogleConfigured ? 'grid-cols-2' : 'grid-cols-1'} gap-4 w-full`}>
            {isGoogleConfigured ? (
              <div 
                id="google-login-btn-container" 
                className="flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white rounded-xl overflow-hidden shadow-sm"
              ></div>
            ) : (
              <div className="flex items-center justify-center py-3 px-4 border border-amber-300 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium">
                Google Sign-In chưa được cấu hình
              </div>
            )}
            <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={authState.loading || socialLoading !== null}
              className="flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
            >
              <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-sm font-semibold">{socialLoading === 'facebook' ? 'Đang mở Facebook...' : 'Continue with Facebook'}</span>
            </button>
          </div>

          {/* Footer Text */}
          <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-bold text-primary hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;