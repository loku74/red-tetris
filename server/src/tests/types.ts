import type { AppClientSocket } from "@app/shared";
import type { AppServer, ServerSocket } from "../types/socket";

export interface TestServerData {
  io: AppServer;
  test1: TestSocket;
  address: string;
}

export interface TestSocket {
  client: AppClientSocket;
  server: ServerSocket;
}
