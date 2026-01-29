// global
import { EVENT_JOIN_ROOM, EVENT_ROOM_UPDATE } from "@app/shared";

// intern
import { joinOrCreateRoom } from "../core/room";
import { setUser } from "../core/user";
import { User } from "../objects/User";
import { validateJoinRoom } from "../validate/joinRoom";

// types
import type { ServerSocket } from "../types/socket";

export function registerHandlers(socket: ServerSocket) {
  socket.on(EVENT_JOIN_ROOM, (payload, callback) => {
    const result = validateJoinRoom(socket, payload);
    if (!result.status) {
      callback({ success: false, error: result.error });
      return;
    }

    const user = new User(socket.id, result.username, socket);
    setUser(socket.id, user);

    const room = joinOrCreateRoom(user, result.roomName);
    socket.join(result.roomName);

    user.socket.to(result.roomName).emit(EVENT_ROOM_UPDATE, room.asInfo());

    console.log(`User ${result.username} joined room ${result.roomName} ${socket.rooms.size}`);

    callback({
      success: true,
      data: { username: result.username, roomInfo: room.asInfo() }
    });
  });
}
