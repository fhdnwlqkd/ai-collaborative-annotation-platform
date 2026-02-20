#!/usr/bin/env bash
set -euo pipefail
cd apps/ai
uvicorn main:app --reload --host 0.0.0.0 --port 8001