// src/admin/types/admin.type.ts
export interface AdminUser {
  id: string;
  _id?: string;
  email: string;
  username?: string;
  full_name?: string;
  name?: string;
  role?: 'admin' | 'super_admin' | 'manager' | 'staff' | string;
  role_key?: string;
  role_id?: number;
  permissions?: string[];
  status?: 'active' | 'inactive' | string;
  branch?: string;
  branch_id?: string;
}

export interface AdminAuthResponse {
  admin: AdminUser;
  token: string;
}
