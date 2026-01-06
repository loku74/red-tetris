import { io, Socket } from "socket.io-client";
import { PUBLIC_SERVER_ADDRESS, PUBLIC_SERVER_PORT } from "$env/static/public";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(`${PUBLIC_SERVER_ADDRESS}:${PUBLIC_SERVER_PORT}`, {
      transports: ["websocket"]
    });
  }
  return socket;
}
