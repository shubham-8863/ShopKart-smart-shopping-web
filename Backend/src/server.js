import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { testConnection } from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: [FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());

// Base Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ShopKart API server is healthy and operational.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// Start Server if executed directly
const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith('server.js') || process.argv[1].endsWith('server'));

if (isDirectRun) {
  app.listen(PORT, async () => {
    console.log(`========================================`);
    console.log(` ShopKart Express API running on port ${PORT}`);
    console.log(` Base URL: http://localhost:${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(`========================================`);
    await testConnection();
  });
}

export default app;
