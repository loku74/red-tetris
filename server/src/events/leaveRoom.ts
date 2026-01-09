// global
import { Server, Socket } from "socket.io";

// intern
import { EVENT_LEAVE_ROOM, EVENT_ROOM_UPDATE } from "../constants/events";
import { removeUserFromRoom } from "../core/room";
import { validateLeaveRoom } from "../validate/leaveRoom";

// types
import type { Callback } from "../types/types";

export function registerHandlers(io: Server, socket: Socket) {
  socket.on(EVENT_LEAVE_ROOM, (callback: Callback) => {
    const result = validateLeaveRoom(socket);
    if (!result.status) {
      callback(result.status, result.error);
      return;
    }

    const roomInfo = removeUserFromRoom(result.current, result.room);
    io.to(result.room.name).emit(EVENT_ROOM_UPDATE, roomInfo);

    console.log(`User ${result.current.name} left room ${result.room.name}`);

    callback(result.status);
  });
}
