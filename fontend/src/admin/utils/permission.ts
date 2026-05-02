import type { AdminUser } from '../types/admin.type';

const normalize = (value?: string) => String(value || '').trim().toLowerCase();

export const isSuperAdmin = (admin?: AdminUser | null): boolean => {
  if (!admin) return false;
  return Number(admin.role_id) === 1 || normalize(admin.role) === 'super_admin' || normalize(admin.role_key) === 'super_admin';
};

export const isManagerRole = (admin?: AdminUser | null): boolean => {
  if (!admin) return false;
  return Number(admin.role_id) === 4 || normalize(admin.role) === 'manager' || normalize(admin.role_key) === 'manager';
};

export const hasPermission = (admin: AdminUser | null | undefined, key: string): boolean => {
  if (!admin) return false;
  if (isSuperAdmin(admin)) return true;

  const requested = normalize(key);
  if (!requested) return true;

  const permissions = Array.isArray(admin.permissions) ? admin.permissions.map(normalize) : [];
  if (permissions.includes('*') || permissions.includes(requested)) return true;

  const wildcard = `${requested.split('.')[0]}.*`;
  return permissions.includes(wildcard);
};

export default { hasPermission, isSuperAdmin, isManagerRole };
