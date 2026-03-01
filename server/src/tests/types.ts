import type { AppClientSocket } from "@app/shared";

import type { AppServer, ServerSocket } from "@app/types/socket";

export interface TestServerData {
  io: AppServer;
  address: string;
  socket1: TestSocket;
  socket2: TestSocket;
}

export interface TestSocket {
  client: AppClientSocket;
  server: ServerSocket;
}
