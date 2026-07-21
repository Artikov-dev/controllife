"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaction_controller_1 = require("../controllers/transaction.controller");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const transaction_validator_1 = require("../validators/transaction.validator");
const router = (0, express_1.Router)();
router.use(auth_1.auth); // Protect all routes
router.get('/dashboard', transaction_controller_1.TransactionController.getDashboardData);
router.get('/', transaction_controller_1.TransactionController.getTransactions);
router.post('/', (0, validate_1.validate)(transaction_validator_1.createTransactionSchema), transaction_controller_1.TransactionController.createTransaction);
router.put('/:id', (0, validate_1.validate)(transaction_validator_1.updateTransactionSchema), transaction_controller_1.TransactionController.updateTransaction);
router.delete('/:id', transaction_controller_1.TransactionController.deleteTransaction);
exports.default = router;
