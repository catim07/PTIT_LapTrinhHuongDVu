// backend/config/swagger.js
// ═══════════════════════════════════════════════════════
// Swagger / OpenAPI Configuration
// ═══════════════════════════════════════════════════════
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lotte Mart API',
      version: '1.0.0',
      description: `
## Enterprise Ecommerce API

Full-featured REST API for the Lotte Mart ecommerce platform.

### Features
- **Authentication** — JWT + refresh token rotation + reuse detection
- **Products** — CRUD, search, recommendations, compare
- **Orders** — Lifecycle management, timeline tracking, idempotency
- **Payments** — COD, QR Transfer with stateful flow
- **Inventory** — FIFO deduction with distributed locking
- **Notifications** — Real-time via Socket.IO + polling
- **Admin** — Analytics, audit logs, feature flags, backup management
- **Caching** — Redis with circuit breaker + in-memory fallback
- **Background Jobs** — BullMQ with Dead Letter Queue

### Authentication
Most endpoints require a Bearer JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`
      `,
      contact: {
        name: 'Lotte Mart Dev Team',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'API (backward compatible)',
      },
      {
        url: '/api/v1',
        description: 'API v1 (versioned)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error description' },
            requestId: { type: 'string', example: 'uuid-v4' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Sữa tươi TH True Milk 1L' },
            price: { type: 'number', example: 32000 },
            category_name: { type: 'string', example: 'Sữa & Sản phẩm từ sữa' },
            sku: { type: 'string', example: 'TH-MILK-001' },
            stock: { type: 'number', example: 150 },
            is_active: { type: 'boolean', example: true },
            rating: { type: 'number', example: 4.5 },
          },
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user_id: { type: 'string' },
            status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED'] },
            total_amount: { type: 'number' },
            items: { type: 'array', items: { type: 'object' } },
            payment: { type: 'object' },
            timeline: { type: 'array', items: { type: 'object' } },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            full_name: { type: 'string' },
            role_id: { type: 'number' },
            membership_level: { type: 'string' },
            lotte_points: { type: 'number' },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'System health & status' },
      { name: 'Auth', description: 'Authentication & authorization' },
      { name: 'Products', description: 'Product catalog management' },
      { name: 'Orders', description: 'Order lifecycle management' },
      { name: 'Cart', description: 'Shopping cart operations' },
      { name: 'Payments', description: 'Payment processing' },
      { name: 'Notifications', description: 'User notifications' },
      { name: 'Admin', description: 'Admin dashboard & management' },
      { name: 'Branches', description: 'Branch/store management' },
      { name: 'Promotions', description: 'Promotions & coupons' },
      { name: 'Loyalty', description: 'Loyalty points & membership' },
    ],
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'System health check',
          description: 'Returns system status, uptime, DB connection state, and memory usage.',
          responses: {
            200: {
              description: 'System is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      status: { type: 'string', example: 'OK' },
                      uptime: { type: 'number' },
                      dbStatus: { type: 'string', example: 'connected' },
                      timestamp: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'User login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['emailOrPhone', 'password'],
                  properties: {
                    emailOrPhone: { type: 'string', example: 'user@example.com' },
                    password: { type: 'string', example: 'password123' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'User registration',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['username', 'email', 'password', 'phone'],
                  properties: {
                    username: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' },
                    phone: { type: 'string' },
                    full_name: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Registration successful' },
            400: { description: 'Validation error' },
          },
        },
      },
      '/products': {
        get: {
          tags: ['Products'],
          summary: 'List products (paginated)',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'minPrice', in: 'query', schema: { type: 'number' } },
            { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
            { name: 'sort', in: 'query', schema: { type: 'string', enum: ['price-low', 'price-high', 'newest', 'rating'] } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'Paginated product list' },
          },
        },
      },
      '/products/{id}': {
        get: {
          tags: ['Products'],
          summary: 'Get product detail',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Product detail' },
            404: { description: 'Product not found' },
          },
        },
      },
      '/products/recommendations': {
        get: {
          tags: ['Products'],
          summary: 'Smart product recommendations',
          parameters: [
            { name: 'category_id', in: 'query', schema: { type: 'string' } },
            { name: 'min_price', in: 'query', schema: { type: 'number' } },
            { name: 'max_price', in: 'query', schema: { type: 'number' } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: { 200: { description: 'Recommended products' } },
        },
      },
      '/orders': {
        get: {
          tags: ['Orders'],
          summary: 'Get user orders',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Order list' },
            401: { description: 'Unauthorized' },
          },
        },
        post: {
          tags: ['Orders'],
          summary: 'Create a new order',
          security: [{ bearerAuth: [] }],
          responses: {
            201: { description: 'Order created' },
            409: { description: 'Insufficient stock' },
          },
        },
      },
      '/cart': {
        get: {
          tags: ['Cart'],
          summary: 'Get cart items',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Cart contents' } },
        },
      },
      '/notifications': {
        get: {
          tags: ['Notifications'],
          summary: 'Get user notifications',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Notification list' } },
        },
      },
      '/admin/analytics': {
        get: {
          tags: ['Admin'],
          summary: 'Admin analytics dashboard',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Analytics data' } },
        },
      },
      '/admin/failed-jobs': {
        get: {
          tags: ['Admin'],
          summary: 'View failed background jobs (DLQ)',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of failed jobs' } },
        },
      },
      '/admin/feature-flags': {
        get: {
          tags: ['Admin'],
          summary: 'Get all feature flags',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Feature flags list' } },
        },
      },
      '/admin/backups': {
        get: {
          tags: ['Admin'],
          summary: 'Get backup history',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Backup history' } },
        },
        post: {
          tags: ['Admin'],
          summary: 'Trigger manual backup',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Backup initiated' } },
        },
      },
    },
  },
  apis: [], // We define paths inline above
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: `
      .swagger-ui .topbar { background-color: #d32f2f; }
      .swagger-ui .topbar .download-url-wrapper .select-label span { color: #fff; }
    `,
    customSiteTitle: 'Lotte Mart API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
    },
  }));

  // Also serve the raw JSON spec
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(swaggerSpec);
  });

  console.log('✅ Swagger docs available at /api/docs');
}
