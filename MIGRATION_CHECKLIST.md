# Migration Checklist: Local-First Hybrid Architecture

## Frontend
- [ ] Refactor all CRUD operations (inventory, shopping lists, etc.) to operate on IndexedDB first.
- [ ] Implement a local data change queue for offline actions.
- [ ] Add sync logic to push/pull changes to/from the backend when online.
- [ ] Handle conflict resolution (last-write-wins or custom logic).
- [ ] Update UI to reflect sync status and possible conflicts.
- [ ] Ensure all business logic (validation, calculations) runs on the frontend.

## Backend
- [ ] Replace fine-grained REST endpoints with sync endpoints (e.g., `/sync/push`, `/sync/pull`).
- [ ] Store user data snapshots or change logs for each user/device.
- [ ] Implement authentication and authorization for sync endpoints.
- [ ] Keep barcode lookup and public data proxy endpoints.

## Sync Protocol
- [ ] Choose or design a sync protocol (e.g., custom, PouchDB/CouchDB, Yjs, Automerge).
- [ ] Implement versioning or change tracking for data.
- [ ] Test multi-device and multi-user sync scenarios.

## Testing & QA
- [ ] Test full offline usage and data sync after reconnect.
- [ ] Test conflict scenarios and resolution.
- [ ] Test data migration from old backend-driven model to new local-first model.

## Docs & DevOps
- [ ] Update documentation to reflect new architecture and usage.
- [ ] Update Dockerfile and deployment scripts if backend changes.
- [ ] Add migration notes for existing users/data.
