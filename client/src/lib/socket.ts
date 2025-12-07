import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let room: string | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io("http://localhost:8080", { transports: ["websocket"] });
  }
  return socket;
}

export function getRoom(): string | null {
  return room;
}

export function setRoom(newRoom: string): void {
  room = newRoom;
}
