import mongoose from 'mongoose';
import { CircuitBreaker } from '../utils/circuitBreaker.js';

const dbBreaker = new CircuitBreaker('MongoDB', {
  failureThreshold: 5,
  resetTimeout: 30000,
});

export const dbCircuitBreakerMiddleware = (req, res, next) => {
  if (dbBreaker.state === 'OPEN') {
    return res.status(503).json({
      success: false,
      message: 'Hệ thống đang quá tải hoặc gặp sự cố, vui lòng thử lại sau.'
    });
  }
  next();
};

export const reportDbError = () => {
  dbBreaker.onFailure();
};

export const reportDbSuccess = () => {
  dbBreaker.onSuccess();
};

// Monitor mongoose errors globally
mongoose.connection.on('error', (err) => {
  reportDbError();
});
mongoose.connection.on('connected', () => {
  reportDbSuccess();
});
