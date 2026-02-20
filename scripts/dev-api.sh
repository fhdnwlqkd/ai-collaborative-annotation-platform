#!/usr/bin/env bash
set -euo pipefail
cd apps/api
./gradlew bootRun --args="--spring.profiles.active=local"