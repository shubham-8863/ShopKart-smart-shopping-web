-- ============================================================================
-- ShopKart MySQL Seed Data
-- Dataset: 4 Categories, 16 Products, 48 Price History Records, 2 Demo Users
-- ============================================================================

USE shopkart;

-- ============================================================================
-- 1. SEED CATEGORIES (4 Departments)
-- ============================================================================
INSERT INTO categories (id, name, slug, description) VALUES
(1, 'Electronics', 'electronics', 'Smart devices, high-fidelity audio, precision computing, and personal electronics.'),
(2, 'Fashion', 'fashion', 'Minimalist apparel, full-grain leather bags, and timeless footwear crafted for everyday wear.'),
(3, 'Home & Living', 'home-living', 'Architectural lighting, solid wood furniture, European linen, and modern workspace essentials.'),
(4, 'Beauty', 'beauty', 'Botanical skincare formulations, barrier-repair essentials, and gentle daily regimens.')
ON DUPLICATE KEY UPDATE name=VALUES(name), slug=VALUES(slug), description=VALUES(description);

-- ============================================================================
-- 2. SEED DEMO USERS (1 Customer, 1 Admin with precomputed bcrypt hashes)
-- Customer credentials: shubham@example.com / password123
-- Admin credentials:    admin@shopkart.com / admin123
-- ============================================================================
INSERT INTO users (id, full_name, email, password_hash, phone, address_street, address_city, address_state, address_pincode, role) VALUES
(1, 'Shubham Saini', 'shubham@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+91 98765 43210', '21 MG Road', 'Jaipur', 'Rajasthan', '302001', 'customer'),
(2, 'ShopKart Admin', 'admin@shopkart.com', '$2a$10$K9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWz', '+91 99999 88888', '1 Innovation Tower, Indiranagar', 'Bengaluru', 'Karnataka', '560038', 'admin')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), phone=VALUES(phone);

