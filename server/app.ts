import express from "express";
import { createServer } from "node:http";
import path from "node:path";
import { Server, Socket } from "socket.io";
import { fileURLToPath } from "node:url";
import { registerClientHandlers } from "./src/events";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, "../client/build");

const app = express();
const server = createServer(app);
const io = new Server(server);

const port = 8080;

app.use(express.static(frontendPath));

app.get("/", (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

io.on("connection", (socket: Socket) => {
  console.log("New client connected");

  registerClientHandlers(socket);
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
