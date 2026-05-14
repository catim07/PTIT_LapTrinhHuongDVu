import mongoose from 'mongoose';

/**
 * DB Circuit Breaker Middleware — checks real MongoDB connection state.
 *
 * Strategy:
 * - If Mongoose is connected (readyState 1) → always allow
 * - If Mongoose is connecting (readyState 2) → allow (let controllers handle)
 * - If Mongoose is disconnected/disconnecting (readyState 0/3) → return 503
 *   BUT only for DB-dependent routes (skip health, static assets, etc.)
 *
 * This replaces the old failure-counter approach that could get permanently stuck.
 */
export const dbCircuitBreakerMiddleware = (req, res, next) => {
  // Always allow these paths through regardless of DB state
  const bypassPaths = ['/api/health', '/uploads', '/api-docs', '/swagger'];
  const path = req.originalUrl || req.url || '';
  if (bypassPaths.some(bp => path.startsWith(bp))) {
    return next();
  }

  const dbState = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (dbState === 1 || dbState === 2) {
    return next();
  }

  // DB is disconnected — return 503 with Retry-After header
  return res.status(503).json({
    success: false,
    message: 'Hệ thống đang kết nối lại cơ sở dữ liệu, vui lòng thử lại sau.',
    retryAfter: 10,
  });
};

// Keep these exports for backward compatibility (other modules may import them)
export const reportDbError = () => {
  // No-op — we now rely on mongoose.connection.readyState directly
};

export const reportDbSuccess = () => {
  // No-op — we now rely on mongoose.connection.readyState directly
};
