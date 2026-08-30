import { Router } from 'express';
import { 
  getCart, 
  addCartItem, 
  updateCartItem, 
  removeCartItem, 
  clearCart 
} from '../controllers/cartController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All cart operations require authentication
router.use(authenticateToken);

router.get('/', getCart);
router.post('/items', addCartItem);
router.patch('/items/:productId', updateCartItem);
router.delete('/items/:productId', removeCartItem);
router.delete('/', clearCart);

export default router;
