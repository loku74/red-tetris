#!/bin/bash

set -e

CONTAINER_IMAGE="red-tetris-image"
CONTAINER_NAME="red-tetris"

source .env

case "$1" in
  build)
    docker build . -t "$CONTAINER_IMAGE"
    ;;
  run)
    docker run --rm --name "$CONTAINER_NAME" -e PUBLIC_SERVER_PORT=${PUBLIC_SERVER_PORT} -e PUBLIC_SERVER_ADDRESS=${PUBLIC_SERVER_ADDRESS} -p ${PUBLIC_SERVER_PORT}:${PUBLIC_SERVER_PORT} "${CONTAINER_IMAGE}"
    ;;
  terminal)
    docker exec -it "$CONTAINER_NAME" /bin/bash
    ;;
  coverage)
    docker run --rm --name "$CONTAINER_NAME-coverage" -it "$CONTAINER_IMAGE" /bin/bash -c "npm run coverage"
    ;;
  *)
    echo "Usage: ./bash cli.sh <build/run/terminal/coverage>
    build: build the docker image
    run: execute the docker image in production mode
    terminal: connect into the running container
    coverage: execute the docker image in coverage mode"
    ;;
esac
