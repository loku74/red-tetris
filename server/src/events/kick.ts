// global
import { Server, Socket } from "socket.io";

// intern
import { EVENT_KICK, EVENT_ROOM_UPDATE } from "../constants/events";
import { removeUserFromRoom } from "../core/room";
import { validateKick } from "../validate/kick";

// types
import type { SocketKickData } from "client-types";
import type { Callback } from "../types/types";

export function registerHandlers(io: Server, socket: Socket) {
  socket.on(EVENT_KICK, (data: SocketKickData, callback: Callback) => {
    const result = validateKick(socket, data);
    if (!result.status) {
      callback(result.status, result.error);
      return;
    }

    const roomInfo = removeUserFromRoom(result.targetUser, result.room);
    result.targetUser.socket.emit(EVENT_KICK, { room: result.room.name });
    io.to(result.room.name).emit(EVENT_ROOM_UPDATE, roomInfo);

    console.log(
      `User ${result.targetUser.name} was kicked from room ${result.room.name} by ${result.current.name}`
    );

    callback(true);
  });
}
