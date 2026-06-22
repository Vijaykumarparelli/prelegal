#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Installing dependencies..."
cd "$ROOT" && npm install --prefix backend --silent

echo "==> Starting Prelegal (frontend: :3000, backend: :3001)..."
exec npm run dev --prefix "$ROOT"
