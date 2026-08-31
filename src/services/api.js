// Centralized API Client for ShopKart
// Communicates with the Express REST API

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Standardized fetch wrapper with HTTP and network error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        data?.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    if (data && data.success === false) {
      const error = new Error(data.message || 'API error occurred');
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }

    if (error.status) {
      throw error;
    }

    // Network / connectivity error
    console.error(`Network error requesting ${url}:`, error);
    const networkError = new Error(
      'Unable to connect to ShopKart server. Please check your connection and ensure the backend is running.'
    );
    networkError.isNetworkError = true;
    throw networkError;
  }
}

/* ==========================================================================
   Catalog API (Categories & Products)
   ========================================================================== */

/**
 * Fetch all categories: GET /api/categories
 */
export async function getCategories(signal) {
  const result = await request('/categories', { signal });
  return result.data || [];
}

/**
 * Fetch filtered/sorted products: GET /api/products?...
 * @param {Object} params - { search, category, minPrice, maxPrice, minRating, sortBy, ids }
 * @param {AbortSignal} signal - Optional abort signal
 */
export async function getProducts(params = {}, signal) {
  const searchParams = new URLSearchParams();

  if (params.search && params.search.trim()) {
    searchParams.append('search', params.search.trim());
  }

  if (
    params.category &&
    params.category.trim() &&
    params.category !== 'All Categories' &&
    params.category !== 'all'
  ) {
    searchParams.append('category', params.category.trim());
  }

  if (
    params.minPrice !== '' &&
    params.minPrice !== undefined &&
    params.minPrice !== null &&
    !isNaN(Number(params.minPrice))
  ) {
    searchParams.append('minPrice', params.minPrice);
  }

  if (
    params.maxPrice !== '' &&
    params.maxPrice !== undefined &&
    params.maxPrice !== null &&
    !isNaN(Number(params.maxPrice))
  ) {
    searchParams.append('maxPrice', params.maxPrice);
  }

  if (
    params.minRating &&
    params.minRating !== 'all' &&
    !isNaN(Number(params.minRating))
  ) {
    searchParams.append('minRating', params.minRating);
  }

  if (params.sortBy && params.sortBy !== 'recommended') {
    searchParams.append('sortBy', params.sortBy);
  }

  if (params.ids) {
    searchParams.append('ids', params.ids);
  }

  const queryString = searchParams.toString();
  const endpoint = queryString ? `/products?${queryString}` : '/products';

  const result = await request(endpoint, { signal });
  return result.data || [];
}

/**
 * Fetch product details by ID: GET /api/products/:id
 * @param {number|string} id - Product ID
 * @param {AbortSignal} signal - Optional abort signal
 */
export async function getProductById(id, signal) {
  const result = await request(`/products/${id}`, { signal });
  return result.data;
}

/* ==========================================================================
   Admin Product Management API (Protected by JWT + Admin Role)
   ========================================================================== */

/**
 * Fetch all catalog products (active and inactive): GET /api/admin/products
 * @param {string} token - Admin JWT Token
 * @param {AbortSignal} [signal] - Optional abort signal
 */
export async function getAdminProducts(token, signal) {
  const result = await request('/admin/products', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });
  return result.data || [];
}

/**
 * Create a new catalog product: POST /api/admin/products
 * @param {Object} payload - { name, categoryId, description, price, stock, imageUrl, specifications, isActive }
 * @param {string} token - Admin JWT Token
 */
