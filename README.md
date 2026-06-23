# Table & Thyme - Online Food Ordering

A full-stack food ordering prototype built with Express, MongoDB, and React. It includes server-calculated carts, order tracking, mock online payments, admin operations, responsive layouts, and English/Arabic localization with RTL support.

## Architecture

The backend follows a layered architecture:

- `controllers/` translates HTTP requests and responses.
- `services/` owns business logic and database workflows.
- `repositories/` owns query construction, projections, and persistence access.
- `models/` defines persistence rules and indexes.
- `routes/` declares the REST surface and access control.
- `validators/` validates and normalizes input before controllers run.
- `middlewares/` centralizes JWT auth, RBAC, validation, 404s, and errors.

The frontend uses reusable pages/components, Context API for authentication and cart state, an Axios API client, protected routes, and `react-i18next`.

## Features

- Registration and login with bcrypt password hashing and JWT authentication
- User/admin role-based access control
- Menu search, category filters, product details, stock and availability
- Persistent backend cart with authoritative price calculations
- COD and mock online payment checkout
- User order history, cancellation, status history, and 10-second status polling
- Admin statistics, product CRUD, order filters, and guarded status transitions
- English and Arabic language switching persisted in local storage
- Responsive UI with Arabic RTL layout
- Cloudinary-backed product images with automatic replacement/deletion cleanup
- Redis response caching and distributed rate-limit state
- Helmet, HPP, XSS sanitization, CORS, compression, payload limits, and centralized errors
- Structured Pino request/application logging
- Pagination and consistent `{ success, message, data, meta? }` responses

## Prerequisites

- Node.js 20.19+ (Node.js 22 LTS recommended)
- npm 10+
- MongoDB 7+ locally, or Docker Desktop

## Setup

1. Install all workspace dependencies:

   ```bash
   npm install
   ```

2. Start MongoDB and Redis locally, or use Docker:

   ```bash
   docker compose up -d mongodb redis
   ```

3. Create environment files from the included examples:

   ```powershell
   Copy-Item backend/.env.example backend/.env
   Copy-Item frontend/.env.example frontend/.env
   ```

4. Set a random `JWT_SECRET` of at least 32 characters, add your Cloudinary credentials, and use a strong admin password. Never commit `.env`.

5. Seed the admin account and sample menu:

   ```bash
   npm run seed
   ```

   Existing installations that stored image URL strings should first run `npm run migrate:images -w backend`. Production deployments should run `npm run db:indexes -w backend` when applying this release.

6. Start both applications:

   ```bash
   npm run dev
   ```

Open `http://localhost:5173`. The API health endpoint is `http://localhost:5000/api/health`.

Sign in as the admin with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` values from `backend/.env`. For convenience, your local credentials are also kept in the gitignored `CREDENTIALS.local.md`. Never commit real passwords to tracked files.

The seed command requires `ADMIN_PASSWORD`. It uploads generated sample artwork to Cloudinary and stores only each asset's `public_id` and `secure_url`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run API and Vite client in watch mode |
| `npm run build` | Produce the frontend production bundle |
| `npm test` | Run backend unit tests |
| `npm run seed` | Upsert sample products and the admin user |
| `npm run seed:admin -w backend` | Upsert/reset only the admin user |
| `npm run migrate:images -w backend` | Move legacy image URLs into Cloudinary metadata |
| `npm run db:indexes -w backend` | Reconcile MongoDB indexes with the schemas |
| `npm start -w backend` | Run only the API |

## API Reference

Base URL: `http://localhost:5000/api/v1`. Protected endpoints require `Authorization: Bearer <jwt>`. Success responses use `{ success, message, data, meta? }`; validation errors return `{ success: false, message, errors }`.

### Auth

| Method | Endpoint | Access | Body |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | `name`, `email`, `password` |
| `POST` | `/auth/login` | Public | `email`, `password` |
| `GET` | `/auth/me` | User/Admin | - |

### Products

