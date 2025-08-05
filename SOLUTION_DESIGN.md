# Grocodex Solution Design & Copilot Instructions

## Solution Design

### Overview
Grocodex is a self-hosted, open source PWA (Progressive Web App) for tracking grocery inventory. It is designed for mobile-first use, supports offline capabilities, and can be deployed in a Docker container for local network access. The app allows users to manage their groceries, import shopping lists (e.g., from Cookiedoo), scan barcodes, and fetch product data from Open Food Facts.

### Core Features
- Inventory management: Track groceries with name, location, expiration date, barcode, etc.
- Shopping list: Import/paste shopping lists, match against inventory, and generate a list of missing items.
- Barcode scanning: Add groceries by scanning barcodes, fetch product data from Open Food Facts.
- Search and filter: Quickly find items by name, location, or other attributes.
- Offline-first: Full PWA support for offline use, with sync when online.
- Multi-device: Access via local network, mobile-first responsive UI.

### Architecture
- **Frontend**: React + TypeScript + MUI (Material UI), PWA, IndexedDB for offline storage, barcode scanning (QuaggaJS or zxing-js)
- **Backend**: Node.js (Express or Fastify) with TypeScript, SQLite database, REST API
- **External Data**: Open Food Facts API for barcode/product lookup
- **Deployment**: Docker container, local network access

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
- PWA with offline support and sync
- RESTful API
- Local SQLite database
- Dockerized deployment

---

## Copilot Instructions

### General
- Use TypeScript for both frontend and backend.
- Follow mobile-first, responsive design principles.
- All user data is stored locally (SQLite for backend, IndexedDB for offline frontend).
- Use RESTful API design.
- Prioritize offline support and data sync.
- Use Open Food Facts API for barcode lookups.

### Frontend
- Use React functional components and hooks.
- Use MUI for all UI components.
- Implement PWA features (manifest, service worker, offline caching).
- Use IndexedDB for offline data storage and sync with backend when online.
- Implement barcode scanning using QuaggaJS or zxing-js.
- Provide a UI for pasting/importing shopping lists and matching against inventory.

### Backend
- Use Express or Fastify with TypeScript.
- Expose REST endpoints for inventory, shopping lists, and sync.
- Use SQLite for persistent storage.
- Implement endpoints for barcode lookup (proxy to Open Food Facts if needed).
- Serve the frontend build and API from the same Docker container.

### DevOps
- Provide a Dockerfile for easy deployment.
- Expose necessary ports for local network access.
- Document setup and usage in a README.

---

This file should be kept up to date as the project evolves.
