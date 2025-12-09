import { Server, type Socket as ServerSocket } from "socket.io";
import { io as ioc, type Socket as ClientSocket } from "socket.io-client";
import type { Callback, TestSocket } from "../types";

export function createClient(address: string, io: Server): Promise<TestSocket> {
  return new Promise((resolve) => {
    const client = ioc(address);
    let server: ServerSocket;

    io.once("connection", (socket: ServerSocket) => {
      server = socket;
    });
    client.once("connect", () => {
      resolve({ client, server });
    });
  });
}

export function emitAsync(
  socket: ClientSocket | ServerSocket,
  event: string,
  data?: unknown
): Promise<{ err: unknown; res: unknown }> {
  return new Promise((resolve) => {
    socket.emit(event, data, ((err, res) => {
      resolve({ err, res });
    }) as Callback);
  });
}

export function onceAsync(socket: ClientSocket | ServerSocket, event: string): Promise<unknown> {
  return new Promise((resolve) => {
    socket.once(event, (data) => {
      resolve(data);
    });
  });
}
