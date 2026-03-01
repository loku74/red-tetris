import type { Express } from "express";
import express from "express";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server as IoServer } from "socket.io";

import { SERVER_PORT } from "@app/constants/core";
import { registerHandlers as changeColorHandler } from "@app/events/changeColor";
import { registerHandlers as disconnectingHandler } from "@app/events/disconnecting";
import { registerHandlers as gameActionHandler } from "@app/events/gameAction";
import { registerHandlers as getRoomsHandler } from "@app/events/getRooms";
import { registerHandlers as joinRoomHandler } from "@app/events/joinRoom";
import { registerHandlers as kickHandler } from "@app/events/kick";
import { registerHandlers as leaveRoomHandler } from "@app/events/leaveRoom";
import { registerHandlers as messageHandler } from "@app/events/message";
import { registerHandlers as startHandler } from "@app/events/start";
import { registerHandlers as warmUpHandler } from "@app/events/warmUp";
import { registerHandlers as warmUpActionHandler } from "@app/events/warmUpAction";
import type { ServerData } from "@app/types/server";
import type { AppServer, ServerSocket } from "@app/types/socket";
import { logger } from "@app/utils/log";

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
    logger.info(`New client connected (id: ${socket.id})`);

    messageHandler(io, socket);
    disconnectingHandler(io, socket);
    getRoomsHandler(socket);
    joinRoomHandler(io, socket);
    kickHandler(io, socket);
    startHandler(io, socket);
    changeColorHandler(io, socket);
    leaveRoomHandler(io, socket);
    warmUpHandler(io, socket);
    warmUpActionHandler(socket);
    gameActionHandler(socket);
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
    logger.info(`Server running at http://localhost:${SERVER_PORT}`);
  });
}
