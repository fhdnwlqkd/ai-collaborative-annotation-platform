#!/usr/bin/env bash
set -euo pipefail

docker compose -f infra/docker-compose.infra.yml down -v
echo "infra reset done (volumes removed)"