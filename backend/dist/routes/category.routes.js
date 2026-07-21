"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const category_validator_1 = require("../validators/category.validator");
const router = (0, express_1.Router)();
router.use(auth_1.auth); // Protect all routes
router.get('/', category_controller_1.CategoryController.getCategories);
router.post('/', (0, validate_1.validate)(category_validator_1.createCategorySchema), category_controller_1.CategoryController.createCategory);
router.put('/:id', (0, validate_1.validate)(category_validator_1.updateCategorySchema), category_controller_1.CategoryController.updateCategory);
router.delete('/:id', category_controller_1.CategoryController.deleteCategory);
exports.default = router;
