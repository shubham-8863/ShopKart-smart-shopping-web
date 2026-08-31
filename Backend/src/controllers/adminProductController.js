import pool from '../config/db.js';

/**
 * Helper to parse JSON specifications safely
 */
function parseSpecs(specifications) {
  if (!specifications) return {};
  if (typeof specifications === 'object') return specifications;
  try {
    return JSON.parse(specifications);
  } catch {
    return {};
  }
}

/**
 * GET /api/admin/products
 * Retrieve all products (active and inactive) for admin management
 */
export async function getAdminProducts(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.category_id AS categoryId,
        c.name AS category,
        c.slug AS categorySlug,
        p.name,
        p.description,
        p.price,
        p.rating,
        p.stock,
        p.image_url AS image,
        p.specifications,
        p.is_active AS isActive,
        p.created_at AS createdAt,
        p.updated_at AS updatedAt
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.updated_at DESC;
    `);

    const products = rows.map((row) => {
      const stock = Number(row.stock);
      const rating = row.rating !== null && row.rating !== undefined ? Number(row.rating) : null;
      return {
        id: row.id,
        name: row.name,
        categoryId: row.categoryId,
        category: row.category,
        categorySlug: row.categorySlug,
        description: row.description,
        price: Number(row.price),
        rating,
        stock,
        inStock: stock > 0,
        image: row.image,
        specifications: parseSpecs(row.specifications),
        isActive: Boolean(row.isActive),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('Error in getAdminProducts:', error);
    next(error);
  }
}

/**
 * POST /api/admin/products
 * Create a new catalog product (rating is backend-maintained and ignored from client)
 */
export async function createProduct(req, res, next) {
  const {
    name,
    categoryId,
    description,
    price,
    stock,
    imageUrl,
    specifications,
    isActive = true,
  } = req.body;

  // 1. Validate Product Name
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Product name is required.',
    });
  }

  // 2. Validate Category ID
  const numCategoryId = Number(categoryId);
  if (!categoryId || isNaN(numCategoryId) || numCategoryId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'A valid category ID is required.',
    });
  }

  // 3. Validate Category exists in DB
  const [categories] = await pool.query(
    'SELECT id, name FROM categories WHERE id = ? LIMIT 1;',
    [numCategoryId]
  );
  if (categories.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category.',
    });
  }

  // 4. Validate Description
  if (!description || typeof description !== 'string' || !description.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Product description is required.',
    });
  }

  // 5. Validate Price
  const numPrice = Number(price);
  if (price === undefined || isNaN(numPrice) || numPrice < 0) {
    return res.status(400).json({
      success: false,
      message: 'A valid non-negative price is required.',
    });
  }

  // 6. Validate Stock
  const numStock = Number(stock);
  if (stock === undefined || isNaN(numStock) || !Number.isInteger(numStock) || numStock < 0) {
    return res.status(400).json({
      success: false,
      message: 'A valid non-negative integer stock is required.',
    });
  }

  // 7. Validate Image URL
  if (
    !imageUrl ||
    typeof imageUrl !== 'string' ||
    (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))
  ) {
    return res.status(400).json({
      success: false,
      message: 'A valid image URL starting with http:// or https:// is required.',
    });
  }

  // 8. Format specifications JSON
  const specsObject = specifications && typeof specifications === 'object' ? specifications : {};
  const specsJson = JSON.stringify(specsObject);

  const roundedPrice = Math.round(numPrice);
  const activeBool = Boolean(isActive);

  // 9. Execute Transaction: Insert Product + Initial Price History
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Insert Product (rating is initialized to 0.0, never accepting client rating)
    const [productResult] = await connection.query(
      `INSERT INTO products (
        category_id, name, description, price, rating, stock, image_url, specifications, is_active
      ) VALUES (?, ?, ?, ?, 0.0, ?, ?, ?, ?);`,
      [
        numCategoryId,
        name.trim(),
        description.trim(),
        roundedPrice,
        numStock,
        imageUrl.trim(),
        specsJson,
        activeBool,
      ]
    );

    const newProductId = productResult.insertId;

    // Insert Initial Price History
    await connection.query(
      'INSERT INTO price_history (product_id, price) VALUES (?, ?);',
      [newProductId, roundedPrice]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: {
        id: newProductId,
        name: name.trim(),
        categoryId: numCategoryId,
        category: categories[0].name,
        description: description.trim(),
        price: roundedPrice,
        stock: numStock,
        inStock: numStock > 0,
        rating: null,
        image: imageUrl.trim(),
        specifications: specsObject,
        isActive: activeBool,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Transaction error in createProduct:', error);
    next(error);
  } finally {
    connection.release();
  }
}

/**
 * PUT /api/admin/products/:id
 * Update an existing catalog product (rating is ignored from client)
 */
export async function updateProduct(req, res, next) {
  const { id } = req.params;
  const numProductId = Number(id);

  if (!id || isNaN(numProductId) || numProductId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'A valid product ID is required.',
    });
  }

  const {
    name,
    categoryId,
    description,
    price,
    stock,
    imageUrl,
    specifications,
    isActive,
  } = req.body;

  // 1. Validate Product Name
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Product name is required.',
    });
  }

  // 2. Validate Category ID
  const numCategoryId = Number(categoryId);
  if (!categoryId || isNaN(numCategoryId) || numCategoryId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'A valid category ID is required.',
    });
  }

  // 3. Validate Category exists in DB
  const [categories] = await pool.query(
    'SELECT id, name FROM categories WHERE id = ? LIMIT 1;',
    [numCategoryId]
  );
  if (categories.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category.',
    });
  }

  // 4. Validate Description
  if (!description || typeof description !== 'string' || !description.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Product description is required.',
    });
  }

  // 5. Validate Price
  const numPrice = Number(price);
  if (price === undefined || isNaN(numPrice) || numPrice < 0) {
    return res.status(400).json({
      success: false,
      message: 'A valid non-negative price is required.',
    });
  }

  // 6. Validate Stock
  const numStock = Number(stock);
  if (stock === undefined || isNaN(numStock) || !Number.isInteger(numStock) || numStock < 0) {
    return res.status(400).json({
      success: false,
      message: 'A valid non-negative integer stock is required.',
    });
  }

  // 7. Validate Image URL
  if (
    !imageUrl ||
    typeof imageUrl !== 'string' ||
    (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))
  ) {
    return res.status(400).json({
      success: false,
      message: 'A valid image URL starting with http:// or https:// is required.',
    });
  }

  // 8. Lookup Existing Product
  const [existingRows] = await pool.query(
    'SELECT id, price, rating, is_active FROM products WHERE id = ? LIMIT 1;',
    [numProductId]
  );

  if (existingRows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Product not found.',
    });
  }

  const existingProduct = existingRows[0];
  const oldPrice = Number(existingProduct.price);
  const roundedNewPrice = Math.round(numPrice);
  const priceChanged = oldPrice !== roundedNewPrice;

  const activeBool = isActive !== undefined ? Boolean(isActive) : Boolean(existingProduct.is_active);
  const specsObject = specifications && typeof specifications === 'object' ? specifications : {};
  const specsJson = JSON.stringify(specsObject);

  // 9. Execute Update (with Transaction if price changed)
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Update Product fields (preserves existing rating)
    await connection.query(
      `UPDATE products 
       SET category_id = ?,
           name = ?,
           description = ?,
           price = ?,
           stock = ?,
           image_url = ?,
           specifications = ?,
           is_active = ?
       WHERE id = ?;`,
      [
        numCategoryId,
        name.trim(),
        description.trim(),
        roundedNewPrice,
        numStock,
        imageUrl.trim(),
        specsJson,
        activeBool,
        numProductId,
      ]
    );

    // If price changed, record new price history point
    if (priceChanged) {
      await connection.query(
        'INSERT INTO price_history (product_id, price) VALUES (?, ?);',
        [numProductId, roundedNewPrice]
      );
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: {
        id: numProductId,
        name: name.trim(),
        categoryId: numCategoryId,
        category: categories[0].name,
        description: description.trim(),
        price: roundedNewPrice,
        stock: numStock,
        inStock: numStock > 0,
        rating: Number(existingProduct.rating),
        image: imageUrl.trim(),
        specifications: specsObject,
        isActive: activeBool,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Transaction error in updateProduct:', error);
    next(error);
  } finally {
    connection.release();
  }
}

/**
 * DELETE /api/admin/products/:id
 * Soft delete: sets is_active = FALSE
 */
export async function deactivateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const numProductId = Number(id);

    if (!id || isNaN(numProductId) || numProductId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid product ID is required.',
      });
    }

    const [rows] = await pool.query(
      'SELECT id, is_active FROM products WHERE id = ? LIMIT 1;',
      [numProductId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    await pool.query(
      'UPDATE products SET is_active = FALSE WHERE id = ?;',
      [numProductId]
    );

    return res.status(200).json({
      success: true,
      message: 'Product deactivated successfully.',
    });
  } catch (error) {
    console.error('Error in deactivateProduct:', error);
    next(error);
  }
}
