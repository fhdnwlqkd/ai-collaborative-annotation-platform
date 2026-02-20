#!/usr/bin/env bash
set -euo pipefail
cd apps/web
if command -v pnpm >/dev/null 2>&1; then
  pnpm dev --port 3000
else
  npm run dev -- --port 3000
fi