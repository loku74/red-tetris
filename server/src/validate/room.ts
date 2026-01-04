import type { SocketJoinRoomData } from "client-types";
import { Socket } from "socket.io";
import * as z from "zod";
import { ROOM_MAX, ROOM_MAX_USERS } from "../constants";
import { rooms } from "../objects/Room";
import { formatSchemeError, roomValidation, usernameValidation } from "./utils";

const schema = z.object({
  username: usernameValidation,
  room: roomValidation
});

export function validateJoinRoom(
  socket: Socket,
  data: SocketJoinRoomData
): Record<string, string> | null {
  const result = schema.safeParse(data);
  if (!result.success) {
    return formatSchemeError(result.error);
  }

  const room = rooms.get(result.data.room);

  if (socket.rooms.size > 1) {
    return { room: `You are already in room ${Array.from(socket.rooms)[1]}` };
  }

  if (room && room.users.size >= ROOM_MAX_USERS) {
    return { room: "Room is full" };
  }
  if (rooms.size >= ROOM_MAX) {
    return { room: "Maximum number of rooms reached, please join an existing room" };
  }
  if (room && room.get(data.username)) {
    return { room: "This username is already taken in the room!" };
  }
  if (room && room.playing === true) {
    return { room: "This is room is already playing!" };
  }

  return null;
}
