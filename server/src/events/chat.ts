import { type Socket } from "socket.io";
import { users } from "../objects/User";
import { validateChat } from "../validate/chat";
import type { SocketChatData } from "client-types";
import type { Callback } from "../types/types";

export function registerHandlers(socket: Socket) {
  socket.on("chat", (data: SocketChatData, callback: Callback) => {
    const current = users.get(socket.id);
    const errors = validateChat(data, current);

    if (errors) {
      callback(false, errors);
      return;
    }

    current?.socket.to(data.room).emit("message", { from: current.name, message: data.message });
    console.log(`user ${current?.name} wrote: "${data.message}" to ${data.room} `);
    callback(true);
  });
}
