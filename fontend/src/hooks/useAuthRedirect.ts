import { useNavigate } from 'react-router-dom';

export function useAuthRedirect() {
  const navigate = useNavigate();
  const redirectToLogin = (state?: any) => {
    navigate('/login', { state });
  };
  return redirectToLogin;
}
