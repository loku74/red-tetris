import { Server, type Socket } from "socket.io";
import { users } from "../objects/User";
import { getRoom } from "../objects/Room";

export function registerHandlers(io: Server, socket: Socket) {
  socket.on("disconnecting", () => {
    const user = users.get(socket.id);
    const room = getRoom(socket);

    // user can only we waiting to join a room
    if (user && room) {
      const roomInfo = room.remove(user);

      socket.leave(room.name);
      io.to(room.name).emit("room update", roomInfo);
    }
    console.log("user disconnected");
  });
}
