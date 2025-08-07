# Grocodex Backend Setup & Deployment

## Prerequisites
- Node.js (LTS recommended)
- npm
- SQLite3 (or Docker, see below)

## Local Development
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd grocodex
   ```
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Copy and edit environment variables:
   ```bash
   cp .env.example .env
   # Edit .env as needed (see below for variable descriptions)
   ```
4. Run database migrations:
   ```bash
   npm run migrate
   ```
5. Start the backend:
   ```bash
   npm run dev
   # or for production
   npm start
   ```
6. Run tests:
   ```bash
   npm test
   ```

## Environment Variables
- `PORT`: Port to run the backend (default: 3001)
- `DB_PATH`: Path to SQLite DB file (default: `/data/grocodex.sqlite3` in Docker)
- `JWT_SECRET`: Secret for JWT signing

## Docker Deployment
1. Build and run the container:
   ```bash
   docker build -t grocodex-backend ./backend
   docker run -p 3001:3001 -v $(pwd)/data:/data grocodex-backend
   ```
2. The backend will be available on your local network at the specified port.

## Data Persistence
- By default, SQLite data is stored in `/data` (Docker) or as configured in `.env`.
- To backup, copy the SQLite file. To restore, replace the file and restart the backend.

---
For more details, see API_DOC.md and the database schema below.
