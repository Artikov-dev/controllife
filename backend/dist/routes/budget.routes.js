"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const budget_controller_1 = require("../controllers/budget.controller");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const budget_validator_1 = require("../validators/budget.validator");
const router = (0, express_1.Router)();
router.use(auth_1.auth); // Protect all routes
router.get('/', budget_controller_1.BudgetController.getBudgets);
router.post('/', (0, validate_1.validate)(budget_validator_1.budgetSchema), budget_controller_1.BudgetController.upsertBudget);
router.delete('/:id', budget_controller_1.BudgetController.deleteBudget);
exports.default = router;
