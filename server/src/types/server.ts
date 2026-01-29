import type { Express } from "express";
import { Server as HttpServer } from "node:http";
import { Server as IoServer } from "socket.io";

export interface ServerData {
  app: Express;
  server: HttpServer;
  io: IoServer;
}
