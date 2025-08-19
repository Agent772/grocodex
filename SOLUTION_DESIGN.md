# Grocodex Solution Design & Copilot Instructions

## Solution Design

### Overview
Grocodex is a self-hosted, open source PWA (Progressive Web App) for tracking grocery inventory. It is designed for mobile-first use, supports full offline capabilities, and can be deployed in a Docker container for local network access. The app allows users to manage their groceries, import shopping lists (e.g., from Cookiedoo), scan barcodes, and fetch product data from Open Food Facts. All core data operations are performed locally on the device, the backend / server is only for sync between multi devices used and needed.

### Core Features
- Inventory management: Track groceries with name, storage location, expiration date, barcode, etc.
- Shopping list: Import/paste shopping lists, match against inventory, and generate a list of missing items.
- Barcode scanning: Add groceries by scanning barcodes, fetch product data from Open Food Facts.
- Search and filter: Quickly find items by name, location, or other attributes.
- Offline-first: Full PWA support for offline use, with sync when online.
- Multi-device: Access via local network, mobile-first responsive UI.

### Architecture
**Frontend**: React + TypeScript + MUI (Material UI), PWA, RxDB for all CRUD and offline storage, barcode scanning (QuaggaJS or zxing-js). All business logic and data operations are local-first.
**Backend**: Only for syncing db between devices with RxDB + CouchDB
**External Data**: Open Food Facts API for barcode/product lookup (proxied if needed).
**Deployment**: Docker container, local network access.

### Technology Stack
#### Frontend
- React (with hooks)
- TypeScript
- Material UI (MUI)
- RxDB (local-first database)
- QuaggaJS or zxing-js (barcode scanning)
- Axios or Fetch API

#### Backend
- Node.js (Express or Fastify)
- TypeScript
- CouchDB
- Docker

#### Other
- Open Food Facts API
- Docker Compose (optional)
- GitHub Actions (optional)


### Key Requirements
- Mobile-first, responsive UI
- PWA with full offline support and background sync
- Local-first via RxDB
- Backend via CouchDB only for MultiDevice Sync
- Dockerized deployment