export async function createAdminProduct(payload, token) {
  const result = await request('/admin/products', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return result.data;
}

/**
 * Update an existing catalog product: PUT /api/admin/products/:id
 * @param {number|string} id - Product ID
 * @param {Object} payload - { name, categoryId, description, price, stock, imageUrl, specifications, isActive }
 * @param {string} token - Admin JWT Token
 */
export async function updateAdminProduct(id, payload, token) {
  const result = await request(`/admin/products/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return result.data;
}

/**
 * Deactivate a product (soft delete): DELETE /api/admin/products/:id
 * @param {number|string} id - Product ID
 * @param {string} token - Admin JWT Token
 */
export async function deactivateAdminProduct(id, token) {
  const result = await request(`/admin/products/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return result;
}

/* ==========================================================================
   Admin Order Management API (Protected by JWT + Admin Role)
   ========================================================================== */

/**
 * Fetch all customer orders: GET /api/admin/orders
 * @param {string} token - Admin JWT Token
 * @param {AbortSignal} [signal] - Optional abort signal
 */
export async function getAdminOrders(token, signal) {
  const result = await request('/admin/orders', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });
  return result.data || [];
}

/**
 * Fetch single order details by code or ID (Admin scope): GET /api/admin/orders/:id
 * @param {string|number} id - Order code or numeric ID
 * @param {string} token - Admin JWT Token
 * @param {AbortSignal} [signal] - Optional abort signal
 */
export async function getAdminOrderById(id, token, signal) {
  const result = await request(`/admin/orders/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });
  return result.data;
}

/**
 * Update order lifecycle status: PATCH /api/admin/orders/:id/status
 * @param {string|number} id - Order code or numeric ID
 * @param {string} status - New target status ('Processing' | 'Shipped' | 'Delivered' | 'Cancelled')
 * @param {string} token - Admin JWT Token
 */
export async function updateAdminOrderStatus(id, status, token) {
  const result = await request(`/admin/orders/${id}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  return result.data;
}

/* ==========================================================================
   Reviews & Ratings API
   ========================================================================== */

/**
 * Submit a customer star rating for a verified purchase: POST /api/reviews
 * @param {Object} payload - { productId, rating, orderId }
 * @param {string} token - JWT Token
 */
export async function createReview(payload, token) {
  const result = await request('/reviews', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return result.data;
}

/**
 * Fetch product ratings breakdown & user eligibility: GET /api/products/:productId/reviews
 * @param {number|string} productId - Product ID
 * @param {string} [token] - Optional JWT Token
 * @param {AbortSignal} [signal] - Optional abort signal
 */
export async function getProductReviews(productId, token, signal) {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const result = await request(`/products/${productId}/reviews`, {
    headers,
    signal,
  });
  return result.data;
}

/* ==========================================================================
   Authentication API (Register, Login, Current User)
   ========================================================================== */

/**
 * Register a new user: POST /api/auth/register
 * @param {Object} payload - { fullName, email, password, phone }
 */
export async function registerUser(payload) {
  const result = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return result.data;
}

/**
 * Authenticate user credentials: POST /api/auth/login
 * @param {Object} payload - { email, password }
 */
export async function loginUser(payload) {
  const result = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return result.data;
}

/**
 * Get current authenticated user session identity: GET /api/auth/me
 * @param {string} token - JWT Token
 * @param {AbortSignal} signal - Optional abort signal
 */
export async function getCurrentUser(token, signal) {
  const result = await request('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });
  return result.data?.user;
}

/* ==========================================================================
   User Account & Profile API (Authenticated)
   ========================================================================== */

/**
 * Fetch current authenticated user's profile and default address: GET /api/users/me
 * @param {string} token - JWT Token
 * @param {AbortSignal} signal - Optional abort signal
 */
export async function getCurrentUserProfile(token, signal) {
  const result = await request('/users/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });
  return result.data;
}

/**
 * Update current authenticated user's profile and default address: PUT /api/users/me
 * @param {Object} payload - { fullName, email, phone, address, city, state, pincode }
 * @param {string} token - JWT Token
 */
export async function updateCurrentUserProfile(payload, token) {
  const result = await request('/users/me', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return result.data;
}

/* ==========================================================================
   Wishlist API (Authenticated)
   ========================================================================== */

/**
 * Fetch authenticated user's wishlist: GET /api/wishlist
 * @param {string} token - JWT Token
 * @param {AbortSignal} signal - Optional abort signal
 */
export async function getWishlist(token, signal) {
  const result = await request('/wishlist', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });
  return result;
}

/**
 * Add a product to user's wishlist: POST /api/wishlist
 * @param {number|string} productId - Product ID
 * @param {string} token - JWT Token
 */
export async function addToWishlist(productId, token) {
  const result = await request('/wishlist', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId: Number(productId) }),
  });
  return result;
}

/**
 * Remove a product from user's wishlist: DELETE /api/wishlist/:productId
 * @param {number|string} productId - Product ID
 * @param {string} token - JWT Token
 */
export async function removeFromWishlist(productId, token) {
  const result = await request(`/wishlist/${productId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return result;
}

/* ==========================================================================
   Cart API (Authenticated)
   ========================================================================== */

/**
 * Fetch authenticated user's cart: GET /api/cart
 * @param {string} token - JWT Token
 * @param {AbortSignal} signal - Optional abort signal
 */
export async function getCart(token, signal) {
  const result = await request('/cart', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });
  return result.data;
}

/**
 * Add an item to authenticated user's cart: POST /api/cart/items
 * @param {number|string} productId - Product ID
 * @param {number} quantity - Item Quantity (default 1)
 * @param {string} token - JWT Token
 */
export async function addToCart(productId, quantity = 1, token) {
  const result = await request('/cart/items', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      productId: Number(productId),
      quantity: Number(quantity),
    }),
  });
  return result.data;
}

/**
 * Update quantity for a cart item: PATCH /api/cart/items/:productId
 * @param {number|string} productId - Product ID
 * @param {number} quantity - New target quantity
 * @param {string} token - JWT Token
 */
export async function updateCartItem(productId, quantity, token) {
  const result = await request(`/cart/items/${productId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      quantity: Number(quantity),
    }),
  });
  return result.data;
}

