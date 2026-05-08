#!/bin/bash

set -e

CONTAINER_IMAGE="red-tetris-image"
CONTAINER_NAME="red-tetris"

case "$1" in
  build)
    docker build . -t "$CONTAINER_IMAGE"
    ;;
  build-linux)
    docker buildx build --platform linux/amd64 . -t "$CONTAINER_IMAGE"
    ;;
  run)
    docker run --rm --name "$CONTAINER_NAME" -p 3000:3000 "${CONTAINER_IMAGE}"
    ;;
  *)
    echo "Usage: ./bash cli.sh <build | build-linux | run>
    build: build the docker image for your current platform
    build-linux: build the docker image for Linux
    run: execute the docker image in production mode"
    ;;
esac
