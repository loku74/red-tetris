import { Server as HttpServer } from "node:http";
import type { Express } from "express";
import type { Board } from "../objects/Board";
import type { Piece } from "../objects/Piece";
import type { AppServer } from "./socket";

export interface ServerData {
  app: Express;
  server: HttpServer;
  io: AppServer;
}

export interface ActionData {
  piece: Piece;
  board: Board;
}
