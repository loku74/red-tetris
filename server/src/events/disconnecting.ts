// global
import { Server, Socket } from "socket.io";

// intern
import { EVENT_ROOM_UPDATE, EVENT_USER_DISCONNECT } from "../constants/events";
import { getRoomBySocket } from "../core/room";
import { getUser } from "../core/user";

export function registerHandlers(io: Server, socket: Socket) {
  socket.on(EVENT_USER_DISCONNECT, () => {
    const user = getUser(socket.id);
    const room = getRoomBySocket(socket);

    // user can only we waiting to join a room
    if (user && room) {
      const roomInfo = room.remove(user);

      socket.leave(room.name);
      io.to(room.name).emit(EVENT_ROOM_UPDATE, roomInfo);
    }
    console.log("user disconnected");
  });
}
