import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminAuthService } from '../services/adminAuthService';
import type { AdminUser, AdminAuthResponse } from '../types/admin.type';
import { isManagerRole } from '../utils/permission';
import httpClient from '../../api/httpClient';
import { endpoints } from '../../api/endpoints';

interface AdminAuthState {
  admin: AdminUser | null;
  token: string | null;
  adminBranchId: string;
  status: 'idle' | 'loading' | 'success' | 'failed';
  error: string | null;
  /** True while the initial session verification is in progress (page load / refresh) */
  _initialized: boolean;
}

const loadAdminFromStorage = (): AdminAuthState => {
  let adminBranchId = 'ALL';
  try {
    const savedBranch = localStorage.getItem('admin_current_branch_id');
    if (savedBranch) adminBranchId = savedBranch;
  } catch (e) {}

  try {
    const token = localStorage.getItem('admin_token');
    const adminStr = localStorage.getItem('admin_user');
    if (token && adminStr) {
      return {
        admin: JSON.parse(adminStr),
        token,
        adminBranchId,
        status: 'success',
        error: null,
        // We have cached data but haven't verified the token yet
        _initialized: false,
      };
    }
  } catch (e) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }
  return {
    admin: null,
    token: null,
    adminBranchId,
    status: 'idle',
    error: null,
    // No stored credentials — nothing to verify, we're done
    _initialized: true,
  };
};

export const adminLogin = createAsyncThunk<
  AdminAuthResponse,
  { email: string; password: string },
  { rejectValue: string }
>(
  'adminAuth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await adminAuthService.loginAdmin(email, password);
      // Save to localStorage
      localStorage.setItem('admin_token', response.token);
      localStorage.setItem('admin_user', JSON.stringify(response.admin));
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error occurred during admin login');
    }
  }
);

export const adminLogout = createAsyncThunk('adminAuth/logout', async () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  localStorage.removeItem('admin_current_branch_id');
});

/**
 * Verify the stored admin token against the backend on page load / refresh.
 * This ensures the admin session is still valid and re-hydrates permissions.
 */
export const adminVerifySession = createAsyncThunk<
  AdminAuthResponse,
  void,
  { rejectValue: string }
>(
  'adminAuth/verifySession',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      return rejectWithValue('No admin session');
    }

    try {
      const response = await httpClient.get(endpoints.adminAuth.verify, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = response?.data?.data || response?.data || response;
      const admin = body?.admin || body?.user || body;
      if (!admin) {
        throw new Error('Invalid admin verify response');
      }

      // Normalize admin object (same mapping as adminAuthService)
      const roleId = Number(admin.role_id || 0);
      let role = admin.role || admin.role_key || 'admin';
      if (!admin.role && !admin.role_key) {
        if (roleId === 1) role = 'super_admin';
        else if (roleId === 4) role = 'manager';
        else if (roleId === 5) role = 'staff';
        else role = 'admin';
      }

      const normalizedAdmin: AdminUser = {
        ...admin,
        id: String(admin.id || admin._id || ''),
        name: admin.name || admin.full_name || admin.username || admin.email || 'Admin',
        role,
        role_id: roleId || admin.role_id,
        role_key: admin.role_key || role,
        branch: String(admin.branch || admin.branch_id || ''),
        branch_id: admin.branch_id ? String(admin.branch_id) : undefined,
        permissions: Array.isArray(admin.permissions) ? admin.permissions : [],
      };

      // Update localStorage with fresh data
      localStorage.setItem('admin_user', JSON.stringify(normalizedAdmin));

      return { token, admin: normalizedAdmin };
    } catch (err: any) {
      // Token is invalid — clear stored credentials
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      return rejectWithValue(err?.response?.data?.message || err?.message || 'Admin session expired');
    }
  }
);

const initialState: AdminAuthState = loadAdminFromStorage();

export const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    setAdminBranch: (state, action) => {
      state.adminBranchId = action.payload;
      localStorage.setItem('admin_current_branch_id', action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.status = 'success';
        state.admin = action.payload.admin;
        state.token = action.payload.token;
        state._initialized = true;
        if (state.admin && isManagerRole(state.admin)) {
          const mBranch = String(state.admin.branch_id || state.admin.branch || '');
          if (mBranch) {
            state.adminBranchId = mBranch;
            localStorage.setItem('admin_current_branch_id', mBranch);
          }
        }
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to login';
        state._initialized = true;
      })
      .addCase(adminLogout.fulfilled, (state) => {
        state.admin = null;
        state.token = null;
        state.adminBranchId = 'ALL';
        state.status = 'idle';
        state.error = null;
        state._initialized = true;
      })
      // Admin session verification (page load / refresh)
      .addCase(adminVerifySession.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(adminVerifySession.fulfilled, (state, action) => {
        state.status = 'success';
        state.admin = action.payload.admin;
        state.token = action.payload.token;
        state._initialized = true;
        if (state.admin && isManagerRole(state.admin)) {
          const mBranch = String(state.admin.branch_id || state.admin.branch || '');
          if (mBranch) {
            state.adminBranchId = mBranch;
            localStorage.setItem('admin_current_branch_id', mBranch);
          }
        }
      })
      .addCase(adminVerifySession.rejected, (state) => {
        state.admin = null;
        state.token = null;
        state.status = 'idle';
        state.error = null;
        state._initialized = true;
      });
  }
});

export const { clearAdminError, setAdminBranch } = adminAuthSlice.actions;

export default adminAuthSlice.reducer;
