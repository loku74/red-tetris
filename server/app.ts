// global
import express from "express";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server as IoServer } from "socket.io";

// intern
import { SERVER_PORT } from "./src/constants/core";

// handlers
import { registerHandlers as disconnectingHandler } from "./src/events/disconnecting";
import { registerHandlers as getRoomsHandler } from "./src/events/getRooms";
import { registerHandlers as joinRoomHandler } from "./src/events/joinRoom";
import { registerHandlers as kickHandler } from "./src/events/kick";
import { registerHandlers as leaveRoomHandler } from "./src/events/leaveRoom";
import { registerHandlers as startHandler } from "./src/events/start";
import { registerHandlers as messageHandler } from "./src/events/message";
import { registerHandlers as warmUpHandler } from "./src/events/warmUp";

// types
import type { Express } from "express";
import type { ServerData } from "./src/types/server";
import type { AppServer, ServerSocket } from "./src/types/socket";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, "../client/build");

function configureHttp(app: Express) {
  app.use(express.static(frontendPath));

  app.get("/", (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

function configureSocket(io: AppServer) {
  io.on("connection", (socket: ServerSocket) => {
    console.log("New client connected");

    messageHandler(io, socket);
    disconnectingHandler(io, socket);
    getRoomsHandler(socket);
    joinRoomHandler(io, socket);
    kickHandler(io, socket);
    startHandler(io, socket);
    leaveRoomHandler(io, socket);
    warmUpHandler(io, socket);
  });
}

export function init(): ServerData {
  const app = express();
  const server = createServer(app);
  const io: AppServer = new IoServer(server);

  configureHttp(app);
  configureSocket(io);
  return { app, server, io };
}

if (import.meta.main) {
  const struct = init();

  struct.server.listen(SERVER_PORT, () => {
    console.log(`Server running at http://localhost:${SERVER_PORT}`);
  });
}
