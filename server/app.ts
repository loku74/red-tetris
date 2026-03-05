import type { Express } from "express";
import express from "express";
import { createServer } from "node:http";
import path from "node:path";
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
import { registerHandlers as spectateHandler } from "@app/events/spectate";
import { registerHandlers as startHandler } from "@app/events/start";
import { registerHandlers as warmUpHandler } from "@app/events/warmUp";
import { registerHandlers as warmUpActionHandler } from "@app/events/warmUpAction";
import type { ServerData } from "@app/types/server";
import type { AppServer, ServerSocket } from "@app/types/socket";
import { logger } from "@app/utils/log";

const frontendPath = path.join(import.meta.dirname, "../../client/build");

function configureHttp(app: Express) {
  app.use(express.static(frontendPath));

  app.get("/{*splat}", (_req: express.Request, res: express.Response) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

function configureSocket(io: AppServer) {
  io.on("connection", (socket: ServerSocket) => {
    logger.info(`New client connected (id: ${socket.id})`);

    getRoomsHandler(socket);
    joinRoomHandler(io, socket);
    leaveRoomHandler(io, socket);
    messageHandler(io, socket);
    changeColorHandler(io, socket);
    kickHandler(io, socket);
    warmUpHandler(io, socket);
    warmUpActionHandler(socket);
    startHandler(io, socket);
    gameActionHandler(socket);
    spectateHandler(io, socket);

    disconnectingHandler(io, socket);
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
