import { type Socket } from "socket.io";
import { validateChat } from "../validate/chat";
import type { SocketChatData } from "client-types";
import type { Callback } from "../types/types";

export function registerHandlers(socket: Socket) {
  socket.on("chat", (data: SocketChatData, callback: Callback) => {
    const result = validateChat(socket, data);
    if (!result.status) {
      callback(false, result.error);
      return;
    }

    result.current.socket
      .to(result.room.name)
      .emit("message", { from: result.current.name, message: result.message });

    console.log(`user ${result.current.name} wrote: "${result.message}" to ${result.room} `);

    callback(true);
  });
}
