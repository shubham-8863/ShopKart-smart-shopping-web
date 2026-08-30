import pool from '../config/db.js';
import jwt from 'jsonwebtoken';

/**
 * Helper to optionally parse user ID from Bearer token if present
 */
function getOptionalUserId(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
}

/**
 * POST /api/reviews
 * Submit a customer 1-5 star rating for a verified purchased product
 */
export async function createReview(req, res, next) {
  const userId = req.user.id;
  const { productId, rating, orderId } = req.body;

  const numProductId = Number(productId);
  const numRating = Number(rating);

  // 1. Validate Product ID
  if (!productId || isNaN(numProductId) || numProductId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'A valid product ID is required.',
    });
  }

  // 2. Validate Rating (strictly 1, 2, 3, 4, 5 integer)
  if (
    rating === undefined ||
    isNaN(numRating) ||
    !Number.isInteger(numRating) ||
    numRating < 1 ||
    numRating > 5
  ) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be an integer between 1 and 5.',
    });
  }

  // 3. Verify Product exists and is active
  const [products] = await pool.query(
    'SELECT id, name FROM products WHERE id = ? AND is_active = TRUE LIMIT 1;',
    [numProductId]
  );

  if (products.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Product not found.',
    });
  }

  // 4. Verify Duplicate Rating (One rating per user per product)
  const [existingReviews] = await pool.query(
    'SELECT id FROM reviews WHERE user_id = ? AND product_id = ? LIMIT 1;',
    [userId, numProductId]
  );

  if (existingReviews.length > 0) {
    return res.status(409).json({
      success: false,
      message: 'You have already rated this product.',
    });
  }

  // 5. Verify Verified Purchase Rule
  // Checks that an order exists for this user containing this product
  let verifiedOrderId = null;

  if (orderId) {
    const numOrderId = Number(orderId);
    const [matchingOrders] = await pool.query(
      `SELECT o.id 
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ? AND oi.product_id = ? AND (o.id = ? OR o.order_code = ?)
       LIMIT 1;`,
      [userId, numProductId, isNaN(numOrderId) ? -1 : numOrderId, String(orderId)]
    );

    if (matchingOrders.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You can only rate products you have purchased.',
      });
    }
    verifiedOrderId = matchingOrders[0].id;
  } else {
    // If orderId is omitted, find latest matching purchase for this user
    const [userPurchases] = await pool.query(
      `SELECT o.id 
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ? AND oi.product_id = ?
       ORDER BY o.created_at DESC
       LIMIT 1;`,
      [userId, numProductId]
    );

    if (userPurchases.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You can only rate products you have purchased.',
      });
    }
    verifiedOrderId = userPurchases[0].id;
  }

  // 6. Execute Transaction to Insert Review and Update Cached Aggregate
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Step A: Insert review
    await connection.query(
      `INSERT INTO reviews (user_id, product_id, order_id, rating)
       VALUES (?, ?, ?, ?);`,
      [userId, numProductId, verifiedOrderId, numRating]
    );

    // Step B: Calculate new average rating
    const [avgResult] = await connection.query(
      `SELECT 
        ROUND(AVG(rating), 1) AS avgRating,
        COUNT(*) AS totalCount
       FROM reviews
       WHERE product_id = ?;`,
      [numProductId]
    );

    const newAvgRating =
      avgResult[0]?.avgRating !== null ? Number(avgResult[0].avgRating) : numRating;
    const totalReviewCount = Number(avgResult[0]?.totalCount || 1);

    // Step C: Update products.rating
    await connection.query(
      'UPDATE products SET rating = ? WHERE id = ?;',
      [newAvgRating, numProductId]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Rating submitted successfully.',
      data: {
        productId: numProductId,
        rating: numRating,
        averageRating: newAvgRating,
        reviewCount: totalReviewCount,
      },
    });
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'You have already rated this product.',
      });
    }
    console.error('Transaction error in createReview:', error);
    next(error);
  } finally {
    connection.release();
  }
}

/**
 * GET /api/products/:productId/reviews
 * Retrieve public ratings aggregate and optional user rating / eligibility
 */
export async function getProductReviews(req, res, next) {
  try {
    const { productId } = req.params;
    const numProductId = Number(productId);

    if (!productId || isNaN(numProductId) || numProductId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      });
    }

    // 1. Fetch ratings aggregate
    const [reviews] = await pool.query(
      `SELECT rating, created_at AS createdAt
       FROM reviews
       WHERE product_id = ?
       ORDER BY created_at DESC;`,
      [numProductId]
    );

    const reviewCount = reviews.length;
    const averageRating =
      reviewCount > 0
        ? Number(
            (
              reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviewCount
            ).toFixed(1)
          )
        : 0.0;

    // 2. Check optional user context if authenticated
    const optionalUserId = getOptionalUserId(req);
    let userRating = null;
    let canRate = false;

    if (optionalUserId) {
      // Check existing user review
      const [userReviewRows] = await pool.query(
        'SELECT rating FROM reviews WHERE user_id = ? AND product_id = ? LIMIT 1;',
        [optionalUserId, numProductId]
      );

      if (userReviewRows.length > 0) {
        userRating = Number(userReviewRows[0].rating);
      } else {
        // Check if user has purchased the product
        const [purchaseRows] = await pool.query(
          `SELECT o.id 
           FROM orders o
           JOIN order_items oi ON o.id = oi.order_id
           WHERE o.user_id = ? AND oi.product_id = ?
           LIMIT 1;`,
          [optionalUserId, numProductId]
        );
        canRate = purchaseRows.length > 0;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        productId: numProductId,
        averageRating,
        reviewCount,
        userRating,
        canRate,
        ratings: reviews.map((r) => ({
          rating: Number(r.rating),
          createdAt: r.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Error in getProductReviews:', error);
    next(error);
  }
}
