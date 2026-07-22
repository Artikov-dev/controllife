import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi, { SwaggerUiOptions } from 'swagger-ui-express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Tracker (Control Life) API',
      version: '1.0.0',
      description: 'REST API documentation for Finance Tracker application with authentication, transactions, categories, budgets, recurring items, and admin controls.',
      contact: {
        name: 'Finance Tracker Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token to authenticate requests',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: 'Error description message' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            full_name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            currency: { type: 'string', example: 'UZS' },
            is_blocked: { type: 'boolean', example: false },
            avatar: { type: 'string', nullable: true, example: null },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        RegisterInput: {
          type: 'object',
          required: ['full_name', 'email', 'password'],
          properties: {
            full_name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password', example: 'secret123' },
            currency: { type: 'string', example: 'UZS', default: 'UZS' },
            avatar: { type: 'string', example: '' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password', example: 'secret123' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Food & Dining' },
            icon: { type: 'string', example: 'utensils' },
            color: { type: 'string', example: '#FBBF24' },
            type: { type: 'string', enum: ['income', 'expense'], example: 'expense' },
          },
        },
        CategoryInput: {
          type: 'object',
          required: ['name', 'type'],
          properties: {
            name: { type: 'string', example: 'Food & Dining' },
            icon: { type: 'string', example: 'utensils' },
            color: { type: 'string', example: '#FBBF24' },
            type: { type: 'string', enum: ['income', 'expense'], example: 'expense' },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 10 },
            user_id: { type: 'integer', example: 1 },
            category_id: { type: 'integer', example: 2 },
            title: { type: 'string', example: 'Grocery shopping' },
            amount: { type: 'number', example: 150000 },
            description: { type: 'string', example: 'Weekly fruits and veggies' },
            transaction_date: { type: 'string', format: 'date', example: '2026-07-22' },
            type: { type: 'string', enum: ['income', 'expense'], example: 'expense' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        TransactionInput: {
          type: 'object',
          required: ['title', 'amount', 'transaction_date', 'type', 'category_id'],
          properties: {
            title: { type: 'string', example: 'Grocery shopping' },
            amount: { type: 'number', example: 150000 },
            description: { type: 'string', example: 'Weekly fruits and veggies' },
            transaction_date: { type: 'string', format: 'date', example: '2026-07-22' },
            type: { type: 'string', enum: ['income', 'expense'], example: 'expense' },
            category_id: { type: 'integer', example: 2 },
          },
        },
        Budget: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            month: { type: 'integer', example: 7 },
            year: { type: 'integer', example: 2026 },
            amount: { type: 'number', example: 5000000 },
          },
        },
        BudgetInput: {
          type: 'object',
          required: ['month', 'year', 'amount'],
          properties: {
            month: { type: 'integer', example: 7 },
            year: { type: 'integer', example: 2026 },
            amount: { type: 'number', example: 5000000 },
          },
        },
        RecurringTransaction: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            category_id: { type: 'integer', example: 3 },
            title: { type: 'string', example: 'Internet subscription' },
            amount: { type: 'number', example: 200000 },
            frequency: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'yearly'], example: 'monthly' },
            next_run: { type: 'string', format: 'date', example: '2026-08-01' },
          },
        },
        RecurringInput: {
          type: 'object',
          required: ['title', 'amount', 'frequency', 'category_id', 'next_run'],
          properties: {
            title: { type: 'string', example: 'Internet subscription' },
            amount: { type: 'number', example: 200000 },
            frequency: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'yearly'], example: 'monthly' },
            category_id: { type: 'integer', example: 3 },
            next_run: { type: 'string', format: 'date', example: '2026-08-01' },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Check API server health status',
          responses: {
            200: {
              description: 'Server is running',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user account',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterInput' },
              },
            },
          },
          responses: {
            201: { description: 'User successfully registered' },
            400: { description: 'Validation error or email already exists' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login with email and password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginInput' },
              },
            },
          },
          responses: {
            200: { description: 'Login successful, returns tokens and user info' },
            401: { description: 'Invalid credentials or account blocked' },
          },
        },
      },
      '/api/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh access token using refresh token',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    refreshToken: { type: 'string', example: 'your_refresh_token_here' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'New access token issued' },
            401: { description: 'Invalid or expired refresh token' },
          },
        },
      },
      '/api/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout current user',
          responses: {
            200: { description: 'Successfully logged out' },
          },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current user profile',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Profile details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/categories': {
        get: {
          tags: ['Categories'],
          summary: 'Get all categories for the authenticated user',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'List of user categories' },
          },
        },
        post: {
          tags: ['Categories'],
          summary: 'Create a new category',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CategoryInput' },
              },
            },
          },
          responses: {
            201: { description: 'Category created' },
          },
        },
      },
      '/api/categories/{id}': {
        put: {
          tags: ['Categories'],
          summary: 'Update category by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CategoryInput' },
              },
            },
          },
          responses: {
            200: { description: 'Category updated' },
          },
        },
        delete: {
          tags: ['Categories'],
          summary: 'Delete category by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          ],
          responses: {
            200: { description: 'Category deleted' },
          },
        },
      },
      '/api/transactions/dashboard': {
        get: {
          tags: ['Transactions'],
          summary: 'Get summary metrics and monthly stats for dashboard',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Dashboard metrics and overview' },
          },
        },
      },
      '/api/transactions': {
        get: {
          tags: ['Transactions'],
          summary: 'Get transactions list with filtering and pagination',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'type', in: 'query', schema: { type: 'string', enum: ['income', 'expense'] } },
            { name: 'category_id', in: 'query', schema: { type: 'integer' } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'Paginated transactions list' },
          },
        },
        post: {
          tags: ['Transactions'],
          summary: 'Create a new transaction',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TransactionInput' },
              },
            },
          },
          responses: {
            201: { description: 'Transaction created' },
          },
        },
      },
      '/api/transactions/{id}': {
        put: {
          tags: ['Transactions'],
          summary: 'Update transaction by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TransactionInput' },
              },
            },
          },
          responses: {
            200: { description: 'Transaction updated' },
          },
        },
        delete: {
          tags: ['Transactions'],
          summary: 'Delete transaction by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          ],
          responses: {
            200: { description: 'Transaction deleted' },
          },
        },
      },
      '/api/budgets': {
        get: {
          tags: ['Budgets'],
          summary: 'Get budget limit and progress for specific month/year',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'month', in: 'query', schema: { type: 'integer' } },
            { name: 'year', in: 'query', schema: { type: 'integer' } },
          ],
          responses: {
            200: { description: 'Budget info' },
          },
        },
        post: {
          tags: ['Budgets'],
          summary: 'Set or update budget limit for a month',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BudgetInput' },
              },
            },
          },
          responses: {
            200: { description: 'Budget set successfully' },
          },
        },
      },
      '/api/budgets/{id}': {
        delete: {
          tags: ['Budgets'],
          summary: 'Delete budget entry by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          ],
          responses: {
            200: { description: 'Budget deleted' },
          },
        },
      },
      '/api/recurring': {
        get: {
          tags: ['Recurring Transactions'],
          summary: 'Get recurring payment schedules',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'List of recurring transactions' },
          },
        },
        post: {
          tags: ['Recurring Transactions'],
          summary: 'Create a new recurring payment schedule',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RecurringInput' },
              },
            },
          },
          responses: {
            201: { description: 'Recurring transaction created' },
          },
        },
      },
      '/api/recurring/{id}': {
        delete: {
          tags: ['Recurring Transactions'],
          summary: 'Delete recurring payment schedule by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          ],
          responses: {
            200: { description: 'Recurring schedule deleted' },
          },
        },
      },
      '/api/admin/users': {
        get: {
          tags: ['Admin'],
          summary: 'Get all registered users list (Admin only)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'List of all users' },
            403: { description: 'Forbidden (Admin access required)' },
          },
        },
      },
      '/api/admin/users/{id}/block': {
        patch: {
          tags: ['Admin'],
          summary: 'Block or unblock a user (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    is_blocked: { type: 'boolean', example: true },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'User block status updated' },
          },
        },
      },
      '/api/admin/stats': {
        get: {
          tags: ['Admin'],
          summary: 'Get system-wide platform statistics (Admin only)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Global system statistics' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(options);

export const swaggerUiOptions: SwaggerUiOptions = {
  customSiteTitle: 'Finance Tracker API Docs 🟡',
  customCss: `
    body {
      background-color: #111111 !important;
      color: #f4f4f5 !important;
      font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
    }
    .swagger-ui .topbar {
      background-color: #18181b !important;
      border-bottom: 2px solid #FBBF24 !important;
      padding: 12px 0 !important;
    }
    .swagger-ui .topbar a span {
      color: #FBBF24 !important;
      font-weight: 700 !important;
      font-size: 1.25rem !important;
    }
    .swagger-ui .topbar .download-url-wrapper {
      display: none !important;
    }
    .swagger-ui .info {
      margin: 30px 0 !important;
    }
    .swagger-ui .info .title {
      color: #FBBF24 !important;
      font-weight: 800 !important;
    }
    .swagger-ui .info p, .swagger-ui .info li {
      color: #d4d4d8 !important;
    }
    .swagger-ui .scheme-container {
      background-color: #18181b !important;
      box-shadow: none !important;
      border: 1px solid rgba(251, 191, 36, 0.25) !important;
      border-radius: 12px !important;
    }
    .swagger-ui .btn.authorize {
      background-color: #FBBF24 !important;
      color: #111111 !important;
      border-color: #FBBF24 !important;
      font-weight: 700 !important;
      border-radius: 8px !important;
      transition: all 0.2s ease !important;
    }
    .swagger-ui .btn.authorize:hover {
      background-color: #FCD34D !important;
      border-color: #FCD34D !important;
      box-shadow: 0 0 15px rgba(251, 191, 36, 0.4) !important;
    }
    .swagger-ui .btn.authorize svg {
      fill: #111111 !important;
    }
    .swagger-ui .opblock-tag {
      color: #FBBF24 !important;
      border-bottom: 1px solid rgba(251, 191, 36, 0.25) !important;
      font-weight: 700 !important;
    }
    .swagger-ui .opblock {
      background: #18181b !important;
      border-radius: 12px !important;
      border: 1px solid rgba(251, 191, 36, 0.15) !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
      margin-bottom: 16px !important;
    }
    .swagger-ui .opblock .opblock-summary {
      border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
    }
    .swagger-ui .opblock .opblock-summary-method {
      border-radius: 6px !important;
      font-weight: 700 !important;
      text-shadow: none !important;
      background-color: #FBBF24 !important;
      color: #111111 !important;
    }
    .swagger-ui .opblock .opblock-summary-path {
      color: #f4f4f5 !important;
      font-weight: 600 !important;
    }
    .swagger-ui .opblock .opblock-summary-description {
      color: #a1a1aa !important;
    }
    .swagger-ui .opblock-description-wrapper p, 
    .swagger-ui .opblock-external-docs-wrapper p, 
    .swagger-ui .opblock-title_normal p {
      color: #d4d4d8 !important;
    }
    .swagger-ui table thead tr td, .swagger-ui table thead tr th {
      color: #FBBF24 !important;
      border-bottom: 1px solid rgba(251, 191, 36, 0.25) !important;
    }
    .swagger-ui .parameter__name {
      color: #FBBF24 !important;
    }
    .swagger-ui .parameter__type {
      color: #a1a1aa !important;
    }
    .swagger-ui input[type=text], .swagger-ui textarea, .swagger-ui select {
      background-color: #111111 !important;
      color: #f4f4f5 !important;
      border: 1px solid rgba(251, 191, 36, 0.3) !important;
      border-radius: 8px !important;
      padding: 8px 12px !important;
    }
    .swagger-ui input[type=text]:focus, .swagger-ui textarea:focus, .swagger-ui select:focus {
      border-color: #FBBF24 !important;
      outline: none !important;
      box-shadow: 0 0 10px rgba(251, 191, 36, 0.3) !important;
    }
    .swagger-ui .btn.execute {
      background-color: #FBBF24 !important;
      color: #111111 !important;
      border-color: #FBBF24 !important;
      font-weight: 700 !important;
      border-radius: 8px !important;
    }
    .swagger-ui .btn.execute:hover {
      background-color: #FCD34D !important;
      border-color: #FCD34D !important;
    }
    .swagger-ui .highlight-code pre, .swagger-ui .microlight {
      background: #111111 !important;
      color: #FBBF24 !important;
      border-radius: 8px !important;
      border: 1px solid rgba(251, 191, 36, 0.2) !important;
    }
    .swagger-ui section.models {
      border: 1px solid rgba(251, 191, 36, 0.25) !important;
      border-radius: 12px !important;
      background: #18181b !important;
    }
    .swagger-ui section.models h4 {
      color: #FBBF24 !important;
    }
    .swagger-ui .model-title {
      color: #FBBF24 !important;
    }
    .swagger-ui .model {
      color: #d4d4d8 !important;
    }
    .swagger-ui .prop-type {
      color: #FCD34D !important;
    }
  `,
};

export { swaggerUi };
