# Copilot Instructions for Grocodex

## Project Overview
Grocodex is a self-hosted, open source, privacy-first PWA for tracking grocery inventory. It is designed for mobile-first use, supports full offline capabilities, and is deployed in a Docker container for local network access. All user data is stored locally and never leaves the user's device or network. All CRUD and business logic is local-first (RxDB) the backend is only used to sync data between devices (CouchDB).

## General Guidelines
- Use TypeScript for both frontend and backend.
- Prioritize privacy: never send user data to third-party services except for public product lookups (Open Food Facts API).
- Keep the codebase lightweight, modular, and easy to maintain.
- All user data is stored locally CouchDB backend with sync to RxDB in the frontend.
- All CRUD and business logic is local-first (RxDB). Backend is only for sync, backup, and multi-device support.
- Use the RxDB open core sync capabilities to sync data with CouchDB backend.
- Use Open Food Facts API for barcode lookups only; do not store or transmit user-specific data externally.
- Ensure the app can later be extended with an auth and login in the frontend or other features.
- Ensure the app is production-ready with proper error handling and user feedback.
- Ensure a maintainable and modular code structure.
- Ensure i18n support for localization.

## Frontend
- Use React functional components.
- Use Material UI (MUI) for all UI components.
- Implement PWA features (manifest, service worker, offline caching).
- Use RxDB for all CRUD and offline data storage.
- Implement barcode scanning using QuaggaJS or zxing-js.
- Provide a UI for pasting/importing shopping lists and matching against inventory.
- Do not include analytics, tracking, or telemetry.
- Ensure the app is responsive and works well on mobile devices.
- Use i18n for localization (default to English, support at least one other language).

## Backend
- Use Express or Fastify with TypeScript.
- Use CouchDB and the open core sync capabilities of RxDB to sync data with the backend.
- Backend is only needed for syncing data between devices and providing a backup.
- the whole app should be containerized using Docker.
- Do not log or transmit user data externally.

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
