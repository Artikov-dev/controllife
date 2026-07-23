"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const transaction_routes_1 = __importDefault(require("./routes/transaction.routes"));
const budget_routes_1 = __importDefault(require("./routes/budget.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const recurring_routes_1 = __importDefault(require("./routes/recurring.routes"));
const public_routes_1 = __importDefault(require("./routes/public.routes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const swagger_1 = require("./config/swagger");
const app = (0, express_1.default)();
// Security middlewares (contentSecurityPolicy disabled for Swagger UI rendering)
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
}));
app.use((0, cors_1.default)({
    origin: true, // Dynamically reflects request origin (supports Vercel, localhost, etc.)
    credentials: true,
}));
app.use(express_1.default.json());
// Swagger API Documentation UI (Gold & Black Theme)
app.use('/api-docs', swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.swaggerSpec, swagger_1.swaggerUiOptions));
// General rate limiter to prevent DOS
const apiLimiter = (0, express_rate_limit_1.default)({
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
app.use('/api/auth', auth_routes_1.default);
app.use('/api/categories', category_routes_1.default);
app.use('/api/transactions', transaction_routes_1.default);
app.use('/api/budgets', budget_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/recurring', recurring_routes_1.default);
app.use('/api/public', public_routes_1.default);
// Error Handling
app.use(errorHandler_1.errorHandler);
exports.default = app;
