import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ensureRbacSeed, getPermissionsForUser, isSuperAdmin } from '../services/rbacService.js';
import { logActivity } from '../services/auditService.js';

let rbacSeeded = false;

const ensureSeeded = async () => {
  if (!rbacSeeded) {
    await ensureRbacSeed();
    rbacSeeded = true;
  }
};

export const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: missing token' });
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password_hash -refresh_token');
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Unauthorized: invalid token' });
    }
    req.user = user;
    req.userId = user._id;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      const token = header.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password_hash -refresh_token');
      if (user && user.is_active) {
        req.user = user;
        req.userId = user._id;
      }
    }
  } catch {}
  next();
};

export const admin = (req, res, next) => {
  if (!req.user || Number(req.user.role_id) === 3 || req.user.role_key === 'customer') {
    return res.status(403).json({ success: false, message: 'Forbidden: admin access required' });
  }
  next();
};

export const requirePermission = (permissionKey) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      await ensureSeeded();

      if (Number(req.user.role_id) === 1) {
        return next();
      }

      const permissions = await getPermissionsForUser(req.user);
      req.user.permissions = permissions;

      const wildcardKey = `${String(permissionKey).split('.')[0]}.*`;
      if (permissions.includes(permissionKey) || permissions.includes(wildcardKey) || permissions.includes('*')) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Forbidden: missing permission ${permissionKey}`,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message || 'Permission check failed' });
    }
  };
};

/**
 * Middleware that restricts access to super_admin role ONLY.
 * Logs unauthorized access attempts for audit trail.
 */
export const requireSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (isSuperAdmin(req.user)) {
      return next();
    }

    // Log the unauthorized access attempt
    try {
      await logActivity({
        userId: req.userId,
        userName: req.user?.full_name || req.user?.username || 'Unknown',
        action: 'ACCESS_DENIED',
        entity: 'roles_permissions',
        entityId: null,
        details: {
          attempted_path: req.originalUrl,
          method: req.method,
          role_id: req.user.role_id,
          role_key: req.user.role_key,
        },
        ip: req.ip,
      });
    } catch (_auditErr) {
      // Audit logging should never block the response
    }

    return res.status(403).json({
      success: false,
      message: 'Forbidden: super admin access required',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Super admin check failed' });
  }
};

