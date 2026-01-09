// intern
import { EVENT_JOIN_ROOM, EVENT_ROOM_UPDATE } from "../constants/events";
import { joinOrCreateRoom } from "../core/room";
import { setUser } from "../core/user";
import { User } from "../objects/User";
import { validateJoinRoom } from "../validate/joinRoom";

// types
import type { SocketJoinRoomData } from "client-types";
import type { Socket } from "socket.io";
import type { Callback } from "../types/types";

export function registerHandlers(socket: Socket) {
  socket.on(EVENT_JOIN_ROOM, (data: SocketJoinRoomData, callback: Callback) => {
    const result = validateJoinRoom(socket, data);
    if (!result.status) {
      callback(false, result.error);
      return;
    }

    const user = new User(socket.id, result.username, socket);
    setUser(socket.id, user);

    const room = joinOrCreateRoom(user, result.roomName);
    socket.join(data.roomName);

    user.socket.to(result.roomName).emit(EVENT_ROOM_UPDATE, room.asInfo());

    console.log(`User ${result.username} joined room ${result.roomName} ${socket.rooms.size}`);

    callback(true, room.asInfo());
  });
}
