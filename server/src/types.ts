import type { Express } from "express";
import { Server as HttpServer } from "node:http";
import { Server as IoServer, type Socket as ServerSocket } from "socket.io";
import { type Socket as ClientSocket } from "socket.io-client";

export interface JoinRoomData {
  username: string;
  room: string;
}

export interface GetRoomsData {
  name: string;
  userCount: number;
  max: number;
}

export interface RoomInfo {
  players: string[];
  userCount: number;
  max: number;
  host: string;
}

export interface ServerData {
  app: Express;
  server: HttpServer;
  io: IoServer;
}

export interface TestSocket {
  client: ClientSocket;
  server: ServerSocket;
}

export type Callback = (err: unknown, response?: unknown) => void;
