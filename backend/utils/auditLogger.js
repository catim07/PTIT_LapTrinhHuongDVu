import logger from './logger.js';
import { AuditLog } from '../models/Misc.js';
import { enqueueJob } from '../services/queueService.js';

const WEBHOOK_URL = process.env.SECURITY_WEBHOOK_URL || null;

export const processAuditJob = async (logData) => {
  const { userId, action, resource, details, ip, requestId, status } = logData;
  try {
    if (status === 'FAILURE' || status === 'SUSPICIOUS') {
      logger.warn(`[SECURITY_ALERT] ${action} on ${resource}`, logData);
      if (WEBHOOK_URL && status === 'SUSPICIOUS') {
        fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 *SECURITY ALERT: ${action}*\nResource: ${resource}\nIP: ${ip}\nDetails: ${JSON.stringify(details)}`
          })
        }).catch(err => logger.error('Failed to send security webhook', { error: err.message }));
      }
    } else {
      logger.info(`[SECURITY_AUDIT] ${action} on ${resource}`, logData);
    }

    await AuditLog.create({
      user_id: userId,
      action: action,
      entity: resource,
      details: { ...details, ip, requestId, status }
    });
  } catch (error) {
    logger.error('Failed to write security audit log', { error: error.message, requestId });
  }
};

export const logSecurityEvent = async (data) => {
  enqueueJob('audit', 'audit_log', data).catch(err => {
    logger.error('Failed to enqueue audit log', { error: err.message });
  });
};
