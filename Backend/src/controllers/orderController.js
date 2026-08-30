import pool from '../config/db.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PINCODE_REGEX = /^\d{6}$/;
const ALLOWED_PAYMENT_METHODS = ['Cash on Delivery', 'UPI', 'Credit / Debit Card'];
const FREE_DELIVERY_THRESHOLD = 2000;
const STANDARD_DELIVERY_FEE = 99;

/**
 * POST /api/orders
 * Place a new order from the authenticated user's current database cart
 */
export async function createOrder(req, res, next) {
  const userId = req.user.id;
  const {
    customerName,
    fullName,
    customerEmail,
    email,
    customerPhone,
    phone,
    shippingAddress,
    address,
    shippingCity,
    city,
    shippingState,
    state,
    shippingPincode,
    pincode,
    paymentMethod,
  } = req.body;

  // 1. Normalize and extract fields
  const finalName = (customerName || fullName || '').trim();
  const finalEmail = (customerEmail || email || '').trim().toLowerCase();
  const finalPhone = (customerPhone || phone || '').trim();
  const finalAddress = (shippingAddress || address || '').trim();
  const finalCity = (shippingCity || city || '').trim();
  const finalState = (shippingState || state || '').trim();
  const finalPincode = (shippingPincode || pincode || '').trim();
  const finalPaymentMethod = (paymentMethod || '').trim();

  // 2. Validate input
  if (!finalName || finalName.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Full name is required (minimum 2 characters).',
    });
  }

  if (!finalEmail || !EMAIL_REGEX.test(finalEmail)) {
    return res.status(400).json({
      success: false,
      message: 'A valid email address is required.',
    });
  }

  if (!finalPhone || finalPhone.length < 7) {
    return res.status(400).json({
      success: false,
      message: 'A valid phone number is required.',
    });
  }

  if (!finalAddress) {
    return res.status(400).json({
      success: false,
      message: 'Delivery street address is required.',
    });
  }

  if (!finalCity) {
    return res.status(400).json({
      success: false,
      message: 'City is required.',
    });
  }

  if (!finalState) {
    return res.status(400).json({
      success: false,
      message: 'State is required.',
    });
  }

  if (!finalPincode || !PINCODE_REGEX.test(finalPincode)) {
    return res.status(400).json({
      success: false,
      message: 'PIN code must be exactly 6 digits.',
    });
  }

  if (!ALLOWED_PAYMENT_METHODS.includes(finalPaymentMethod)) {
    return res.status(400).json({
      success: false,
      message: 'Please select a valid payment method (Cash on Delivery, UPI, or Credit / Debit Card).',
    });
  }

  // 3. Begin Transaction
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Step A: Read cart items with product row lock
    const [cartRows] = await connection.query(
      `SELECT 
        c.product_id AS productId,
        c.quantity,
        p.name,
        p.price,
        p.stock,
        p.is_active,
        cat.name AS category,
        p.image_url AS image
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      JOIN categories cat ON p.category_id = cat.id
      WHERE c.user_id = ?
      FOR UPDATE;`,
      [userId]
    );

    if (cartRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty.',
      });
    }

    // Step B: Validate every product is active and has sufficient stock
    for (const item of cartRows) {
      if (!item.is_active) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Product "${item.name}" is no longer available.`,
        });
      }

      if (item.quantity > item.stock) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name}. Only ${item.stock} units are available.`,
        });
      }
    }

    // Step C: Calculate Authoritative Totals
    const subtotal = cartRows.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const deliveryCost =
      subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
    const totalAmount = subtotal + deliveryCost;

    // Step D: Generate Unique Order Code
    const [lastOrders] = await connection.query(
      'SELECT id FROM orders ORDER BY id DESC LIMIT 1 FOR UPDATE;'
    );
    const nextSeq = (lastOrders.length > 0 ? lastOrders[0].id : 0) + 1001;
    const orderCode = `SK${nextSeq}`;

    // Step E: Insert into `orders` table
    const [orderInsertResult] = await connection.query(
      `INSERT INTO orders (
        order_code,
        user_id,
        status,
        payment_method,
        subtotal,
        delivery_cost,
        total_amount,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        shipping_city,
        shipping_state,
        shipping_pincode
      ) VALUES (?, ?, 'Placed', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        orderCode,
        userId,
        finalPaymentMethod,
        subtotal,
        deliveryCost,
        totalAmount,
        finalName,
        finalEmail,
        finalPhone,
        finalAddress,
        finalCity,
        finalState,
        finalPincode,
      ]
    );

    const orderId = orderInsertResult.insertId;

    // Step F: Insert `order_items` with frozen purchase unit_price and decrement stock
    for (const item of cartRows) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES (?, ?, ?, ?);`,
        [orderId, item.productId, item.quantity, item.price]
      );

      await connection.query(
        `UPDATE products 
         SET stock = stock - ? 
         WHERE id = ?;`,
        [item.quantity, item.productId]
      );
    }

    // Step G: Clear current user's cart
    await connection.query(
      'DELETE FROM cart_items WHERE user_id = ?;',
      [userId]
    );

    // Step H: Commit Transaction
    await connection.commit();

    const formattedOrder = {
      id: orderCode,
      numericId: orderId,
      orderCode: orderCode,
      status: 'Placed',
      createdAt: new Date().toISOString(),
      paymentMethod: finalPaymentMethod,
      subtotal,
      delivery: deliveryCost,
      deliveryCost,
      total: totalAmount,
      itemCount: cartRows.reduce((sum, item) => sum + item.quantity, 0),
      customer: {
        fullName: finalName,
        email: finalEmail,
        phone: finalPhone,
      },
      shippingAddress: {
        address: finalAddress,
        city: finalCity,
        state: finalState,
        pincode: finalPincode,
      },
      items: cartRows.map((r) => ({
        productId: r.productId,
        quantity: r.quantity,
        unitPrice: r.price,
        lineTotal: r.price * r.quantity,
        product: {
          id: r.productId,
          name: r.name,
          category: r.category,
          image: r.image,
          price: r.price,
        },
      })),
    };

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: formattedOrder,
    });
  } catch (error) {
    await connection.rollback();
    console.error('Transaction failed in createOrder:', error);
    next(error);
  } finally {
    connection.release();
  }
}

