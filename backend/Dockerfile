# Build frontend
FROM node:20 AS frontend-build
WORKDIR /app
COPY frontend ./frontend
RUN cd frontend && npm install && npm run build

# Build backend
FROM node:20 AS backend
WORKDIR /app
COPY backend ./backend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist
RUN cd backend && npm install

EXPOSE 4000
WORKDIR /app/backend
CMD ["npx", "ts-node", "src/server.ts"]
