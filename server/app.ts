import type { Express } from "express";
import express from "express";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server as IoServer, Server, Socket } from "socket.io";
import { SERVER_PORT } from "./src/constants";
import { registerClientHandlers } from "./src/events";
import type { ServerData } from "./src/types";

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

    registerClientHandlers(io, socket);
  });
}

export function init(): ServerData {
  const app = express();
  const server = createServer(app);
  const io = new Server(server);

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
