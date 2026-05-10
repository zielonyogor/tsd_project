#!/usr/bin/env sh
set -eu

docker compose --profile test run --rm --build backend-tests "$@"