import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store';
import { AccountSidebar } from '../components/AccountSidebar';

const AccountLayout: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  const location = useLocation();

  if (!user) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} />;
  }

  return (
    <div className="flex min-h-[100dvh] bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased">
      <AccountSidebar currentUser={user} />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AccountLayout;
