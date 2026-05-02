import type { AdminAuthResponse } from '../types/admin.type';
import httpClient from '../../api/httpClient';
import { endpoints } from '../../api/endpoints';

const mapAdmin = (raw: any) => {
  const roleId = Number(raw?.role_id || 0);
  let role = raw?.role || raw?.role_key || 'admin';
  if (!raw?.role && !raw?.role_key) {
    if (roleId === 1) role = 'super_admin';
    else if (roleId === 4) role = 'manager';
    else if (roleId === 5) role = 'staff';
    else role = 'admin';
  }

  return {
    ...raw,
    id: String(raw?.id || raw?._id || ''),
    name: raw?.name || raw?.full_name || raw?.username || raw?.email || 'Admin',
    role,
    role_id: roleId || raw?.role_id,
    role_key: raw?.role_key || role,
    branch: String(raw?.branch || raw?.branch_id || ''),
    branch_id: raw?.branch_id ? String(raw.branch_id) : undefined,
    permissions: Array.isArray(raw?.permissions) ? raw.permissions : [],
  };
};

export const adminAuthService = {
  loginAdmin: async (email: string, password: string): Promise<AdminAuthResponse> => {
    try {
      const response = await httpClient.post<{ success: boolean; data: any }>(endpoints.adminAuth.login, { email, password });
      const body = response?.data?.data || response?.data || response;
      return {
        token: body.token,
        admin: mapAdmin(body.admin),
      };
    } catch (apiError: any) {
      // If backend returned a structured error, re-throw its message
      const msg = apiError?.response?.data?.message || apiError?.message || 'Sai email hoặc mật khẩu';
      throw new Error(msg);
    }
  }
};
