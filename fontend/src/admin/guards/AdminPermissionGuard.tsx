import React from 'react';
import { useAppSelector } from '../../store';
import { hasPermission, isSuperAdmin } from '../utils/permission';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface Props {
  permission?: string;
  superAdminOnly?: boolean;
  children: React.ReactElement;
}

const AccessDenied: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-4xl text-red-600">lock</span>
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-3">{t('rbac.accessDenied')}</h2>
      <p className="text-slate-500 max-w-md mb-6">{t('rbac.accessDeniedDesc')}</p>
      <button
        onClick={() => navigate('/admin/dashboard')}
        className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        {t('rbac.backToDashboard')}
      </button>
    </div>
  );
};

const AdminPermissionGuard: React.FC<Props> = ({ permission, superAdminOnly, children }) => {
  const admin = useAppSelector((s) => s.adminAuth.admin);

  if (superAdminOnly && !isSuperAdmin(admin)) {
    return <AccessDenied />;
  }

  if (permission && !hasPermission(admin, permission)) {
    return <AccessDenied />;
  }

  return children;
};

export default AdminPermissionGuard;
