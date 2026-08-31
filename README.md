# ShopKart

A full-stack e-commerce platform featuring dynamic product discovery, server-authoritative cart and order checkout, automated price tracking, purchase-verified customer ratings, and role-based administrative catalog and fulfillment management.

---

## Overview

ShopKart is built to demonstrate end-to-end e-commerce engineering with an emphasis on data integrity, immutable financial transactions, and secure role separation. It combines a responsive React frontend with an Express REST backend backed by relational MySQL.

- **Live demo**: [https://shopkart-zagj.onrender.com](https://shopkart-zagj.onrender.com)

---

## Key Features

### Customer Experience
- **Catalog Discovery**: Real-time keyword search, department filtering, price ranges, rating filters, and multi-field sorting.
- **Product Insights & Comparison**: Historical price trends, market price status, and side-by-side specification comparison.
- **Cart & Wishlist**: Server-persisted cart with stock enforcement, delivery charge rules, and saved wishlist items.
- **Checkout & Orders**: ACID-compliant order transactions, historical order logs, and a 4-step fulfillment status timeline.
- **Price Alerts**: Target price alerts evaluated on a scheduled background cycle via `node-cron`.
- **Verified Ratings**: 1–5 star customer ratings restricted strictly to confirmed order purchasers.
- **Account Management**: Profile and default delivery address management.

### Administrative Management
- **Catalog Management**: Create, edit, activate, and soft-delete products with dynamic category specifications.
- **Price & Stock Controls**: Live price updates with automated `price_history` tracking and stock level management.
- **Order Fulfillment**: Platform-wide order visibility with controlled status transitions (`Placed → Processing → Shipped → Delivered`).

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Lucide React, Client Hash Routing |
| **Backend** | Node.js, Express.js, `mysql2/promise`, JWT, `bcryptjs`, `node-cron` |
| **Database** | MySQL 8+ (InnoDB, UTF-8 Unicode), Aiven Managed Cloud MySQL |
| **Deployment** | Render (Frontend & Backend Web Services), Aiven (Database) |


## Core Design Decisions

- **Relational Integrity**: Modeled with foreign key cascades and composite unique constraints (`user_id`, `product_id`) for cart, wishlist, reviews, and alerts.
- **Server-Authoritative Finances**: Cart subtotals, free-delivery thresholds (₹2,000), and final totals are computed strictly on the backend.
- **Immutable Historical Orders**: Historical `orders` and `order_items.unit_price` are frozen at checkout and remain immutable when catalog prices change.
- **Purchase-Verified Ratings**: Customer ratings require a confirmed purchase order; product averages are calculated and stored by the database.
- **Append-Only Price History**: Price adjustments create timestamped records in `price_history` to power customer price insights.
- **Controlled Order Lifecycle**: State machine restricts status jumps (e.g., `Placed → Processing → Shipped → Delivered`), preventing invalid transitions.
- **Zero Client-Side Secret Exposure**: All database credentials and JWT signing secrets are isolated on the server.



## Database Schema

```text
users (id, email, password_hash, role, full_name, address_*)
  ├── categories (id, name, slug)
  ├── products (id, category_id, name, price, stock, rating, specifications, is_active)
  │     ├── price_history (id, product_id, price, recorded_at)
  │     ├── cart_items (id, user_id, product_id, quantity)
  │     ├── wishlist_items (id, user_id, product_id)
  │     └── price_alerts (id, user_id, product_id, target_price, is_active, is_triggered)
  └── orders (id, order_code, user_id, status, subtotal, delivery_cost, total_amount, shipping_*)
        ├── order_items (id, order_id, product_id, quantity, unit_price)
        └── reviews (id, user_id, product_id, order_id, rating)
```

---

## Local Development Setup

### Prerequisites
- Node.js `>= 18.0.0`
- MySQL 8+ instance

### 1. Database Initialization
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p shopkart < database/seed.sql
```

### 2. Backend Setup
```bash
cd Backend
npm install
cp .env.example .env
# Configure DB credentials and JWT_SECRET in Backend/.env
npm run dev
```

### 3. Frontend Setup
```bash
# In project root
npm install
cp .env.example .env
npm run dev
```
Frontend runs at `http://localhost:5173`, Backend runs at `http://localhost:5000`.

---

## Environment Variables

### Frontend (`.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend (`Backend/.env`)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=shopkart
DB_PORT=3306

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```



## Security Highlights

- **Authentication**: `bcryptjs` salted password hashing with signed JWTs on all protected endpoints.
- **Role Authorization**: `requireAdmin` middleware strictly guards `/api/admin/*` (`403 Forbidden` for non-admin accounts).
- **SQL Injection Prevention**: 100% parameterized queries (`?` placeholders).
- **User Data Isolation**: User endpoints enforce `user_id = req.user.id`; requests for other users' records return `404 Not Found`.

---

## Future Improvements

- **WebSockets / SSE**: Push-based real-time order status notifications.
- **Cloud Media Storage**: Direct image upload pipelines via AWS S3 or Cloudinary.
- **Payment Gateway**: Integration with Stripe / Razorpay for live digital transactions.
- **Customer Written Reviews**: Text-based review moderation alongside the current 1–5 star rating system.

