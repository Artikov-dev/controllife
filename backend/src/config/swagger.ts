import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

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
            color: { type: 'string', example: '#FF5733' },
            type: { type: 'string', enum: ['income', 'expense'], example: 'expense' },
          },
        },
        CategoryInput: {
          type: 'object',
          required: ['name', 'type'],
          properties: {
            name: { type: 'string', example: 'Food & Dining' },
            icon: { type: 'string', example: 'utensils' },
            color: { type: 'string', example: '#FF5733' },
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
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJSDoc(options);
export { swaggerUi };
