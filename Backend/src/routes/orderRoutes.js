import { Router } from 'express';
import { 
  createOrder, 
  getOrders, 
  getOrderById 
} from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All order operations require JWT authentication
router.use(authenticateToken);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);

export default router;
