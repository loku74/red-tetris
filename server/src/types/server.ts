import type { Express } from "express";
import { Server as HttpServer } from "node:http";
import { Server as IoServer, type Socket as ServerSocket } from "socket.io";
import { type Socket as ClientSocket } from "socket.io-client";

export interface TestSocket {
  client: ClientSocket;
  server: ServerSocket;
}

export interface ServerData {
  app: Express;
  server: HttpServer;
  io: IoServer;
}
