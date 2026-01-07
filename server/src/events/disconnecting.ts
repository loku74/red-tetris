import { Server, type Socket } from "socket.io";
import { getUser } from "../core/user";
import { getRoomBySocket } from "../core/room";

export function registerHandlers(io: Server, socket: Socket) {
  socket.on("disconnecting", () => {
    const user = getUser(socket.id);
    const room = getRoomBySocket(socket);

    // user can only we waiting to join a room
    if (user && room) {
      const roomInfo = room.remove(user);

      socket.leave(room.name);
      io.to(room.name).emit("room update", roomInfo);
    }
    console.log("user disconnected");
  });
}
