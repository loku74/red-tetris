import type { Socket as ClientSocket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "./socket-events";

export type AppClientSocket = ClientSocket<ClientToServerEvents, ServerToClientEvents>;
