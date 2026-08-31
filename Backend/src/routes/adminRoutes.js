import { Router } from 'express';
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deactivateProduct,
} from '../controllers/adminProductController.js';
import {
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
} from '../controllers/adminOrderController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

const router = Router();

// Protect all admin routes with JWT authentication and Admin role verification
router.use(authenticateToken, requireAdmin);

// Admin Product Routes
router.get('/products', getAdminProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deactivateProduct);

// Admin Order Routes
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrderById);
router.patch('/orders/:id/status', updateOrderStatus);

export default router;
