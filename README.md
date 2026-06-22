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
   docker compose up -d mongodb
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

The seed command requires `ADMIN_PASSWORD`. It uploads generated sample artwork to Cloudinary and stores only each asset's `public_id` and `secure_url`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run API and Vite client in watch mode |
| `npm run build` | Produce the frontend production bundle |
| `npm test` | Run backend unit tests |
| `npm run seed` | Upsert sample products and the admin user |
| `npm run migrate:images -w backend` | Move legacy image URLs into Cloudinary metadata |
| `npm run db:indexes -w backend` | Reconcile MongoDB indexes with the schemas |
| `npm start -w backend` | Run only the API |

## API and Postman

- Endpoint reference: [`docs/API.md`](docs/API.md)
- Backend optimization decisions: [`docs/BACKEND_OPTIMIZATION.md`](docs/BACKEND_OPTIMIZATION.md)
- Postman collection: [`postman/Table-and-Thyme.postman_collection.json`](postman/Table-and-Thyme.postman_collection.json)

The collection stores JWTs from successful login/register calls automatically. Set its `baseUrl` variable if the API does not run at the default address.

## Production Notes

- Use a managed MongoDB replica set, TLS, and a secrets manager.
- Serve the frontend build from a CDN and set `CLIENT_URL` to allowed origins (comma separated).
- Replace the mock payment endpoint with a provider checkout session plus a verified webhook. Never trust a payment result sent by the browser.
- Redis is required in production and shares cache and rate-limit state across API instances.
- Run the API behind HTTPS and an application-aware reverse proxy.
- For inventory under high concurrency, move order creation and stock updates into a MongoDB transaction on a replica set.
