import type { Express } from "express";
import { Server as HttpServer } from "node:http";
import type { AppServer } from "./socket";

export interface ServerData {
  app: Express;
  server: HttpServer;
  io: AppServer;
}
