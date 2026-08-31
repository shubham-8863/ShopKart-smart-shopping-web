import pool from '../config/db.js';

const ALLOWED_STATUSES = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const VALID_TRANSITIONS = {
  Placed: ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: [],
  Cancelled: [],
};

/**
 * GET /api/admin/orders
 * Retrieve all orders across all customers for admin management
 */
export async function getAdminOrders(req, res, next) {
  try {
    // 1. Fetch all orders
    const [orders] = await pool.query(`
      SELECT 
        o.id AS numericId,
        o.order_code AS orderCode,
        o.status,
        o.payment_method AS paymentMethod,
        o.subtotal,
        o.delivery_cost AS deliveryCost,
        o.total_amount AS total,
        o.customer_name AS customerName,
        o.customer_email AS customerEmail,
        o.customer_phone AS customerPhone,
        o.shipping_address AS shippingAddress,
        o.shipping_city AS shippingCity,
        o.shipping_state AS shippingState,
        o.shipping_pincode AS shippingPincode,
        o.created_at AS createdAt,
        o.updated_at AS updatedAt
      FROM orders o
      ORDER BY o.created_at DESC, o.id DESC;
    `);

    if (orders.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // 2. Fetch all order items to compute item counts and preview items
    const [items] = await pool.query(`
      SELECT 
        oi.order_id AS orderId,
        oi.product_id AS productId,
        oi.quantity,
        oi.unit_price AS unitPrice,
        (oi.quantity * oi.unit_price) AS lineTotal,
        p.name,
        cat.name AS category,
        p.image_url AS image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN categories cat ON p.category_id = cat.id
      ORDER BY oi.id ASC;
    `);

    // Map items to corresponding orders
    const itemsByOrderId = {};
    for (const item of items) {
      if (!itemsByOrderId[item.orderId]) {
        itemsByOrderId[item.orderId] = [];
      }
      itemsByOrderId[item.orderId].push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
        product: {
          id: item.productId,
          name: item.name,
          category: item.category,
          image: item.image,
          price: item.unitPrice,
        },
      });
    }

    const formattedOrders = orders.map((o) => {
      const orderItems = itemsByOrderId[o.numericId] || [];
      return {
        id: o.orderCode,
        numericId: o.numericId,
        orderCode: o.orderCode,
        status: o.status,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
        paymentMethod: o.paymentMethod,
        subtotal: Number(o.subtotal),
        delivery: Number(o.deliveryCost),
        deliveryCost: Number(o.deliveryCost),
        total: Number(o.total),
        totalAmount: Number(o.total),
        itemCount: orderItems.reduce((sum, item) => sum + item.quantity, 0),
        customer: {
          fullName: o.customerName,
          email: o.customerEmail,
          phone: o.customerPhone,
        },
        shippingAddress: {
          address: o.shippingAddress,
          city: o.shippingCity,
          state: o.shippingState,
          pincode: o.shippingPincode,
        },
        items: orderItems,
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedOrders.length,
      data: formattedOrders,
    });
  } catch (error) {
    console.error('Error in getAdminOrders:', error);
    next(error);
  }
}

/**
 * GET /api/admin/orders/:id
 * Retrieve single order details by order_code or numeric ID (Admin scope)
 */
export async function getAdminOrderById(req, res, next) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order identifier is required.',
      });
    }

    const [rows] = await pool.query(
      `SELECT 
        o.id AS numericId,
        o.order_code AS orderCode,
        o.status,
        o.payment_method AS paymentMethod,
        o.subtotal,
        o.delivery_cost AS deliveryCost,
        o.total_amount AS total,
        o.customer_name AS customerName,
        o.customer_email AS customerEmail,
        o.customer_phone AS customerPhone,
        o.shipping_address AS shippingAddress,
        o.shipping_city AS shippingCity,
        o.shipping_state AS shippingState,
        o.shipping_pincode AS shippingPincode,
        o.created_at AS createdAt,
        o.updated_at AS updatedAt
      FROM orders o
      WHERE o.order_code = ? OR o.id = ?
      LIMIT 1;`,
      [id, isNaN(Number(id)) ? -1 : Number(id)]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    const order = rows[0];

    // Query line items
    const [items] = await pool.query(
      `SELECT 
        oi.id,
        oi.product_id AS productId,
        oi.quantity,
        oi.unit_price AS unitPrice,
        (oi.quantity * oi.unit_price) AS lineTotal,
        p.name,
        cat.name AS category,
        p.image_url AS image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN categories cat ON p.category_id = cat.id
      WHERE oi.order_id = ?
      ORDER BY oi.id ASC;`,
      [order.numericId]
    );

    const formattedItems = items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      category: item.category,
      image: item.image,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
      product: {
        id: item.productId,
        name: item.name,
        category: item.category,
        image: item.image,
        price: Number(item.unitPrice),
      },
    }));

    return res.status(200).json({
      success: true,
      data: {
        id: order.orderCode,
        numericId: order.numericId,
        orderCode: order.orderCode,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        paymentMethod: order.paymentMethod,
        subtotal: Number(order.subtotal),
        deliveryCost: Number(order.deliveryCost),
        delivery: Number(order.deliveryCost),
        total: Number(order.total),
        totalAmount: Number(order.total),
        customer: {
          fullName: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone,
        },
        shippingAddress: {
          address: order.shippingAddress,
          city: order.shippingCity,
          state: order.shippingState,
          pincode: order.shippingPincode,
        },
        items: formattedItems,
        itemCount: formattedItems.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
  } catch (error) {
    console.error('Error in getAdminOrderById:', error);
    next(error);
  }
}

/**
 * PATCH /api/admin/orders/:id/status
 * Update an order's fulfillment lifecycle status with transition validation
 */
export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status: targetStatus } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order identifier is required.',
      });
    }

    if (!targetStatus || !ALLOWED_STATUSES.includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Allowed statuses: ${ALLOWED_STATUSES.join(', ')}.`,
      });
    }

    // 1. Fetch current order status
    const [rows] = await pool.query(
      'SELECT id, order_code, status FROM orders WHERE order_code = ? OR id = ? LIMIT 1;',
      [id, isNaN(Number(id)) ? -1 : Number(id)]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    const currentOrder = rows[0];
    const currentStatus = currentOrder.status;

    // If status is already the target status
    if (currentStatus === targetStatus) {
      return res.status(200).json({
        success: true,
        message: 'Order status updated successfully.',
        data: {
          orderCode: currentOrder.order_code,
          status: targetStatus,
        },
      });
    }

    // 2. Validate Allowed Transitions
    const allowedNextStatuses = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowedNextStatuses.includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status transition from "${currentStatus}" to "${targetStatus}".`,
      });
    }

    // 3. Update orders table (maintaining financial immutability)
    await pool.query(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;',
      [targetStatus, currentOrder.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully.',
      data: {
        orderCode: currentOrder.order_code,
        status: targetStatus,
      },
    });
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    next(error);
  }
}
