// global
import { EVENT_JOIN_ROOM, EVENT_ROOM_UPDATE } from "@app/shared";

// intern
import { joinOrCreateRoom } from "../core/room";
import { setUser } from "../core/user";
import { User } from "../objects/User";
import { validateJoinRoom } from "../validate/joinRoom";

// types
import type { AppServer, ServerSocket } from "../types/socket";

export function registerHandlers(io: AppServer, socket: ServerSocket) {
  socket.on(EVENT_JOIN_ROOM, (payload, callback) => {
    const result = validateJoinRoom(socket, payload);
    if (!result.status) {
      callback({ success: false, error: result.error });
      return;
    }

    const user = new User(socket.id, result.username, socket);
    setUser(socket.id, user);

    const room = joinOrCreateRoom(user, result.room);
    socket.join(result.room);

    io.to(result.room).emit(EVENT_ROOM_UPDATE, room.asInfo());

    console.log(`User ${result.username} joined room ${result.room} ${socket.rooms.size}`);

    callback({
      success: true,
      data: { room: result.room, username: result.username, color: user.color }
    });
  });
}
