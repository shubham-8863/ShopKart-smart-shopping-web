-- ============================================================================
-- ShopKart MySQL Database Schema
-- Architecture: Relational with Hybrid JSON Specifications
-- Engine: MySQL 8+ / InnoDB / utf8mb4_unicode_ci
-- ============================================================================

CREATE DATABASE IF NOT EXISTS shopkart;
USE shopkart;

-- ============================================================================
-- 1. USERS TABLE
-- Stores user accounts, credentials, role-based access, and default address.
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NULL,
  address_street VARCHAR(255) NULL,
  address_city VARCHAR(100) NULL,
  address_state VARCHAR(100) NULL,
  address_pincode VARCHAR(10) NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. CATEGORIES TABLE
-- Master lookup for store departments (Electronics, Fashion, Home & Living, Beauty).
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. PRODUCTS TABLE
-- Catalog items with integer INR prices, ratings, stock, and JSON specifications.
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  price INT UNSIGNED NOT NULL,
  rating DECIMAL(2,1) NOT NULL DEFAULT 0.0,
  stock INT UNSIGNED NOT NULL DEFAULT 50,
  image_url VARCHAR(500) NOT NULL,
  specifications JSON NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_products_category (category_id),
  INDEX idx_products_price (price),
  INDEX idx_products_rating (rating),
  INDEX idx_products_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. PRICE HISTORY TABLE
-- Append-only historical price records supporting Price Insights & average calculations.
-- ============================================================================
CREATE TABLE IF NOT EXISTS price_history (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  price INT UNSIGNED NOT NULL,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_price_history_product_date (product_id, recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. CART ITEMS TABLE
-- Active user shopping cart items with guaranteed 1 row per (user_id, product_id).
-- ============================================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_product_cart (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. WISHLIST ITEMS TABLE
-- Persisted wishlist items linked to authenticated user accounts.
-- ============================================================================
CREATE TABLE IF NOT EXISTS wishlist_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_product_wishlist (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. PRICE ALERTS TABLE
-- User target price tracking with composite uniqueness to prevent duplicate active alerts.
-- ============================================================================
CREATE TABLE IF NOT EXISTS price_alerts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  target_price INT UNSIGNED NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_triggered BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_product_alert (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_active_alerts (is_active, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. ORDERS TABLE
-- Completed purchases capturing frozen customer, shipping, and total payment amounts.
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_code VARCHAR(20) NOT NULL UNIQUE,
  user_id INT UNSIGNED NOT NULL,
  status ENUM('Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Placed',
  payment_method VARCHAR(50) NOT NULL,
  subtotal INT UNSIGNED NOT NULL,
  delivery_cost INT UNSIGNED NOT NULL DEFAULT 0,
  total_amount INT UNSIGNED NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  shipping_address VARCHAR(255) NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_state VARCHAR(100) NOT NULL,
  shipping_pincode VARCHAR(10) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_orders_user (user_id),
  INDEX idx_orders_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. ORDER ITEMS TABLE
-- Line items preserving historical purchase unit_price at the exact moment of checkout.
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  unit_price INT UNSIGNED NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_order_items_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
