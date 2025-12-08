import express from "express";
import { createServer } from "node:http";
import path from "node:path";
import { Server, Socket } from "socket.io";
import { fileURLToPath } from "node:url";
import { registerClientHandlers } from "./src/events";
import type { ServerData } from "./src/types";
import type { Express } from "express";
import { SERVER_PORT } from "./src/constants";
import { Server as IoServer } from "socket.io";

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

    registerClientHandlers(socket);
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

const struct = init();

struct.server.listen(SERVER_PORT, () => {
  console.log(`Server running at http://localhost:${SERVER_PORT}`);
});
