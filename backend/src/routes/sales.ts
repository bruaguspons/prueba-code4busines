import { Router } from 'express';
import { getSales, postSale, evaluateSale } from '../controllers/salesController';

const router = Router();

router.get('/', getSales);
router.post('/', postSale);
router.post('/:id/evaluate', evaluateSale);

export default router;
