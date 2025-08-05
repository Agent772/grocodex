# Grocodex Backend API (Current State)

## Authentication
- Uses JWT (JSON Web Token) for stateless authentication.
- On successful login, the backend issues a JWT containing the user ID.
- Clients must send the JWT in the `Authorization: Bearer <token>` header for all protected routes.
- The JWT secret is set via the `JWT_SECRET` environment variable (default: `dev_secret_change_me`).

## Error Handling & i18n
- All error responses use error keys (e.g., `ERR_INVALID_CREDENTIALS`, `ERR_AUTH_REQUIRED`).
- The frontend is responsible for translating these keys into user-facing messages.

## User Endpoints
- `POST /api/register` — Register a new user. Requires `{ username, password }` in the body. Returns user info or error key.
- `POST /api/login` — Login with username and password. Returns user info and JWT token or error key.
- `GET /api/users` — List all users (protected, requires valid JWT).

## Middleware
- `requireAuth` middleware checks for a valid JWT in the `Authorization` header and attaches the user to the request.

## Project Structure
- `src/routes/` — Route definitions (e.g., `userRoutes.ts`)
- `src/models/` — Database access logic (e.g., `user.ts`)
- `src/middleware/` — Authentication and other middleware (e.g., `auth.ts`)
- `src/controllers/` — (Scaffolded, for future business logic)

## Security Notes
- Passwords are hashed with bcryptjs before storage.
- JWT is used for all protected endpoints.
- Error keys are used for all error responses (i18n-ready).

---

# Next Steps (Recommended)

1. **Environment Configuration**
   - Move secrets (JWT, DB path, etc.) to environment variables and document them in `.env.example`.

2. **Inventory & Container Endpoints**
   - Implement CRUD endpoints for inventory items and containers, using the same modular structure.
   - Protect relevant endpoints with `requireAuth`.

3. **Shopping List Endpoints**
   - Add endpoints for managing shopping lists and items.

4. **Barcode/Product Lookup**
   - Implement a proxy endpoint for Open Food Facts barcode lookups.

5. **Testing & Validation**
   - Add input validation (e.g., with `zod` or `joi`).
   - Add integration tests for endpoints.

6. **Frontend Integration**
   - Once the backend is stable, connect it to your React frontend.

Let me know which feature you want to tackle next, or if you want to see a sample for any of the above steps!
