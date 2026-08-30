import { Router } from 'express';
import { createReview, getProductReviews } from '../controllers/reviewController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Submit customer star rating (Requires verified purchase & auth)
router.post('/reviews', authenticateToken, createReview);

// Public review summary and breakdown for product
router.get('/products/:productId/reviews', getProductReviews);

export default router;
