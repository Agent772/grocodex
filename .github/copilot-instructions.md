# Copilot Instructions for Grocodex

## Project Overview
Grocodex is a self-hosted, open source, privacy-first PWA for tracking grocery inventory. It is designed for mobile-first use, supports offline capabilities, and is deployed in a Docker container for local network access. All user data is stored locally and never leaves the user's device or network.

## General Guidelines
- Use TypeScript for both frontend and backend.
- Prioritize privacy: never send user data to third-party services except for public product lookups (Open Food Facts API).
- Keep the codebase lightweight, modular, and easy to maintain.
- All user data is stored locally (SQLite for backend, IndexedDB for offline frontend).
- Use RESTful API design.
- Prioritize offline support and data sync.
- Use Open Food Facts API for barcode lookups only; do not store or transmit user-specific data externally.

## Frontend
- Use React functional components and hooks.
- Use Material UI (MUI) for all UI components.
- Implement PWA features (manifest, service worker, offline caching).
- Use IndexedDB for offline data storage and sync with backend when online.
- Implement barcode scanning using QuaggaJS or zxing-js.
- Provide a UI for pasting/importing shopping lists and matching against inventory.
- Do not include analytics, tracking, or telemetry.

## Backend
- Use Express or Fastify with TypeScript.
- Expose REST endpoints for inventory, shopping lists, and sync.
- Use SQLite for persistent storage.
- Implement endpoints for barcode lookup (proxy to Open Food Facts if needed).
- Serve the frontend build and API from the same Docker container.
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