/**
 * GET /api/orders
 * Retrieve order history for the authenticated user (newest first)
 */
export async function getOrders(req, res, next) {
  try {
    const userId = req.user.id;

    // 1. Fetch user orders
    const [orders] = await pool.query(
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
        o.created_at AS createdAt
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC, o.id DESC;`,
      [userId]
    );

    if (orders.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // 2. Fetch all order items for this user's orders
    const [items] = await pool.query(
      `SELECT 
        oi.order_id AS orderId,
        oi.product_id AS productId,
        oi.quantity,
        oi.unit_price AS unitPrice,
        (oi.quantity * oi.unit_price) AS lineTotal,
        p.name,
        cat.name AS category,
        p.image_url AS image
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      JOIN categories cat ON p.category_id = cat.id
      WHERE o.user_id = ?
      ORDER BY oi.id ASC;`,
      [userId]
    );

    // 3. Map items to corresponding orders
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
        paymentMethod: o.paymentMethod,
        subtotal: o.subtotal,
        delivery: o.deliveryCost,
        deliveryCost: o.deliveryCost,
        total: o.total,
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
      data: formattedOrders,
    });
  } catch (error) {
    console.error('Error in getOrders:', error);
    next(error);
  }
}

/**
 * GET /api/orders/:id
 * Retrieve details for a specific order by order_code or numeric ID
 */
export async function getOrderById(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order identifier is required.',
      });
    }

    // 1. Query order by order_code or numeric ID, enforcing user_id
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
        o.created_at AS createdAt
      FROM orders o
      WHERE o.user_id = ? AND (o.order_code = ? OR o.id = ?)
      LIMIT 1;`,
      [userId, id, isNaN(Number(id)) ? -1 : Number(id)]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    const order = rows[0];

    // 2. Query line items with frozen unit_price
    const [items] = await pool.query(
      `SELECT 
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

    const formattedOrder = {
      id: order.orderCode,
      numericId: order.numericId,
      orderCode: order.orderCode,
      status: order.status,
      createdAt: order.createdAt,
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal,
      delivery: order.deliveryCost,
      deliveryCost: order.deliveryCost,
      total: order.total,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
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
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        lineTotal: i.lineTotal,
        product: {
          id: i.productId,
          name: i.name,
          category: i.category,
          image: i.image,
          price: i.unitPrice,
        },
      })),
    };

    return res.status(200).json({
      success: true,
      data: formattedOrder,
    });
  } catch (error) {
    console.error('Error in getOrderById:', error);
    next(error);
  }
}
