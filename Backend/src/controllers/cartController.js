import pool from '../config/db.js';

const FREE_DELIVERY_THRESHOLD = 2000;
const STANDARD_DELIVERY_FEE = 99;

/**
 * Server-authoritative calculation of Cart Subtotal, Delivery Cost, and Final Total
 */
export function calculateCartTotals(items = []) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const isFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;
  const delivery = items.length > 0 ? (isFreeDelivery ? 0 : STANDARD_DELIVERY_FEE) : 0;
  const total = subtotal + delivery;

  return {
    items,
    subtotal,
    delivery,
    total,
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
  };
}

/**
 * Helper to fetch complete resolved Cart data for an authenticated user
 */
export async function getResolvedCartForUser(userId) {
  const [rows] = await pool.query(
    `SELECT 
      c.product_id AS productId,
      c.quantity,
      p.name,
      cat.name AS category,
      p.image_url AS image,
      p.price AS unitPrice,
      p.stock,
      p.is_active
    FROM cart_items c
    JOIN products p ON c.product_id = p.id
    JOIN categories cat ON p.category_id = cat.id
    WHERE c.user_id = ? AND p.is_active = TRUE
    ORDER BY c.created_at ASC;`,
    [userId]
  );

  const items = rows.map((r) => ({
    productId: r.productId,
    quantity: r.quantity,
    name: r.name,
    category: r.category,
    image: r.image,
    unitPrice: r.unitPrice,
    itemSubtotal: r.unitPrice * r.quantity,
    stock: r.stock,
  }));

  return calculateCartTotals(items);
}

/**
 * GET /api/cart
 * Retrieve current user's authenticated shopping cart
 */
export async function getCart(req, res, next) {
  try {
    const userId = req.user.id;
    const cartData = await getResolvedCartForUser(userId);

    return res.status(200).json({
      success: true,
      data: cartData,
    });
  } catch (error) {
    console.error('Error in getCart:', error);
    next(error);
  }
}

/**
 * POST /api/cart/items
 * Add an item to the user's cart with stock & active validation
 */
export async function addCartItem(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const numProductId = Number(productId);
    const numQuantity = quantity !== undefined ? Number(quantity) : 1;

    // 1. Validation
    if (
      !productId ||
      isNaN(numProductId) ||
      numProductId <= 0 ||
      isNaN(numQuantity) ||
      !Number.isInteger(numQuantity) ||
      numQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product or quantity.',
      });
    }

    // 2. Validate product exists and is active
    const [products] = await pool.query(
      'SELECT id, stock, is_active FROM products WHERE id = ? LIMIT 1;',
      [numProductId]
    );

    if (products.length === 0 || !products[0].is_active) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const product = products[0];

    // 3. Check existing user cart quantity
    const [existingCart] = await pool.query(
      'SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ? LIMIT 1;',
      [userId, numProductId]
    );

    const currentQty = existingCart.length > 0 ? existingCart[0].quantity : 0;
    const targetTotalQty = currentQty + numQuantity;

    // 4. Validate available stock
    if (targetTotalQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units are available.`,
      });
    }

    // 5. Insert / Update cart item
    await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity);`,
      [userId, numProductId, numQuantity]
    );

    // 6. Return updated authoritative cart state
    const updatedCart = await getResolvedCartForUser(userId);

    return res.status(200).json({
      success: true,
      message: 'Added to cart.',
      data: updatedCart,
    });
  } catch (error) {
    console.error('Error in addCartItem:', error);
    next(error);
  }
}

/**
 * PATCH /api/cart/items/:productId
 * Update quantity for a specific cart item
 */
export async function updateCartItem(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    const numProductId = Number(productId);
    const numQuantity = Number(quantity);

    // 1. Validation
    if (
      !productId ||
      isNaN(numProductId) ||
      numProductId <= 0 ||
      isNaN(numQuantity) ||
      !Number.isInteger(numQuantity) ||
      numQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity (positive integer) is required.',
      });
    }

    // 2. Query cart item joined with product to verify item exists and check live stock
    const [rows] = await pool.query(
      `SELECT c.quantity, p.stock, p.is_active
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ? AND c.product_id = ?
       LIMIT 1;`,
      [userId, numProductId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found.',
      });
    }

    const item = rows[0];

    if (!item.is_active) {
      return res.status(400).json({
        success: false,
        message: 'This product is currently unavailable.',
      });
    }

    // 3. Stock validation
    if (numQuantity > item.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${item.stock} units are available.`,
      });
    }

    // 4. Update quantity in MySQL
    await pool.query(
      'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?;',
      [numQuantity, userId, numProductId]
    );

    // 5. Return updated authoritative cart state
    const updatedCart = await getResolvedCartForUser(userId);

    return res.status(200).json({
      success: true,
      message: 'Cart updated.',
      data: updatedCart,
    });
  } catch (error) {
    console.error('Error in updateCartItem:', error);
    next(error);
  }
}

/**
 * DELETE /api/cart/items/:productId
 * Remove an item from the user's cart
 */
export async function removeCartItem(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const numProductId = Number(productId);
    if (!productId || isNaN(numProductId) || numProductId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid numeric productId is required.',
      });
    }

    await pool.query(
      'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?;',
      [userId, numProductId]
    );

    const updatedCart = await getResolvedCartForUser(userId);

    return res.status(200).json({
      success: true,
      message: 'Removed from cart.',
      data: updatedCart,
    });
  } catch (error) {
    console.error('Error in removeCartItem:', error);
    next(error);
  }
}

/**
 * DELETE /api/cart
 * Clear all items in the user's cart
 */
export async function clearCart(req, res, next) {
  try {
    const userId = req.user.id;

    await pool.query('DELETE FROM cart_items WHERE user_id = ?;', [userId]);

    return res.status(200).json({
      success: true,
      message: 'Cart cleared.',
      data: {
        items: [],
        subtotal: 0,
        delivery: 0,
        total: 0,
        freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
      },
    });
  } catch (error) {
    console.error('Error in clearCart:', error);
    next(error);
  }
}
