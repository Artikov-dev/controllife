"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_1 = require("../middlewares/auth");
const admin_1 = require("../middlewares/admin");
const router = (0, express_1.Router)();
router.use(auth_1.auth, admin_1.admin); // Protect all routes for admins only
router.get('/users', admin_controller_1.AdminController.getUsers);
router.patch('/users/:id/block', admin_controller_1.AdminController.blockUser);
router.get('/stats', admin_controller_1.AdminController.getStats);
exports.default = router;
