// global
import { Server, Socket } from "socket.io";

// intern
import { EVENT_MESSAGE } from "../constants/events";
import { validateChat } from "../validate/chat";

// types
import type { SocketChatData } from "client-types";
import type { Callback } from "../types/types";

export function registerHandlers(io: Server, socket: Socket) {
  socket.on(EVENT_MESSAGE, (data: SocketChatData, callback: Callback) => {
    const result = validateChat(socket, data);
    if (!result.status) {
      callback(false, result.error);
      return;
    }

    io.to(result.room.name).emit(EVENT_MESSAGE, {
      from: result.current.name,
      color: result.current.color,
      message: result.message
    });

    console.log(`user ${result.current.name} wrote: "${result.message}" to ${result.room.name} `);

    callback(true);
  });
}
