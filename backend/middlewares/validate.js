import { ZodError } from 'zod';
import logger from '../utils/logger.js';

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      // Zod v4 uses .issues, v3 uses .errors — support both
      const issues = err.issues || err.errors || [];
      logger.warn(`[ValidationFailed] ${req.method} ${req.originalUrl}`, {
        errors: issues,
        requestId: req.id,
        ip: req.ip
      });
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu đầu vào không hợp lệ',
        errors: Array.isArray(issues) ? issues.map(e => ({ path: (e.path || []).join('.'), message: e.message })) : []
      });
    }
    next(err);
  }
};
