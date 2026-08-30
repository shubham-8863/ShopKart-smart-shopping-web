import { Router } from 'express';
import { 
  getCurrentUserProfile, 
  updateCurrentUserProfile 
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All user profile endpoints require JWT authentication
router.use(authenticateToken);

router.get('/me', getCurrentUserProfile);
router.put('/me', updateCurrentUserProfile);

export default router;
