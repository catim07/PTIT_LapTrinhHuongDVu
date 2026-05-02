import logger from '../utils/logger.js';
import { logSecurityEvent } from '../utils/auditLogger.js';
import { reportDbError } from './dbCircuitBreaker.js';

let errorCount = 0;
let errorTimer = null;

/**
 * Standardized error response format for Frontend Error Boundary support.
 * 
 * Every error response follows this contract:
 * {
 *   success: false,
 *   message: string,          // Human-readable error message
 *   errorCode: string,        // Machine-readable error code for frontend routing
 *   requestId: string,        // Trace ID for debugging
 *   timestamp: string,        // ISO timestamp
 *   statusCode: number,       // HTTP status code (mirrored in body for easy frontend access)
 * }
 * 
 * Frontend can use `errorCode` to decide which fallback UI to render:
 *   - VALIDATION_ERROR   → show field-level errors
 *   - AUTH_ERROR          → redirect to login
 *   - FORBIDDEN           → show access denied
 *   - NOT_FOUND           → show 404 page
 *   - CONFLICT            → show retry / conflict resolution
 *   - RATE_LIMITED        → show cooldown message
 *   - SERVICE_UNAVAILABLE → show maintenance page
 *   - INTERNAL_ERROR      → show generic error boundary
 */
export const errorHandler = (err, req, res, _next) => {
  logger.error(`[ERROR] ${req.method} ${req.originalUrl}: ${err.message}`, { 
    requestId: req.id, 
    stack: err.stack,
    body: req.body 
  });
  
  const status = err.status || err.statusCode || 500;
  
  // Determine machine-readable error code
  let errorCode = 'INTERNAL_ERROR';
  if (status === 400) errorCode = err.errorCode || 'VALIDATION_ERROR';
  else if (status === 401) errorCode = 'AUTH_ERROR';
  else if (status === 403) errorCode = 'FORBIDDEN';
  else if (status === 404) errorCode = 'NOT_FOUND';
  else if (status === 409) errorCode = 'CONFLICT';
  else if (status === 429) errorCode = 'RATE_LIMITED';
  else if (status === 503) errorCode = 'SERVICE_UNAVAILABLE';

  // Report to DB circuit breaker on MongoDB errors
  if (status === 500 && err.name === 'MongooseError' || err.name === 'MongoServerError') {
    reportDbError();
  }

  if (status === 500) {
    errorCount++;
    if (!errorTimer) {
      errorTimer = setTimeout(() => {
        if (errorCount >= 10) {
          logSecurityEvent({ userId: req.user?._id || null, action: 'HIGH_ERROR_RATE', resource: 'System', details: { count: errorCount }, ip: req.ip, requestId: req.id, status: 'SUSPICIOUS' });
        }
        errorCount = 0;
        errorTimer = null;
      }, 60000);
    }
  }

  res.status(status).json({
    success: false,
    message: status === 500 ? 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.' : (err.message || 'Internal server error'),
    errorCode,
    statusCode: status,
    requestId: req.id,
    timestamp: new Date().toISOString(),
    ...(err.errors ? { errors: err.errors } : {}), // Validation field errors
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    errorCode: 'NOT_FOUND',
    statusCode: 404,
    requestId: req.id,
    timestamp: new Date().toISOString(),
  });
};
