import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { hasPermission } from '../utils/permission';

interface Props {
  permission?: string;
  children: React.ReactElement;
}

const AdminPermissionGuard: React.FC<Props> = ({ permission, children }) => {
  const admin = useAppSelector((s) => s.adminAuth.admin);

  if (permission && !hasPermission(admin, permission)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default AdminPermissionGuard;
