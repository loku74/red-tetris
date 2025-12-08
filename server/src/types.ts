import { Server as HttpServer } from "node:http";
import { Server as IoServer } from "socket.io";
import type { Express } from "express";

export interface JoinRoomData {
  username: string;
  room: string;
}

export interface GetRoomsData {
  name: string;
  userCount: number;
  max: number;
}

export interface ServerData {
  app: Express;
  server: HttpServer;
  io: IoServer;
}

export type Callback = (err: unknown, response?: unknown) => void;
