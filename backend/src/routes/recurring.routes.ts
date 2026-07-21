import { Router } from 'express';
import { RecurringTransactionController } from '../controllers/recurring.controller';
import { auth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createRecurringSchema } from '../validators/recurring.validator';

const router = Router();

router.use(auth); // Protect all routes

router.get('/', RecurringTransactionController.getRecurring);
router.post('/', validate(createRecurringSchema), RecurringTransactionController.createRecurring);
router.delete('/:id', RecurringTransactionController.deleteRecurring);

export default router;
