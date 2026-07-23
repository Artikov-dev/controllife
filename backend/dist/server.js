"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const PORT = env_1.env.PORT || 5000;
const startServer = async () => {
    try {
        // Test Database connection
        console.log('Connecting to PostgreSQL database...');
        const client = await db_1.pool.connect();
        console.log('Connected to PostgreSQL database successfully!');
        // Auto-migrate users table for required columns
        await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user',
      ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS share_token VARCHAR(64) UNIQUE,
      ADD COLUMN IF NOT EXISTS is_share_enabled BOOLEAN DEFAULT false
    `);
        console.log('Auto-migrations verified on database startup!');
        client.release();
        const server = app_1.default.listen(PORT, () => {
            console.log(`Server is running in ${env_1.env.NODE_ENV} mode on port ${PORT}`);
        });
        const shutdown = async () => {
            console.log('Shutting down gracefully...');
            server.close(() => {
                console.log('HTTP server closed.');
                db_1.pool.end(() => {
                    console.log('Database connection pool ended.');
                    process.exit(0);
                });
            });
        };
        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
