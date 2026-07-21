import { Router } from 'express';
import { BudgetController } from '../controllers/budget.controller';
import { auth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { budgetSchema } from '../validators/budget.validator';

const router = Router();

router.use(auth); // Protect all routes

router.get('/', BudgetController.getBudgets);
router.post('/', validate(budgetSchema), BudgetController.upsertBudget);
router.delete('/:id', BudgetController.deleteBudget);

export default router;
