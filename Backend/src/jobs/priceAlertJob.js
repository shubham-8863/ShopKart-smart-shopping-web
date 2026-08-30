import cron from 'node-cron';
import pool from '../config/db.js';

/**
 * Core Price Alert evaluation logic
 * Inspects all active, untriggered alerts against current products.price
 */
export async function checkPriceAlerts() {
  try {
    // 1. Find all active, untriggered price alerts where current price has reached or dropped below target
    const [matchingAlerts] = await pool.query(
      `SELECT 
        pa.id AS alertId,
        pa.user_id AS userId,
        pa.product_id AS productId,
        pa.target_price AS targetPrice,
        p.name AS productName,
        p.price AS currentPrice
      FROM price_alerts pa
      JOIN products p ON pa.product_id = p.id
      WHERE pa.is_active = TRUE 
        AND pa.is_triggered = FALSE 
        AND p.is_active = TRUE
        AND p.price <= pa.target_price;`
    );

    if (matchingAlerts.length === 0) {
      return 0;
    }

    // 2. Mark each matching alert as triggered and deactivate it
    for (const alert of matchingAlerts) {
      await pool.query(
        `UPDATE price_alerts
         SET is_triggered = TRUE, is_active = FALSE
         WHERE id = ? AND is_active = TRUE AND is_triggered = FALSE;`,
        [alert.alertId]
      );

      console.log(
        `[Price Alert] ${alert.productName} reached target ₹${alert.targetPrice.toLocaleString(
          'en-IN'
        )}. Current price: ₹${alert.currentPrice.toLocaleString('en-IN')}`
      );
    }

    return matchingAlerts.length;
  } catch (error) {
    console.error('[Price Alert Job Error]', error.message || error);
    return 0;
  }
}

/**
 * Initialize the scheduled price-checking cron job
 * Runs every minute in development ('* * * * *')
 */
export function initPriceAlertJob() {
  const job = cron.schedule('* * * * *', async () => {
    await checkPriceAlerts();
  });

  console.log('[Price Alert Job] Scheduled successfully.');
  return job;
}
