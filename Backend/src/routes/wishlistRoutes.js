import { Router } from 'express';
import { 
  getWishlist, 
  addToWishlist, 
  removeFromWishlist 
} from '../controllers/wishlistController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All wishlist routes require authentication
router.use(authenticateToken);

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:productId', removeFromWishlist);

export default router;
