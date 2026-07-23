import { Router } from 'express';
import { PublicController } from '../controllers/public.controller';
import { auth } from '../middlewares/auth';

const router = Router();

// Public route - Read-only shared dashboard (No Auth needed)
router.get('/shared/:shareToken', PublicController.getSharedDashboard);

// Protected user share-link management routes (Auth required)
router.get('/share-status', auth, PublicController.getShareStatus);
router.post('/share-link', auth, PublicController.generateShareLink);
router.delete('/share-link', auth, PublicController.revokeShareLink);

export default router;
