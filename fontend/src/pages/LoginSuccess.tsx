import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { authVerify, hydrateOAuthSession } from '../slices/authSlice';

const decodeUser = (encoded: string | null) => {
  if (!encoded) return null;

  try {
    const raw = decodeURIComponent(encoded);
    const base64 = raw.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

const sanitizeNextPath = (raw: string | null): string => {
  const value = String(raw || '').trim();
  if (!value) return '/';
  if (value.startsWith('/') && !value.startsWith('//')) return value;

  try {
    const parsed = new URL(value);
    if (parsed.origin !== window.location.origin) return '/';
    return `${parsed.pathname || '/'}${parsed.search || ''}${parsed.hash || ''}`;
  } catch {
    return '/';
  }
};

import { useTranslation } from 'react-i18next';

const LoginSuccess = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = (searchParams.get('token') || '').trim();
    const refreshToken = (searchParams.get('refresh_token') || '').trim();
    const user = decodeUser(searchParams.get('user'));
    const nextPath = sanitizeNextPath(searchParams.get('next'));

    if (!token) {
      navigate('/login?oauth_error=missing_token', { replace: true });
      return;
    }

    localStorage.setItem('lottemart_token', token);
    localStorage.setItem('accessToken', token);

    if (refreshToken) {
      localStorage.setItem('lottemart_refresh_token', refreshToken);
      localStorage.setItem('refreshToken', refreshToken);
    }

    if (user) {
      dispatch(hydrateOAuthSession({ token, refreshToken: refreshToken || undefined, user }));
      navigate(nextPath, { replace: true });
      return;
    }

    dispatch(authVerify() as any)
      .then(() => {
        navigate(nextPath, { replace: true });
      })
      .catch(() => {
        navigate('/login?oauth_error=verify_failed', { replace: true });
      });
  }, [dispatch, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700">
      <p className="text-sm font-medium">{t('auth.processingSocialLogin', 'Đang xử lý đăng nhập...')}</p>
    </div>
  );
};

export default LoginSuccess;
