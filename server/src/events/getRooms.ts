// intern
import { ROOM_MAX_USERS } from "../constants/core";
import { EVENT_GET_ROOMS } from "../constants/events";
import { getRooms } from "../core/room";

// types
import type { Socket } from "socket.io";
import type { Callback, SocketGetRoomsResponse } from "../types/types";

export function registerHandlers(socket: Socket) {
  socket.on(EVENT_GET_ROOMS, (callback: Callback) => {
    const result: SocketGetRoomsResponse[] = [];

    getRooms().forEach((room) => {
      if (room.playing) {
        return;
      }
      result.push({
        name: room.name,
        userCount: room.users.size,
        max: ROOM_MAX_USERS
      });
    });

    callback(true, result);
  });
}
