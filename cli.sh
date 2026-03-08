#!/bin/bash

set -e

CONTAINER_IMAGE="red-tetris-image"
CONTAINER_NAME="red-tetris"

source .env

case "$1" in
  build)
    docker build . --build-arg SERVER_PORT=${SERVER_PORT} -t "$CONTAINER_IMAGE"
    ;;
  build-linux)
    docker buildx build --platform linux/amd64 . --build-arg SERVER_PORT=${SERVER_PORT} -t "$CONTAINER_IMAGE"
    ;;
  run)
    docker run --rm --name "$CONTAINER_NAME" -e SERVER_PORT=${SERVER_PORT} -p ${SERVER_PORT}:${SERVER_PORT} "${CONTAINER_IMAGE}"
    ;;
  *)
    echo "Usage: ./bash cli.sh <build | build-linux | run>
    build: build the docker image for your current platform
    build-linux: build the docker image for Linux
    run: execute the docker image in production mode"
    ;;
esac