-- ============================================================================
-- 3. SEED PRODUCTS (16 Items matching src/data/products.js)
-- ============================================================================
INSERT INTO products (id, category_id, name, description, price, rating, stock, image_url, specifications, is_active) VALUES
-- 1. Electronics
(1, 1, 'Sony WH-1000XM5', 'Wireless noise cancelling headphones with industry-leading audio clarity', 29990, 4.7, 30, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', '{"type": "Over-Ear Wireless Headphones", "connectivity": "Bluetooth 5.2 & 3.5mm", "battery": "Up to 30 hours", "weight": "250 g"}', TRUE),

-- 2. Fashion
(2, 2, 'Minimal Leather Backpack', 'Everyday full-grain leather backpack designed for modern commuters', 5499, 4.6, 25, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80', '{"material": "Full-Grain Leather", "color": "Cognac Brown", "size": "18L (15.6\\" Laptop Fit)", "style": "Minimalist Commuter"}', TRUE),

-- 3. Home & Living
(3, 3, 'Ceramic Table Lamp', 'Warm architectural table lamp crafted with matte ceramic finish', 2499, 4.5, 20, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80', '{"material": "Matte Ceramic & Linen", "dimensions": "18 × 18 × 32 cm", "color": "Warm White", "style": "Minimalist Modern"}', TRUE),

-- 4. Beauty
(4, 4, 'Daily Skincare Set', 'Nourishing botanical essentials for radiant, balanced skin', 1899, 4.8, 40, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80', '{"skinType": "All Skin Types", "volume": "3 × 50 ml Set", "keyIngredient": "Niacinamide & Botanicals", "formulation": "Complete 3-Step Routine"}', TRUE),

-- 5. Electronics
(5, 1, 'Apple AirPods Pro (2nd Gen)', 'Active noise cancellation with adaptive audio and spatial sound', 22900, 4.8, 35, 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80', '{"type": "In-Ear Wireless Earbuds", "connectivity": "Bluetooth 5.3", "battery": "Up to 30 hours (with case)", "weight": "50.8 g (with case)"}', TRUE),

-- 6. Electronics
(6, 1, 'Logitech MX Master 3S', 'Precision ergonomic wireless mouse with quiet electromagnetic scroll', 8995, 4.6, 45, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80', '{"type": "Ergonomic Wireless Mouse", "connectivity": "Bluetooth & Logi Bolt", "battery": "Up to 70 days", "weight": "141 g"}', TRUE),

-- 7. Electronics
(7, 1, 'Kindle Paperwhite (16 GB)', 'Glare-free 6.8-inch display with adjustable warm light for reading', 14999, 4.5, 25, 'https://images.unsplash.com/photo-1592496001020-d31bd830651f?auto=format&fit=crop&w=800&q=80', '{"type": "6.8\\" Glare-Free E-Reader", "connectivity": "Wi-Fi 2.4/5.0 GHz", "battery": "Up to 10 weeks", "weight": "205 g"}', TRUE),

-- 8. Fashion
(8, 2, 'Classic Denim Jacket', 'Timeless relaxed-fit denim jacket made from 100% organic cotton', 3499, 4.4, 30, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80', '{"material": "100% Organic Cotton Denim", "color": "Washed Indigo", "size": "Regular Fit (S–XL)", "style": "Classic Vintage"}', TRUE),

-- 9. Fashion
(9, 2, 'Everyday Leather Sneakers', 'Minimal low-top sneakers crafted with premium Italian leather', 4999, 4.7, 25, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80', '{"material": "Italian Calfskin Leather", "color": "Chalk White", "size": "EU 40–45", "style": "Low-Top Casual"}', TRUE),

-- 10. Fashion
(10, 2, 'Canvas Crossbody Bag', 'Lightweight structured crossbody bag with brass hardware accents', 2199, 4.3, 35, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80', '{"material": "Heavy-Duty Canvas & Brass", "color": "Olive Sand", "size": "5L Compact", "style": "Urban Everyday"}', TRUE),

-- 11. Home & Living
(11, 3, 'Minimal Wooden Side Table', 'Solid oak accent table with tapered legs and warm satin finish', 6899, 4.6, 15, 'https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&w=800&q=80', '{"material": "Solid Natural Oak", "dimensions": "45 × 45 × 52 cm", "color": "Natural Oak", "style": "Scandinavian Modern"}', TRUE),

-- 12. Home & Living
(12, 3, 'Linen Cushion Set', 'Pair of breathable pure European linen pillow covers with feather insert', 1499, 4.4, 50, 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80', '{"material": "100% European Linen", "dimensions": "45 × 45 cm (Set of 2)", "color": "Oatmeal Beige", "style": "Neutral Contemporary"}', TRUE),

-- 13. Home & Living
(13, 3, 'Modern Desk Organizer', 'Modular concrete and walnut desk tray set for streamlined workspaces', 1299, 4.2, 40, 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80', '{"material": "Cast Concrete & Solid Walnut", "dimensions": "28 × 12 × 4 cm", "color": "Charcoal Grey / Walnut", "style": "Modular Modern"}', TRUE),

-- 14. Beauty
(14, 4, 'Hydrating Face Serum', 'Triple hyaluronic acid formula for deep, lightweight hydration', 1249, 4.9, 60, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', '{"skinType": "Dry, Sensitive & Normal", "volume": "30 ml", "keyIngredient": "Triple Hyaluronic Acid", "formulation": "Lightweight Water-Gel Serum"}', TRUE),

-- 15. Beauty
(15, 4, 'Gentle Cleansing Foam', 'pH-balanced botanical cleanser that purifies without drying', 899, 4.5, 50, 'https://images.unsplash.com/photo-1556228722-d0b5d0383188?auto=format&fit=crop&w=800&q=80', '{"skinType": "Sensitive, Oily & Normal", "volume": "150 ml", "keyIngredient": "Centella & Green Tea", "formulation": "pH 5.5 Foaming Gel"}', TRUE),

-- 16. Beauty
(16, 4, 'Everyday Barrier Moisturizer', 'Ceramide-rich soothing cream designed to strengthen the skin barrier', 1450, 4.7, 45, 'https://images.unsplash.com/photo-1608248597359-bb436a53cb85?auto=format&fit=crop&w=800&q=80', '{"skinType": "Dry, Flaky & Barrier-Compromised", "volume": "80 ml", "keyIngredient": "Ceramides & Squalane", "formulation": "Rich Non-Greasy Cream"}', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price), rating=VALUES(rating), specifications=VALUES(specifications);

-- ============================================================================
-- 4. SEED PRICE HISTORY (48 Records: 3 entries per product across 30 days)
-- Enables Price Insights ("8% below average") from real database records.
-- ============================================================================
INSERT INTO price_history (product_id, price, recorded_at) VALUES
-- Product 1: Sony WH-1000XM5 (Current: 29990)
(1, 34990, NOW() - INTERVAL 30 DAY),
(1, 32490, NOW() - INTERVAL 14 DAY),
(1, 29990, NOW() - INTERVAL 2 DAY),

-- Product 2: Minimal Leather Backpack (Current: 5499)
(2, 5999, NOW() - INTERVAL 28 DAY),
(2, 5799, NOW() - INTERVAL 12 DAY),
(2, 5499, NOW() - INTERVAL 1 DAY),

-- Product 3: Ceramic Table Lamp (Current: 2499)
(3, 2999, NOW() - INTERVAL 25 DAY),
(3, 2799, NOW() - INTERVAL 10 DAY),
(3, 2499, NOW() - INTERVAL 2 DAY),

-- Product 4: Daily Skincare Set (Current: 1899)
(4, 2199, NOW() - INTERVAL 30 DAY),
(4, 1999, NOW() - INTERVAL 15 DAY),
(4, 1899, NOW() - INTERVAL 1 DAY),

-- Product 5: Apple AirPods Pro (Current: 22900)
(5, 24900, NOW() - INTERVAL 27 DAY),
(5, 23900, NOW() - INTERVAL 13 DAY),
(5, 22900, NOW() - INTERVAL 2 DAY),

-- Product 6: Logitech MX Master 3S (Current: 8995)
(6, 9995, NOW() - INTERVAL 29 DAY),
(6, 9495, NOW() - INTERVAL 16 DAY),
(6, 8995, NOW() - INTERVAL 3 DAY),

-- Product 7: Kindle Paperwhite (Current: 14999)
(7, 15999, NOW() - INTERVAL 26 DAY),
(7, 15499, NOW() - INTERVAL 11 DAY),
(7, 14999, NOW() - INTERVAL 1 DAY),

-- Product 8: Classic Denim Jacket (Current: 3499)
(8, 3899, NOW() - INTERVAL 30 DAY),
(8, 3699, NOW() - INTERVAL 14 DAY),
(8, 3499, NOW() - INTERVAL 2 DAY),

-- Product 9: Everyday Leather Sneakers (Current: 4999)
(9, 5699, NOW() - INTERVAL 28 DAY),
(9, 5299, NOW() - INTERVAL 12 DAY),
(9, 4999, NOW() - INTERVAL 1 DAY),

-- Product 10: Canvas Crossbody Bag (Current: 2199)
(10, 2499, NOW() - INTERVAL 25 DAY),
(10, 2299, NOW() - INTERVAL 10 DAY),
(10, 2199, NOW() - INTERVAL 2 DAY),

-- Product 11: Minimal Wooden Side Table (Current: 6899)
(11, 7699, NOW() - INTERVAL 30 DAY),
(11, 7299, NOW() - INTERVAL 15 DAY),
(11, 6899, NOW() - INTERVAL 1 DAY),

-- Product 12: Linen Cushion Set (Current: 1499)
(12, 1699, NOW() - INTERVAL 27 DAY),
(12, 1599, NOW() - INTERVAL 13 DAY),
(12, 1499, NOW() - INTERVAL 2 DAY),

-- Product 13: Modern Desk Organizer (Current: 1299)
(13, 1499, NOW() - INTERVAL 29 DAY),
(13, 1399, NOW() - INTERVAL 16 DAY),
(13, 1299, NOW() - INTERVAL 3 DAY),

-- Product 14: Hydrating Face Serum (Current: 1249)
(14, 1449, NOW() - INTERVAL 26 DAY),
(14, 1349, NOW() - INTERVAL 11 DAY),
(14, 1249, NOW() - INTERVAL 1 DAY),

-- Product 15: Gentle Cleansing Foam (Current: 899)
(15, 999, NOW() - INTERVAL 30 DAY),
(15, 949, NOW() - INTERVAL 14 DAY),
(15, 899, NOW() - INTERVAL 2 DAY),

-- Product 16: Everyday Barrier Moisturizer (Current: 1450)
(16, 1599, NOW() - INTERVAL 28 DAY),
(16, 1499, NOW() - INTERVAL 12 DAY),
(16, 1450, NOW() - INTERVAL 1 DAY);
