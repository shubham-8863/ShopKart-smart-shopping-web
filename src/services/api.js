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
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
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

export default {
  getCategories,
  getProducts,
  getProductById,
};
