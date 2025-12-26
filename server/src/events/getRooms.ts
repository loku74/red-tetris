import { rooms } from "../objects/Room";
import { ROOM_MAX_USERS } from "../constants";
import type { Socket } from "socket.io";
import type { Callback, SocketGetRoomsResponse } from "../types/types";

export function registerHandlers(socket: Socket) {
  socket.on("get rooms", (callback: Callback) => {
    const result: SocketGetRoomsResponse[] = [];

    rooms.forEach((room) => {
      result.push({
        name: room.name,
        userCount: room.users.size,
        max: ROOM_MAX_USERS
      });
    });

    callback(true, result);
  });
}
