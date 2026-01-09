// intern
import { validateJoinRoom } from "../validate/joinRoom";
import { EVENT_CAN_JOIN_ROOM } from "../constants/events";

// types
import type { SocketJoinRoomData } from "client-types";
import type { Socket } from "socket.io";
import type { Callback } from "../types/types";

export function registerHandlers(socket: Socket) {
  socket.on(EVENT_CAN_JOIN_ROOM, (data: SocketJoinRoomData, callback: Callback) => {
    const result = validateJoinRoom(socket, data);
    if (!result.status) {
      callback(result.status, result.error);
      return;
    }

    callback(true, { roomName: result.roomName, username: result.username });
  });
}
