# Backend Optimization Decisions

## Cloudinary lifecycle

`CloudinaryImageService` is the only layer that knows the Cloudinary SDK. Controllers receive an in-memory Multer file and pass it to the product service; no image is written to local disk. Product and order snapshot records contain only `public_id` and `secure_url`.

Creates upload before persistence and delete the new asset if persistence fails. Image updates follow the requested delete-then-upload order, and product deletion removes the remote asset before deleting the record. Every mutation invalidates product caches. Cloudinary credentials and the destination folder come only from environment variables.

The API accepts only JPEG, PNG, WebP, and AVIF images up to 5 MB. The seed command generates small SVG sample artwork in memory, uploads it, and never stores a third-party image URL.

## Query and index strategy

Product reads live in `ProductRepository`. Read-only queries use `lean()`, explicit projections, parallel data/count queries, bounded pagination, stable secondary `_id` sorts, and allowlisted filters and sort fields. Search uses MongoDB's weighted text index instead of an unbounded regular expression.

Indexes are limited to observed access patterns:

- Product text search: weighted `name` and `description`.
- Public category browsing: `{ isAvailable, category, createdAt }`.
- Price sorting/filtering: `{ isAvailable, price, _id }`.
- User order history: `{ user, createdAt }`.
- Admin order queues: `{ orderStatus, createdAt }` and `{ paymentStatus, createdAt }`.
- Unique identity/access paths remain on user email and cart user.

This deliberately avoids separate indexes for every field. Compound index prefixes serve the common predicates while reducing write amplification and memory usage.

Order and admin reads also use projections and lean results. Populated user/product fields are explicitly limited. Stock reservations are issued concurrently, and any partial success is tracked and rolled back with one bulk write, eliminating the previous serial latency while preserving inventory correctness.

## Redis caching

Public product lists, product details, category counts, and trending products are cached as JSON. List keys hash a canonical, sorted query representation so parameter order cannot create duplicate entries. Keys share the `products:` namespace and all product create/update/delete operations invalidate that namespace. Inventory changes caused by order placement or cancellation invalidate it too, preventing stale stock responses.

Cache failures are logged and treated as misses so a transient Redis issue does not make reads unavailable. `REDIS_URL` is mandatory in production; development can run without it. The same Redis connection backs `express-rate-limit`, allowing limits to remain consistent across instances.

## HTTP and security

Responses larger than 1 KB are compressed. Helmet, CORS, HPP, request size limits, strict validation, and centralized error normalization are applied globally. The abandoned `xss-clean` package mutates `req.query` in a way that is incompatible with Express 5, so the maintained `xss` sanitizer engine is used in an Express 5-safe middleware. The middleware materializes a sanitized query object before HPP processes duplicate parameters.

Pino and `pino-http` provide structured logs with authorization headers, passwords, and secrets redacted. Startup, dependency errors, requests, unhandled failures, and graceful shutdowns all use the same logger.

## Performance expectations

The changes remove avoidable hydration and payload work and make hot public reads Redis-backed, but a universal 200 ms guarantee cannot be made in source code alone. Verify the target with production-like load tests and monitor MongoDB `explain()` plans, Redis hit rate, event-loop lag, Cloudinary latency, and p95/p99 API latency. Network placement, dataset size, connection limits, and instance sizing remain material.
