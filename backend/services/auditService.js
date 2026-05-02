// backend/services/auditService.js
// ═══════════════════════════════════════════════════════
// Audit Logging Service
// Every admin action is recorded into the audit_logs
// collection for compliance and traceability.
// ═══════════════════════════════════════════════════════
import { AuditLog } from '../models/Misc.js';

/**
 * Log an admin activity to the audit_logs collection.
 *
 * @param {Object} params
 * @param {string|number} params.userId   - The admin user performing the action
 * @param {string}        params.userName - Display name of the admin
 * @param {string}        params.action   - Action performed (e.g. 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE')
 * @param {string}        params.entity   - Entity type (e.g. 'product', 'order', 'branch_product', 'coupon')
 * @param {string|number} params.entityId - ID of the affected entity
 * @param {Object}        params.details  - Additional details / diff (old vs new values)
 * @param {string}        [params.ip]     - IP address of the request (optional)
 * @returns {Promise<AuditLog>}
 */
export async function logActivity({ userId, userName, action, entity, entityId, details = {}, ip = '' }) {
  try {
    const log = await AuditLog.create({
      user_id: userId,
      user_name: userName || 'System',
      action,
      entity,
      entity_id: entityId,
      details,
      ip,
    });
    return log;
  } catch (err) {
    // Audit logging should never crash the main flow
    console.error('[AuditService] Failed to write audit log:', err.message);
    return null;
  }
}

/**
 * Retrieve audit logs with optional filtering.
 *
 * @param {Object} [filter]
 * @param {string} [filter.entity]   - Filter by entity type
 * @param {string} [filter.action]   - Filter by action
 * @param {string} [filter.userId]   - Filter by admin user
 * @param {number} [filter.limit]    - Max records (default 100)
 * @param {number} [filter.skip]     - Offset
 * @returns {Promise<AuditLog[]>}
 */
export async function getAuditLogs(filter = {}) {
  const query = {};
  if (filter.entity) query.entity = filter.entity;
  if (filter.action) query.action = filter.action;
  if (filter.userId) query.user_id = filter.userId;

  return AuditLog.find(query)
    .sort({ created_at: -1 })
    .limit(filter.limit || 100)
    .skip(filter.skip || 0)
    .lean();
}

export default { logActivity, getAuditLogs };
