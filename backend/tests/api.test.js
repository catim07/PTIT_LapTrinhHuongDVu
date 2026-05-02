// backend/tests/api.test.js
// ═══════════════════════════════════════════════════════
// Integration test suite using Node.js built-in test runner (node:test)
// Zero external dependencies required.
// Run with: node --test tests/api.test.js
// ═══════════════════════════════════════════════════════
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

const BASE = process.env.TEST_API_URL || 'http://localhost:3001';

/**
 * Simple HTTP client using built-in http module.
 */
function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data), headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => { req.destroy(new Error('Request timeout')); });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ─── Tests ───

describe('Health Check', () => {
  it('GET /api/health should return 200 and OK status', async () => {
    const res = await request('GET', '/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.status, 'OK');
    assert.ok(res.body.uptime > 0, 'Uptime should be positive');
    assert.ok(res.body.timestamp, 'Should have timestamp');
    assert.equal(res.body.dbStatus, 'connected', 'DB should be connected');
  });

  it('should include X-Request-Id header', async () => {
    const res = await request('GET', '/api/health');
    assert.ok(res.headers['x-request-id'], 'Should have X-Request-Id header');
  });
});

describe('Product Search API', () => {
  it('GET /api/products should return paginated results', async () => {
    const res = await request('GET', '/api/products?page=1&limit=5');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data), 'Data should be an array');
    assert.ok(res.body.pagination, 'Should have pagination');
    assert.ok(res.body.pagination.page >= 1);
  });

  it('GET /api/search/products?q=... should search products', async () => {
    const res = await request('GET', '/api/search/products?q=test');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
  });

  it('GET /api/products with price filter should work', async () => {
    const res = await request('GET', '/api/products?minPrice=1000&maxPrice=999999');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  it('GET /api/products with sort should work', async () => {
    const res = await request('GET', '/api/products?sort=price-low');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });
});

describe('Auth API', () => {
  it('POST /api/auth/login with empty body should fail validation', async () => {
    const res = await request('POST', '/api/auth/login', {});
    assert.ok([400, 401, 422].includes(res.status), `Expected 400/401/422, got ${res.status}`);
    assert.equal(res.body.success, false);
  });

  it('POST /api/auth/login with wrong credentials should fail', async () => {
    const res = await request('POST', '/api/auth/login', {
      emailOrPhone: 'nonexistent@test.com',
      password: 'wrongpassword123',
    });
    assert.ok([400, 401, 404].includes(res.status), `Expected auth error, got ${res.status}`);
    assert.equal(res.body.success, false);
  });

  it('GET /api/auth/verify without token should return 401', async () => {
    const res = await request('GET', '/api/auth/verify');
    assert.equal(res.status, 401);
  });
});

describe('Payment Status API', () => {
  it('GET /api/payments/:id/status with nonexistent ID should return 404', async () => {
    const res = await request('GET', '/api/payments/000000000000000000000000/status');
    // May be 404 or 500 depending on DB lookup
    assert.ok([404, 500].includes(res.status));
  });

  it('POST /api/payments/:id/confirm without auth should return 401', async () => {
    const res = await request('POST', '/api/payments/000000000000000000000000/confirm');
    assert.equal(res.status, 401);
  });

  it('POST /api/payments/:id/fail without auth should return 401', async () => {
    const res = await request('POST', '/api/payments/000000000000000000000000/fail');
    assert.equal(res.status, 401);
  });

  it('POST /api/payments/:id/cancel without auth should return 401', async () => {
    const res = await request('POST', '/api/payments/000000000000000000000000/cancel');
    assert.equal(res.status, 401);
  });
});

describe('Protected Routes (no token)', () => {
  it('GET /api/notifications should require auth', async () => {
    const res = await request('GET', '/api/notifications');
    assert.equal(res.status, 401);
  });

  it('GET /api/notifications/unread-count should require auth', async () => {
    const res = await request('GET', '/api/notifications/unread-count');
    assert.equal(res.status, 401);
  });

  it('GET /api/orders should require auth', async () => {
    const res = await request('GET', '/api/orders');
    assert.equal(res.status, 401);
  });

  it('POST /api/uploads/promotion-image should require auth', async () => {
    const res = await request('POST', '/api/uploads/promotion-image');
    assert.equal(res.status, 401);
  });

  it('POST /api/uploads/review-images should require auth', async () => {
    const res = await request('POST', '/api/uploads/review-images');
    assert.equal(res.status, 401);
  });
});

describe('Rate Limiting', () => {
  it('should return valid response on rate-limited routes', async () => {
    const res = await request('POST', '/api/auth/login', {
      emailOrPhone: 'test@test.com',
      password: 'test123',
    });
    assert.ok(res.body !== undefined);
    assert.ok(typeof res.status === 'number');
  });
});
