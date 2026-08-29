import pool from '../config/db.js';

/**
 * GET /api/wishlist
 * Retrieve all wishlist items for the authenticated user
 */
export async function getWishlist(req, res, next) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT 
        w.product_id AS id,
        p.name,
        c.name AS category,
        c.slug AS categorySlug,
        p.description,
        p.price,
        p.rating,
        p.stock,
        p.image_url AS image,
        p.specifications,
        w.created_at AS addedAt
      FROM wishlist_items w
      JOIN products p ON w.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC;`,
      [userId]
    );

    const items = rows.map((row) => ({
      ...row,
      specifications:
        typeof row.specifications === 'string'
          ? JSON.parse(row.specifications)
          : row.specifications,
    }));

    const wishlistIds = items.map((item) => item.id);

    return res.status(200).json({
      success: true,
      count: items.length,
      wishlistIds,
      data: items,
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    next(error);
  }
}

/**
 * POST /api/wishlist
 * Add a product to the user's wishlist
 */
export async function addToWishlist(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    const numericProductId = Number(productId);
    if (!productId || isNaN(numericProductId) || numericProductId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid productId is required.',
      });
    }

    // Verify product exists in catalog
    const [products] = await pool.query(
      'SELECT id FROM products WHERE id = ? LIMIT 1;',
      [numericProductId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in catalog.',
      });
    }

    // Insert or update timestamp if already exists
    await pool.query(
      `INSERT INTO wishlist_items (user_id, product_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP;`,
      [userId, numericProductId]
    );

    return res.status(201).json({
      success: true,
      message: 'Product added to wishlist.',
      data: {
        productId: numericProductId,
      },
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    next(error);
  }
}

/**
 * DELETE /api/wishlist/:productId
 * Remove a product from the user's wishlist
 */
export async function removeFromWishlist(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const numericProductId = Number(productId);
    if (!productId || isNaN(numericProductId) || numericProductId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid numeric productId parameter is required.',
      });
    }

    const [result] = await pool.query(
      'DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?;',
      [userId, numericProductId]
    );

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist.',
      data: {
        productId: numericProductId,
        affectedRows: result.affectedRows,
      },
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    next(error);
  }
}
