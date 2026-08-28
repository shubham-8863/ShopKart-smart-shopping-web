import { Router } from 'express';
import { register, login, getCurrentUser } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Public auth routes
router.post('/register', register);
router.post('/login', login);

// Protected auth routes
router.get('/me', authenticateToken, getCurrentUser);

export default router;