| Method | Endpoint | Access | Notes |
| --- | --- | --- | --- |
| `GET` | `/products` | Public | Supports `page`, `limit`, `category`, `keyword`/`search`, `minPrice`, `maxPrice`, and `sort` |
| `GET` | `/products/categories` | Public | Available category counts |
| `GET` | `/products/trending?limit=8` | Public | Products ranked by ordered quantity |
| `GET` | `/products/:id` | Public | Product details |

Supported product sorts are `-createdAt`, `createdAt`, `-price`, `price`, `-name`, `name`, `price_asc`, and `price_desc`.

### Cart

| Method | Endpoint | Access | Body |
| --- | --- | --- | --- |
| `GET` | `/cart` | User/Admin | - |
| `POST` | `/cart/items` | User/Admin | `productId`, optional `quantity` |
| `PATCH` | `/cart/items/:productId` | User/Admin | `quantity` |
| `DELETE` | `/cart/items/:productId` | User/Admin | - |
| `DELETE` | `/cart` | User/Admin | Clear cart |

Prices and totals are recalculated on the server from current product data.

### Orders

| Method | Endpoint | Access | Body / query |
| --- | --- | --- | --- |
| `POST` | `/orders` | User/Admin | `shippingAddress`, `paymentMethod` (`COD` or `ONLINE`) |
| `GET` | `/orders` | User/Admin | `page`, `limit` |
| `GET` | `/orders/:id` | Owner | - |
| `PATCH` | `/orders/:id/cancel` | Owner | Pending/confirmed orders only |
| `POST` | `/orders/:id/pay` | Owner | `{ "simulate": "success" }` or `{ "simulate": "failure" }` |

Order flow is `Pending -> Confirmed -> Preparing -> Out for Delivery -> Delivered`. Cancellation is allowed only before delivery starts.

### Admin

All admin routes require an authenticated `admin` role.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/admin/stats` | User, order, product, and paid revenue totals |
| `GET` | `/admin/products` | All products, including unavailable products |
| `POST` | `/admin/products` | Create product with multipart image field `image` |
| `PATCH` | `/admin/products/:id` | Update product fields and optionally replace image |
| `DELETE` | `/admin/products/:id` | Delete product and Cloudinary image |
| `GET` | `/admin/orders` | All orders; filter by `status` or `paymentStatus` |
| `GET` | `/admin/orders/:id` | Order and customer details |
| `PATCH` | `/admin/orders/:id/status` | Update order status |

Product image uploads accept JPEG, PNG, WebP, and AVIF files up to 5 MB. Images are required on create and optional on update.

The Postman collection is available at [`postman/Table-and-Thyme.postman_collection.json`](postman/Table-and-Thyme.postman_collection.json). It stores JWTs from successful login/register calls automatically.

## Backend Optimization Notes

- Cloudinary is handled by a reusable service layer. Products and order snapshots store only `public_id` and `secure_url`; local image storage and direct third-party URLs are avoided.
- Product image creates clean up the uploaded asset if database persistence fails. Updates replace the remote image, and product deletion removes the Cloudinary image.
- Read-only repository queries use `lean()`, explicit `.select()` projections, bounded pagination, stable allowlisted sorting, and parallel count/data reads.
- Product search uses MongoDB text search. Indexes target real access patterns: product text/category/price reads, user order history, admin order queues, user email, and cart user.
- Redis caches product lists, product details, category counts, and trending products. Product mutations, stock reservations, cancellations, and deletes invalidate product cache keys automatically.
- HTTP performance and safety middleware includes compression, rate limiting, Helmet, HPP, CORS, request payload limits, XSS sanitization, and centralized error handling.
- Pino provides structured request/application logging with sensitive values redacted.
- Stock reservation is performed concurrently and partial reservations are rolled back with bulk writes if order creation fails.

## Production Notes

- Use a managed MongoDB replica set, TLS, and a secrets manager.
- Serve the frontend build from a CDN and set `CLIENT_URL` to allowed origins (comma separated).
- Replace the mock payment endpoint with a provider checkout session plus a verified webhook. Never trust a payment result sent by the browser.
- Redis is required in production and shares cache and rate-limit state across API instances.
- Run the API behind HTTPS and an application-aware reverse proxy.
- For inventory under high concurrency, move order creation and stock updates into a MongoDB transaction on a replica set.
