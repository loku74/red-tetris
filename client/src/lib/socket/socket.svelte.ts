import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { PUBLIC_SERVER_ADDRESS, PUBLIC_SERVER_PORT } from "$env/static/public";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket) {
    return socket;
  }

  socket = io(`${PUBLIC_SERVER_ADDRESS}:${PUBLIC_SERVER_PORT}`, {
    transports: ["websocket"],
    timeout: 5000
  });

  return socket;
}
