import { Router } from 'express';
import {
  getPriceAlerts,
  createOrUpdatePriceAlert,
  updatePriceAlert,
  deletePriceAlert,
} from '../controllers/priceAlertController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All price alert operations require JWT authentication
router.use(authenticateToken);

router.get('/', getPriceAlerts);
router.post('/', createOrUpdatePriceAlert);
router.patch('/:productId', updatePriceAlert);
router.delete('/:productId', deletePriceAlert);

export default router;
