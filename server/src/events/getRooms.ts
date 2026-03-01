import type { RoomListData } from "@app/shared";
import { EVENT_GET_ROOMS } from "@app/shared";

import { ROOM_MAX_USERS } from "@app/constants/core";
import { getRooms } from "@app/core/room";
import type { ServerSocket } from "@app/types/socket";

export function registerHandlers(socket: ServerSocket) {
  socket.on(EVENT_GET_ROOMS, (callback) => {
    const result: RoomListData[] = [];

    getRooms().forEach((room) => {
      result.push({
        name: room.name,
        userCount: room.users.size,
        max: ROOM_MAX_USERS,
        playing: room.game !== null
      });
    });

    callback({ success: true, data: result });
  });
}
