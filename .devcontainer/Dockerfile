# Grocodex DevContainer Dockerfile
FROM mcr.microsoft.com/devcontainers/typescript-node:20

# Install SQLite tools
RUN apt-get update && apt-get install -y sqlite3 && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace/grocodex
