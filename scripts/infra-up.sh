#!/usr/bin/env bash
set -euo pipefail
docker compose -f infra/docker-compose.infra.yml up -d
echo "INFRA UP (mysql:3306, minio:9000/9001, kafka:29092)"