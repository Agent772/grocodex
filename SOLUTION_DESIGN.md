# Grocodex Solution Design & Copilot Instructions

## Solution Design

### Overview
Grocodex is a self-hosted, open source PWA (Progressive Web App) for tracking grocery inventory. It is designed for mobile-first use, supports full offline capabilities, and can be deployed in a Docker container for local network access. The app allows users to manage their groceries, import shopping lists (e.g., from Cookiedoo), scan barcodes, and fetch product data from Open Food Facts. All core data operations are performed locally on the device, with background sync to the backend server for backup and multi-device support.

### Core Features
- Inventory management: Track groceries with name, location, expiration date, barcode, etc.
- Shopping list: Import/paste shopping lists, match against inventory, and generate a list of missing items.
- Barcode scanning: Add groceries by scanning barcodes, fetch product data from Open Food Facts.
- Search and filter: Quickly find items by name, location, or other attributes.
- Offline-first: Full PWA support for offline use, with sync when online.
- Multi-device: Access via local network, mobile-first responsive UI.

### Architecture
**Frontend**: React + TypeScript + MUI (Material UI), PWA, IndexedDB for all CRUD and offline storage, barcode scanning (QuaggaJS or zxing-js). All business logic and data operations are local-first.
**Backend**: Node.js (Express or Fastify) with TypeScript, SQLite database, sync API (not fine-grained REST). Backend acts as a sync/backup server, not for direct CRUD.
**External Data**: Open Food Facts API for barcode/product lookup (proxied if needed).
**Deployment**: Docker container, local network access.

### Technology Stack
#### Frontend
- React (with hooks)
- TypeScript
- Material UI (MUI)
- React Router
- Workbox (PWA/service worker)
- idb (IndexedDB wrapper)
- QuaggaJS or zxing-js (barcode scanning)
- Axios or Fetch API

#### Backend
- Node.js (Express or Fastify)
- TypeScript
- SQLite (better-sqlite3 or sqlite3)
- REST API (OpenAPI/Swagger for docs)
- Docker

#### Other
- Open Food Facts API
- Docker Compose (optional)
- GitHub Actions (optional)

### Data Models (Initial)
- GroceryItem: id, name, location, expirationDate, barcode, quantity, etc.
- ShoppingList: id, name, items[]
- Inventory: list of GroceryItems

### Key Requirements
- Mobile-first, responsive UI
- PWA with full offline support and background sync
- Local-first CRUD via IndexedDB
- Sync API for backup and multi-device support
- Local SQLite database (backend)
- Dockerized deployment

---

## Copilot Instructions

### General
- Use TypeScript for both frontend and backend.
- Follow mobile-first, responsive design principles.
- All user data is stored locally (SQLite for backend, IndexedDB for offline frontend).
- All CRUD and business logic is local-first (IndexedDB). Backend is only for sync, backup, and multi-device support.
- Use a sync protocol (custom or library) for background data sync.
- Use Open Food Facts API for barcode lookups (proxy if needed).

### Frontend
- Use React functional components and hooks.
- Use MUI for all UI components.
- Implement PWA features (manifest, service worker, offline caching).
- Use IndexedDB for all CRUD and offline data storage.
- Implement a local change queue for offline actions and background sync.
- Implement barcode scanning using QuaggaJS or zxing-js.
- Provide a UI for pasting/importing shopping lists and matching against inventory.

### Backend
- Use Express or Fastify with TypeScript.
- Expose sync endpoints (not fine-grained REST) for pushing/pulling data.
- Use SQLite for persistent storage and backup.
- Implement endpoints for barcode lookup (proxy to Open Food Facts if needed).
- Serve the frontend build and API from the same Docker container.

### DevOps
- Provide a Dockerfile for easy deployment.
- Expose necessary ports for local network access.
- Document setup and usage in a README.

---

This file should be kept up to date as the project evolves.
