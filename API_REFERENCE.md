# Grocodex API Reference

## Authentication
- All endpoints require JWT in `Authorization: Bearer <token>` header unless noted.

## Inventory
### Grocery Items
- `POST /api/grocery-items` — Create item
- `GET /api/grocery-items` — List items (filters: product_id, container_id, expired, expiringSoon, name, limit, offset)
- `GET /api/grocery-items/:id` — Get item by id
- `PUT /api/grocery-items/:id` — Update item
- `DELETE /api/grocery-items/:id` — Delete item

### Containers
- `POST /api/containers` — Create
- `GET /api/containers` — List
- `GET /api/containers/:id` — Get by id
- `PUT /api/containers/:id` — Update
- `DELETE /api/containers/:id` — Delete

### Stores & Store Locations
- `POST /api/stores` — Create store
- `GET /api/stores` — List/search
- `GET /api/stores/:id` — Get by id
- `PUT /api/stores/:id` — Update
- `DELETE /api/stores/:id` — Delete
- `POST /api/store-locations` — Create store location
- `GET /api/store-locations` — List/search (by supermarket_id, product_id, location)
- `GET /api/store-locations/:id` — Get by id
- `PUT /api/store-locations/:id` — Update
- `DELETE /api/store-locations/:id` — Delete

### Categories
- `POST /api/categories` — Create
- `GET /api/categories` — List/search (by name)
- `GET /api/categories/:id` — Get by id
- `PUT /api/categories/:id` — Update
- `DELETE /api/categories/:id` — Delete

## User
- `POST /api/register` — Register
- `POST /api/login` — Login
- `GET /api/users` — List users
- `PUT /api/users/:id` — Edit profile
- `PUT /api/users/:id/password` — Change password
- `DELETE /api/users/:id` — Delete account

## Shopping List
- `POST /api/shopping-lists` — Create
- `GET /api/shopping-lists` — List
- `GET /api/shopping-lists/:id` — Get by id
- `PUT /api/shopping-lists/:id` — Update
- `DELETE /api/shopping-lists/:id` — Delete
- `POST /api/shopping-list-items` — Add item
- `GET /api/shopping-list-items` — List items
- `PUT /api/shopping-list-items/:id` — Update item
- `DELETE /api/shopping-list-items/:id` — Remove item

## Product/Barcode
- `GET /api/products` — List/search
- `POST /api/products` — Create
- `GET /api/products/:id` — Get by id
- `PUT /api/products/:id` — Update
- `DELETE /api/products/:id` — Delete
- `GET /api/barcode/:barcode` — Proxy lookup (Open Food Facts)
- `POST /api/barcode/add` — Add product to inventory by barcode

## Error Keys
- All error responses include an `error` key (e.g., `ERR_VALIDATION`, `ERR_NOT_FOUND`, etc.) for i18n.

---
For request/response examples, see API_DOC.md or the integration tests.
