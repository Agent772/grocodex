# Copilot Instructions for Grocodex

## Project Overview
Grocodex is a self-hosted, open source, privacy-first PWA for tracking grocery inventory. It is designed for mobile-first use, supports full offline capabilities, and is deployed in a Docker container for local network access. All user data is stored locally and never leaves the user's device or network. All CRUD and business logic is local-first (IndexedDB), with background sync to the backend for backup and multi-device support.

## General Guidelines
- Use TypeScript for both frontend and backend.
- Prioritize privacy: never send user data to third-party services except for public product lookups (Open Food Facts API).
- Keep the codebase lightweight, modular, and easy to maintain.
- All user data is stored locally (SQLite for backend, IndexedDB for offline frontend).
- All CRUD and business logic is local-first (IndexedDB). Backend is only for sync, backup, and multi-device support.
- Use a sync protocol (custom or library) for background data sync.
- Use Open Food Facts API for barcode lookups only; do not store or transmit user-specific data externally.
- Use environment variables for configuration (e.g., database paths, API keys).
- Ensure the app can later be extended with plugins or additional features without major refactoring.
- Ensure the app is production-ready with proper error handling and user feedback.
- Ensure a maintainable and modular code structure.

## Frontend
- Use React functional components and hooks.
- Use Material UI (MUI) for all UI components.
- Implement PWA features (manifest, service worker, offline caching).
- Use IndexedDB for all CRUD and offline data storage.
- Implement a local change queue for offline actions and background sync.
- Implement barcode scanning using QuaggaJS or zxing-js.
- Provide a UI for pasting/importing shopping lists and matching against inventory.
- Do not include analytics, tracking, or telemetry.
- Ensure the app is responsive and works well on mobile devices.
- Use localStorage or IndexedDB for storing user preferences and settings.
- Use i18n for localization (default to English, support at least one other language).

## Backend
- Use Express or Fastify with TypeScript.
- Expose sync endpoints (not fine-grained REST) for pushing/pulling data.
- Use SQLite for persistent storage and backup.
- Implement endpoints for barcode lookup (proxy to Open Food Facts if needed).
- Serve the frontend build and API from the same Docker container.
- Do not log or transmit user data externally.
- Return error keys to then be translated on the frontend (e.g., `ERR_AUTH_REQUIRED`, `ERR_INVALID_USER`).

## DevOps
- Provide a Dockerfile for easy deployment.
- Expose necessary ports for local network access only.
- Document setup and usage in a README.

## Privacy & Security
- No user data leaves the local device/network.
- No analytics, tracking, or telemetry.
- Only fetch public product data from Open Food Facts; never send user-identifying information.

---
Keep these instructions up to date as the project evolves.
