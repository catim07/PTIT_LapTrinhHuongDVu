// backend/utils/circuitBreaker.js
export class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000; // 30s
    this.failureCount = 0;
    this.nextAttempt = null;
    this.fallback = options.fallback || null;
  }

  async fire(action, ...args) {
    if (this.state === 'OPEN') {
      if (Date.now() > this.nextAttempt) {
        this.state = 'HALF_OPEN';
      } else {
        if (this.fallback) return this.fallback();
        throw new Error(`CircuitBreaker [${this.name}] is OPEN. Fast failing.`);
      }
    }

    try {
      const result = await action(...args);
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      if (this.fallback) return this.fallback();
      throw err;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
      console.warn(`[CIRCUIT BREAKER] ${this.name} tripped! OPEN state. Retry in ${this.resetTimeout}ms`);
    }
  }
}
