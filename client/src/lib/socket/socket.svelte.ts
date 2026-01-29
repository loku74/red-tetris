import { io } from "socket.io-client";

import { PUBLIC_SERVER_ADDRESS, PUBLIC_SERVER_PORT } from "$env/static/public";

import type { AppClientSocket } from "@app/shared";

let socket: AppClientSocket | null = null;

export function getSocket(): AppClientSocket {
  if (socket) {
    return socket;
  }

  socket = io(`${PUBLIC_SERVER_ADDRESS}:${PUBLIC_SERVER_PORT}`, {
    transports: ["websocket"],
    timeout: 5000
  });

  return socket;
}
