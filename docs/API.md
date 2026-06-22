# REST API Reference

Base URL: `http://localhost:5000/api/v1`

Protected endpoints require `Authorization: Bearer <jwt>`. JSON success responses use:

```json
{ "success": true, "message": "Success", "data": {}, "meta": {} }
```

Errors use:

```json
{ "success": false, "message": "Validation failed", "errors": [{ "field": "email", "message": "A valid email is required" }] }
```

Pagination accepts `page` and `limit` (maximum 100). Paginated responses include `meta.page`, `meta.limit`, `meta.total`, and `meta.pages`.

## Authentication

| Method | Endpoint | Access | Body |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | `name`, `email`, `password` |
| POST | `/auth/login` | Public | `email`, `password` |
| GET | `/auth/me` | User/Admin | - |

Passwords need at least eight characters, uppercase, lowercase, and a number. Public registration always creates a user role.

## Products

| Method | Endpoint | Access | Notes |
| --- | --- | --- | --- |
| GET | `/products` | Public | `keyword`/`search`, `category`, `minPrice`, `maxPrice`, `sort`, `page`, `limit` |
| GET | `/products/categories` | Public | Available category counts |
| GET | `/products/trending?limit=8` | Public | Products ranked by ordered quantity |
| GET | `/products/:id` | Public | Product details |

The public list only returns available products. Supported sorts are `-createdAt`, `createdAt`, `-price`, `price`, `-name`, and `name`; the legacy `price_asc` and `price_desc` values remain supported.

## Cart

| Method | Endpoint | Access | Body |
| --- | --- | --- | --- |
| GET | `/cart` | User/Admin | - |
| POST | `/cart/items` | User/Admin | `productId`, optional `quantity` |
| PATCH | `/cart/items/:productId` | User/Admin | `quantity` |
| DELETE | `/cart/items/:productId` | User/Admin | - |
| DELETE | `/cart` | User/Admin | Clear all items |

Prices and totals are refreshed from current product data by the server.

## Orders and Payment

| Method | Endpoint | Access | Body / query |
| --- | --- | --- | --- |
| POST | `/orders` | User/Admin | `shippingAddress`, `paymentMethod` (`COD` or `ONLINE`) |
| GET | `/orders` | User/Admin | `page`, `limit` |
| GET | `/orders/:id` | Owner | - |
| PATCH | `/orders/:id/cancel` | Owner | Pending/confirmed orders only |
| POST | `/orders/:id/pay` | Owner | `{ "simulate": "success" }` or `failure` |

`shippingAddress` contains `street`, `city`, `phone`, and optional `label` and `notes`. Online payment is a development-only mock. A successful mock payment marks the order paid and confirmed.

Order flow: `Pending -> Confirmed -> Preparing -> Out for Delivery -> Delivered`. Cancellation is available before delivery starts. COD becomes paid on delivery.

## Admin

All admin routes require an authenticated `admin` role.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/admin/stats` | User, order, product, and paid revenue totals |
| GET | `/admin/products` | All products, including unavailable products |
| POST | `/admin/products` | Create a product |
| PATCH | `/admin/products/:id` | Update supplied fields |
| DELETE | `/admin/products/:id` | Delete a product |
| GET | `/admin/orders` | All orders; filter by `status` or `paymentStatus` |
| GET | `/admin/orders/:id` | Order and customer details |
| PATCH | `/admin/orders/:id/status` | Body: `{ "status": "Preparing" }` |

Product creates and updates use `multipart/form-data`. Text fields are `name`, `description`, `category`, `price`, `stock`, and optional `isAvailable`; the image file field is `image`. Images are required on create and optional on update. JPEG, PNG, WebP, and AVIF files up to 5 MB are accepted. Supported categories are Pizza, Burgers, Pasta, Drinks, and Desserts.

The API rejects invalid or backward order status transitions with HTTP `409`.
