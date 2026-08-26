import { Router } from 'express';
import {
  getCategories,
  getProducts,
  getProductById,
} from '../controllers/productController.js';

const router = Router();

// Categories
router.get('/categories', getCategories);

// Products
router.get('/products', getProducts);
router.get('/products/:id', getProductById);

export default router;
