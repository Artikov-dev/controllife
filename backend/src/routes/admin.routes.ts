import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { auth } from '../middlewares/auth';
import { admin } from '../middlewares/admin';

const router = Router();

router.use(auth, admin); // Protect all routes for admins only

router.get('/users', AdminController.getUsers);
router.patch('/users/:id/block', AdminController.blockUser);
router.get('/stats', AdminController.getStats);

export default router;
