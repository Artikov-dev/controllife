import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import transactionRoutes from './routes/transaction.routes';
import budgetRoutes from './routes/budget.routes';
import adminRoutes from './routes/admin.routes';
import recurringRoutes from './routes/recurring.routes';
import { errorHandler } from './middlewares/errorHandler';
import { swaggerUi, swaggerSpec, swaggerUiOptions } from './config/swagger';

const app = express();

// Security middlewares (contentSecurityPolicy disabled for Swagger UI rendering)
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(
  cors({
    origin: true, // Dynamically reflects request origin (supports Vercel, localhost, etc.)
    credentials: true,
  })
);

app.use(express.json());

// Swagger API Documentation UI (Gold & Black Theme)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));


// General rate limiter to prevent DOS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

app.use('/api', apiLimiter);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// App Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recurring', recurringRoutes);

// Error Handling
app.use(errorHandler);

export default app;

