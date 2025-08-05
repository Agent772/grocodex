
# Grocodex Backend TODO

## API Routes

- **User**
  - [x] Register
  - [x] Login
  - [x] JWT authentication
  - [x] Edit profile
  - [x] Change password
  - [x] Delete account
  - [x] List users

- **Inventory**
  - [x] CRUD for grocery items
  - [ ] CRUD for containers (nested)
  - [ ] CRUD for Stores and StoreLocations + Search
  - [ ] CRUS for Categories + Search
  - [ ] Attach items to containers
  - [ ] Expiration tracking

- **Shopping List**
  - [ ] CRUD for shopping lists
  - [ ] CRUD for shopping list items
  - [ ] Match shopping list to inventory

- **Product/Barcode**
  - [ ] Proxy lookup (Open Food Facts)
  - [ ] Add product to inventory by barcode

## Middleware
- [x] JWT authentication (`requireAuth`)
- [ ] Input validation (zod/joi)
- [ ] Rate limiting
- [ ] Error handling (centralized)

## Models/Database
- [x] User
- [ ] Inventory item
- [ ] Container
- [ ] Shopping list
- [ ] Product

## DevOps & Deployment
- [x] Environment variable support (`dotenv`)
- [x] `.env.example` and `.env` for secrets/config
- [x] Configurable SQLite DB path for Docker volume mapping
- [ ] Dockerfile and compose setup
- [x] Password reset/backup script for user accounts
- [ ] Data backup/export/import

## Documentation & Testing
- [x] API documentation (`API_DOC.md`)
- [ ] Integration tests for endpoints
- [ ] Setup/usage/deployment docs

## Future/Ideas
- [ ] OIDC authentication option
- [ ] Plugin/extension system
- [ ] Admin/household management features
- [ ] Advanced inventory analytics

---
Update this file as features are completed or new requirements arise.
