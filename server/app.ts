import type { Express } from "express";
import express from "express";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server as IoServer, Socket } from "socket.io";
import { SERVER_PORT } from "./src/constants";
import { registerHandlers as canJoinRoomHandler } from "./src/events/canJoinRoom";
import { registerHandlers as chatHandler } from "./src/events/chat";
import { registerHandlers as disconnectingHandler } from "./src/events/disconnecting";
import { registerHandlers as getRoomsHandler } from "./src/events/getRooms";
import { registerHandlers as joinRoomHandler } from "./src/events/joinRoom";
import { registerHandlers as kickHandler } from "./src/events/kick";
import type { ServerData } from "./src/types/server";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, "../client/build");

function configureHttp(app: Express) {
  app.use(express.static(frontendPath));

  app.get("/", (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

function configureSocket(io: IoServer) {
  io.on("connection", (socket: Socket) => {
    console.log("New client connected");

    canJoinRoomHandler(socket);
    chatHandler(socket);
    disconnectingHandler(io, socket);
    getRoomsHandler(socket);
    joinRoomHandler(socket);
    kickHandler(io, socket);
  });
}

export function init(): ServerData {
  const app = express();
  const server = createServer(app);
  const io = new IoServer(server);

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
