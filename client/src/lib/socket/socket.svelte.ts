import { io } from "socket.io-client";

import { dev } from "$app/environment";

import type { AppClientSocket } from "@app/shared";

let socket: AppClientSocket | null = null;

export function getSocket(): AppClientSocket {
  if (socket) {
    return socket;
  }

  const serverUrl = dev ? "localhost:3000" : undefined;

  socket = io(serverUrl, {
    transports: ["websocket"],
    timeout: 5000
  });

  return socket;
}
