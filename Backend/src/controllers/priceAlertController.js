import pool from '../config/db.js';

/**
 * GET /api/price-alerts
 * Fetch all price alerts for the authenticated user
 */
export async function getPriceAlerts(req, res, next) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT 
        pa.id,
        pa.product_id AS productId,
        p.name,
        cat.name AS category,
        p.image_url AS image,
        p.price AS currentPrice,
        pa.target_price AS targetPrice,
        pa.is_active AS isActive,
        pa.is_triggered AS isTriggered,
        pa.created_at AS createdAt,
        pa.updated_at AS updatedAt
      FROM price_alerts pa
      JOIN products p ON pa.product_id = p.id
      JOIN categories cat ON p.category_id = cat.id
      WHERE pa.user_id = ? AND p.is_active = TRUE
      ORDER BY pa.is_active DESC, pa.created_at DESC;`,
      [userId]
    );

    const alerts = rows.map((r) => {
      const currentPrice = Number(r.currentPrice);
      const targetPrice = Number(r.targetPrice);
      const isTriggered = Boolean(r.isTriggered);
      const targetReached = isTriggered || currentPrice <= targetPrice;

      return {
        id: r.id,
        productId: r.productId,
        name: r.name,
        category: r.category,
        image: r.image,
        currentPrice,
        targetPrice,
        priceDifference: Math.max(0, currentPrice - targetPrice),
        targetReached,
        isActive: Boolean(r.isActive),
        isTriggered,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    });

    return res.status(200).json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error('Error in getPriceAlerts:', error);
    next(error);
  }
}

/**
 * POST /api/price-alerts
 * Set or update a price alert for a product
 */
export async function createOrUpdatePriceAlert(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId, targetPrice } = req.body;

    const numProductId = Number(productId);
    const numTargetPrice = Number(targetPrice);

    // 1. Validate input parameters
    if (!productId || isNaN(numProductId) || numProductId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid product ID is required.',
      });
    }

    if (!targetPrice || isNaN(numTargetPrice) || numTargetPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid positive target price is required.',
      });
    }

    // 2. Lookup product
    const [products] = await pool.query(
      'SELECT id, name, price, is_active FROM products WHERE id = ? LIMIT 1;',
      [numProductId]
    );

    if (products.length === 0 || !products[0].is_active) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const currentPrice = products[0].price;
    const roundedTarget = Math.round(numTargetPrice);

    // 3. Validate target price strictly below current price
    if (roundedTarget >= currentPrice) {
      return res.status(400).json({
        success: false,
        message: 'Target price must be below the current product price.',
      });
    }

    // 4. Check if alert already exists for (user_id, product_id)
    const [existing] = await pool.query(
      'SELECT id FROM price_alerts WHERE user_id = ? AND product_id = ? LIMIT 1;',
      [userId, numProductId]
    );

    if (existing.length > 0) {
      // Update existing record
      await pool.query(
        `UPDATE price_alerts
         SET target_price = ?, is_active = TRUE, is_triggered = FALSE
         WHERE user_id = ? AND product_id = ?;`,
        [roundedTarget, userId, numProductId]
      );

      return res.status(200).json({
        success: true,
        message: 'Price alert updated.',
        data: {
          productId: numProductId,
          targetPrice: roundedTarget,
          isActive: true,
          isTriggered: false,
        },
      });
    } else {
      // Create new record
      await pool.query(
        `INSERT INTO price_alerts (user_id, product_id, target_price, is_active, is_triggered)
         VALUES (?, ?, ?, TRUE, FALSE);`,
        [userId, numProductId, roundedTarget]
      );

      return res.status(201).json({
        success: true,
        message: 'Price alert set.',
        data: {
          productId: numProductId,
          targetPrice: roundedTarget,
          isActive: true,
          isTriggered: false,
        },
      });
    }
  } catch (error) {
    console.error('Error in createOrUpdatePriceAlert:', error);
    next(error);
  }
}

/**
 * PATCH /api/price-alerts/:productId
 * Update target price or active status of an alert
 */
export async function updatePriceAlert(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { targetPrice, isActive } = req.body;

    const numProductId = Number(productId);
    if (!productId || isNaN(numProductId) || numProductId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid product ID is required.',
      });
    }

    // 1. Fetch existing alert and product price
    const [rows] = await pool.query(
      `SELECT pa.id, pa.target_price, pa.is_active, pa.is_triggered, p.price, p.is_active AS productActive
       FROM price_alerts pa
       JOIN products p ON pa.product_id = p.id
       WHERE pa.user_id = ? AND pa.product_id = ?
       LIMIT 1;`,
      [userId, numProductId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Price alert not found.',
      });
    }

    const existingAlert = rows[0];
    let newTargetPrice = existingAlert.target_price;
    let newIsActive = existingAlert.is_active;
    let newIsTriggered = existingAlert.is_triggered;

    // 2. Validate new targetPrice if provided
    if (targetPrice !== undefined) {
      const numTarget = Number(targetPrice);
      if (isNaN(numTarget) || numTarget <= 0) {
        return res.status(400).json({
          success: false,
          message: 'A valid positive target price is required.',
        });
      }

      const roundedTarget = Math.round(numTarget);
      if (roundedTarget >= existingAlert.price) {
        return res.status(400).json({
          success: false,
          message: 'Target price must be below the current product price.',
        });
      }

      newTargetPrice = roundedTarget;
      newIsActive = true;
      newIsTriggered = false;
    }

    // 3. Handle explicit isActive toggle
    if (isActive !== undefined) {
      newIsActive = Boolean(isActive);
      if (newIsActive) {
        newIsTriggered = false;
      }
    }

    // 4. Update in database
    await pool.query(
      `UPDATE price_alerts
       SET target_price = ?, is_active = ?, is_triggered = ?
       WHERE user_id = ? AND product_id = ?;`,
      [newTargetPrice, newIsActive, newIsTriggered, userId, numProductId]
    );

    return res.status(200).json({
      success: true,
      message: 'Price alert updated.',
      data: {
        productId: numProductId,
        targetPrice: newTargetPrice,
        isActive: Boolean(newIsActive),
        isTriggered: Boolean(newIsTriggered),
      },
    });
  } catch (error) {
    console.error('Error in updatePriceAlert:', error);
    next(error);
  }
}

/**
 * DELETE /api/price-alerts/:productId
 * Stop tracking a product's price
 */
export async function deletePriceAlert(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const numProductId = Number(productId);
    if (!productId || isNaN(numProductId) || numProductId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid product ID is required.',
      });
    }

    const [result] = await pool.query(
      'DELETE FROM price_alerts WHERE user_id = ? AND product_id = ?;',
      [userId, numProductId]
    );

    return res.status(200).json({
      success: true,
      message:
        result.affectedRows > 0
          ? 'Price tracking stopped.'
          : 'Price tracking is already stopped.',
    });
  } catch (error) {
    console.error('Error in deletePriceAlert:', error);
    next(error);
  }
}
