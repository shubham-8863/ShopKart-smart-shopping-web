import pool from '../config/db.js';

/**
 * Helper to compute price status from average price and current price
 */
function computePriceStatus(currentPrice, avgPrice) {
  if (!avgPrice || avgPrice <= 0) {
    return 'Current market price';
  }

  const diffPercent = Math.round(((avgPrice - currentPrice) / avgPrice) * 100);

  if (diffPercent >= 3) {
    return `${diffPercent}% below average`;
  } else if (diffPercent <= -3) {
    return `${Math.abs(diffPercent)}% above average`;
  } else {
    return 'Near average';
  }
}

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
 * GET /api/categories
 * Retrieve all product categories
 */
export async function getCategories(req, res) {
  try {
    const [categories] = await pool.query(`
      SELECT id, name, slug, description, created_at
      FROM categories
      ORDER BY id ASC
    `);

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error in getCategories:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message,
    });
  }
}

/**
 * GET /api/products
 * Retrieve products with filtering, search, and sorting
 */
export async function getProducts(req, res) {
  try {
    const {
      search,
      q,
      category,
      minPrice,
      maxPrice,
      minRating,
      rating,
      sortBy,
      sort,
      ids,
    } = req.query;

    const searchTerm = search || q;
    const ratingFilter = minRating || rating;
    const sortOption = sortBy || sort || 'recommended';

    const whereClauses = ['p.is_active = TRUE'];
    const params = [];

    // Filter by specific IDs if provided
    if (ids) {
      const idList = ids
        .split(',')
        .map((id) => Number(id.trim()))
        .filter((id) => !isNaN(id) && id > 0);

      if (idList.length > 0) {
        whereClauses.push(`p.id IN (${idList.map(() => '?').join(',')})`);
        params.push(...idList);
      }
    }

    // Search query matching product name or description
    if (searchTerm && searchTerm.trim() !== '') {
      whereClauses.push('(p.name LIKE ? OR p.description LIKE ?)');
      params.push(`%${searchTerm.trim()}%`, `%${searchTerm.trim()}%`);
    }

    // Category filter
    if (
      category &&
      category.trim() !== '' &&
      category.toLowerCase() !== 'all categories' &&
      category.toLowerCase() !== 'all'
    ) {
      whereClauses.push('(c.name = ? OR c.slug = ?)');
      params.push(category.trim(), category.trim().toLowerCase());
    }

    // Price range filters
    if (minPrice && !isNaN(Number(minPrice))) {
      whereClauses.push('p.price >= ?');
      params.push(Number(minPrice));
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      whereClauses.push('p.price <= ?');
      params.push(Number(maxPrice));
    }

    // Minimum rating filter
    if (ratingFilter && ratingFilter !== 'all' && !isNaN(Number(ratingFilter))) {
      whereClauses.push('p.rating >= ?');
      params.push(Number(ratingFilter));
    }

    // Sorting clause
    let orderClause = 'ORDER BY p.id ASC';
    if (sortOption === 'price_asc') {
      orderClause = 'ORDER BY p.price ASC';
    } else if (sortOption === 'price_desc') {
      orderClause = 'ORDER BY p.price DESC';
    } else if (sortOption === 'rating_desc') {
      orderClause = 'ORDER BY p.rating DESC';
    }

    // Execute query with price_history average subquery for real-time price status
    const query = `
      SELECT 
        p.id,
        p.category_id,
        c.name AS category,
        c.slug AS category_slug,
        p.name,
        p.description,
        p.price,
        p.rating,
        p.stock,
        p.image_url AS image,
        p.specifications,
        p.is_active,
        p.created_at,
        ROUND(AVG(ph.price)) AS avg_price
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN price_history ph ON p.id = ph.product_id
      WHERE ${whereClauses.join(' AND ')}
      GROUP BY p.id, c.name, c.slug
      ${orderClause};
    `;

    const [rows] = await pool.query(query, params);

    // Format products to match frontend expectations exactly
    const products = rows.map((row) => {
      const stock = Number(row.stock);
      return {
        id: row.id,
        name: row.name,
        category: row.category,
        categorySlug: row.category_slug,
        description: row.description,
        price: Number(row.price),
        rating: Number(row.rating),
        stock,
        inStock: stock > 0,
        image: row.image,
        specifications: parseSpecs(row.specifications),
        priceStatus: computePriceStatus(Number(row.price), Number(row.avg_price)),
      };
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('Error in getProducts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
}

/**
 * GET /api/products/:id
 * Retrieve a single product by ID with full details, specs, and price history
 */
export async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const productId = Number(id);

    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // Fetch product joined with category
    const [productRows] = await pool.query(
      `
      SELECT 
        p.id,
        p.category_id,
        c.name AS category,
        c.slug AS category_slug,
        p.name,
        p.description,
        p.price,
        p.rating,
        p.stock,
        p.image_url AS image,
        p.specifications,
        p.is_active,
        p.created_at
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.is_active = TRUE
      LIMIT 1;
    `,
      [productId]
    );

    if (productRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const row = productRows[0];
    const stock = Number(row.stock);

    // Fetch historical price timeline for this product
    const [historyRows] = await pool.query(
      `
      SELECT id, price, recorded_at
      FROM price_history
      WHERE product_id = ?
      ORDER BY recorded_at ASC;
    `,
      [productId]
    );

    // Calculate price insights statistics
    const prices = historyRows.map((h) => Number(h.price));
    const avgPrice =
      prices.length > 0
        ? Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length)
        : Number(row.price);
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : Number(row.price);
    const highestPrice = prices.length > 0 ? Math.max(...prices) : Number(row.price);

    const priceStatus = computePriceStatus(Number(row.price), avgPrice);

    const product = {
      id: row.id,
      name: row.name,
      category: row.category,
      categorySlug: row.category_slug,
      description: row.description,
      price: Number(row.price),
      rating: Number(row.rating),
      stock,
      inStock: stock > 0,
      image: row.image,
      specifications: parseSpecs(row.specifications),
      priceStatus,
      priceInsights: {
        avgPrice,
        lowestPrice,
        highestPrice,
        priceStatus,
        history: historyRows.map((h) => ({
          price: Number(h.price),
          recordedAt: h.recorded_at,
        })),
      },
    };

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error in getProductById:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product details',
      error: error.message,
    });
  }
}
