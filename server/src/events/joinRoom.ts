import type { SocketJoinRoomData } from "client-types";
import { validateJoinRoom } from "../validate/room";
import type { Callback } from "../types/types";
import { User, users } from "../objects/User";
import { joinOrCreateRoom } from "../objects/Room";
import type { Socket } from "socket.io";

export function registerHandlers(socket: Socket) {
  socket.on("join room", (data: SocketJoinRoomData, callback: Callback) => {
    const errors = validateJoinRoom(socket, data);
    if (errors) {
      callback(false, errors);
      return;
    }

    const user = new User(socket.id, data.username, socket);
    users.set(socket.id, user);

    const room = joinOrCreateRoom(user, data.room);
    socket.join(data.room);

    // the current socket will receive information with the callback
    // we can exclude him on this call
    // see: https://socket.io/docs/v4/rooms/
    user.socket.to(room.name).emit("room update", room.asInfo());

    console.log(`User ${users.get(socket.id)?.name} joined room ${data.room} ${socket.rooms.size}`);
    callback(true, room.asInfo());
  });
}
