#!/bin/bash

set -e

HOST="0.0.0.0"
PORT="8080"

case "$1" in
  build)
    docker build . -t red-tetris
    ;;
  terminal)
    docker run --rm -e PUBLIC_SERVER_PORT=${PORT} -e PUBLIC_SERVER_ADDRESS=${HOST} -p ${PORT}:${PORT} -it red-tetris /bin/bash
    ;;
  *)
    echo "Usage: ./bash cli.sh <build/terminal>
    build: build the docker image
    terminal: spawn inside the docker"
    ;;
esac
