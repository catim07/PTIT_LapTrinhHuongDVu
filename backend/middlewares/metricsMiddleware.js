import logger from '../utils/logger.js';

export const trackPerformance = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationMs = (diff[0] * 1e3) + (diff[1] * 1e-6);

    if (durationMs > 500) {
      logger.warn(`SLOW API: ${req.method} ${req.originalUrl} took ${durationMs.toFixed(2)}ms`, {
        requestId: req.id,
        duration: durationMs,
        method: req.method,
        url: req.originalUrl
      });
    } else {
      logger.info(`PERF: ${req.method} ${req.originalUrl} took ${durationMs.toFixed(2)}ms`, {
        requestId: req.id,
        duration: durationMs
      });
    }
  });

  next();
};
