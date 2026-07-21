import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import { auth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createTransactionSchema, updateTransactionSchema } from '../validators/transaction.validator';

const router = Router();

router.use(auth); // Protect all routes

router.get('/dashboard', TransactionController.getDashboardData);
router.get('/', TransactionController.getTransactions);
router.post('/', validate(createTransactionSchema), TransactionController.createTransaction);
router.put('/:id', validate(updateTransactionSchema), TransactionController.updateTransaction);
router.delete('/:id', TransactionController.deleteTransaction);

export default router;