/**
 * Remove an item from authenticated user's cart: DELETE /api/cart/items/:productId
 * @param {number|string} productId - Product ID
 * @param {string} token - JWT Token
 */
export async function removeCartItem(productId, token) {
  const result = await request(`/cart/items/${productId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return result.data;
}

/**
 * Clear authenticated user's cart: DELETE /api/cart
 * @param {string} token - JWT Token
 */
export async function clearCart(token) {
  const result = await request('/cart', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return result.data;
}

/* ==========================================================================
   Orders API (Authenticated)
   ========================================================================== */

/**
 * Place a new order from current database cart: POST /api/orders
 * @param {Object} payload - { customerName, customerEmail, customerPhone, shippingAddress, shippingCity, shippingState, shippingPincode, paymentMethod }
 * @param {string} token - JWT Token
 */
export async function createOrder(payload, token) {
  const result = await request('/orders', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return result.data;
}

/**
 * Fetch authenticated user's order history: GET /api/orders
 * @param {string} token - JWT Token
 * @param {AbortSignal} signal - Optional abort signal
 */
export async function getOrders(token, signal) {
  const result = await request('/orders', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });
  return result.data || [];
}

/**
 * Fetch single order details by code or ID: GET /api/orders/:id
 * @param {string|number} id - Order code (e.g. SK1001) or numeric ID
 * @param {string} token - JWT Token
 * @param {AbortSignal} signal - Optional abort signal
 */
export async function getOrderById(id, token, signal) {
  const result = await request(`/orders/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });
  return result.data;
}

/* ==========================================================================
   Price Alerts API (Authenticated)
   ========================================================================== */

/**
 * Fetch authenticated user's price alerts: GET /api/price-alerts
 * @param {string} token - JWT Token
 * @param {AbortSignal} signal - Optional abort signal
 */
export async function getPriceAlerts(token, signal) {
  const result = await request('/price-alerts', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });
  return result.data || [];
}

/**
 * Set or update a price alert: POST /api/price-alerts
 * @param {number|string} productId - Product ID
 * @param {number} targetPrice - Target price in INR
 * @param {string} token - JWT Token
 */
export async function createPriceAlert(productId, targetPrice, token) {
  const result = await request('/price-alerts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      productId: Number(productId),
      targetPrice: Number(targetPrice),
    }),
  });
  return result.data;
}

/**
 * Update target price or active state: PATCH /api/price-alerts/:productId
 * @param {number|string} productId - Product ID
 * @param {Object} payload - { targetPrice, isActive }
 * @param {string} token - JWT Token
 */
export async function updatePriceAlert(productId, payload, token) {
  const result = await request(`/price-alerts/${productId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return result.data;
}

/**
 * Stop tracking a product: DELETE /api/price-alerts/:productId
 * @param {number|string} productId - Product ID
 * @param {string} token - JWT Token
 */
export async function deletePriceAlert(productId, token) {
  const result = await request(`/price-alerts/${productId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return result;
}

/* ==========================================================================
   Local Storage Token Helpers
   ========================================================================== */

export function getStoredToken() {
  return localStorage.getItem('shopkart_token');
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('shopkart_token', token);
  }
}

export function removeStoredToken() {
  localStorage.removeItem('shopkart_token');
}

export default {
  getCategories,
  getProducts,
  getProductById,
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deactivateAdminProduct,
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,
  createReview,
  getProductReviews,
  registerUser,
  loginUser,
  getCurrentUser,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  createOrder,
  getOrders,
  getOrderById,
  getPriceAlerts,
  createPriceAlert,
  updatePriceAlert,
  deletePriceAlert,
  getStoredToken,
  setStoredToken,
  removeStoredToken,
};
