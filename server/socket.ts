import * as z from "zod";
import { USERNAME_MAX_LENGTH, ROOM_MAX_LENGTH, ROOM_MAX_USERS, ROOM_MAX } from "./constants";
import type { JoinRoomData } from "./types";
import { Server, Socket } from "socket.io";

const joinRoomSchema = z.object({
  username: z
    .string()
    .min(1, "Username cannot be empty")
    .max(USERNAME_MAX_LENGTH, `Username cannot be longer than ${USERNAME_MAX_LENGTH} characters`),
  room: z
    .string()
    .min(1, "Room name cannot be empty")
    .max(ROOM_MAX_LENGTH, `Room name cannot be longer than ${ROOM_MAX_LENGTH} characters`)
});

export function validateJoinRoom(
  io: Server,
  socket: Socket,
  data: JoinRoomData
): Record<string, string> | null {
  const result = joinRoomSchema.safeParse(data);
  if (!result.success) {
    return result.error.issues.reduce(
      (acc, issue) => {
        const varName = issue.path.join(".");
        acc[varName] = issue.message;
        return acc;
      },
      {} as Record<string, string>
    );
  }
  if (socket.rooms.size > 1) {
    return { room: `You are already in room ${Array.from(socket.rooms)[1]}` };
  }
  const adapter = io.sockets.adapter;
  const room = adapter.rooms.get(data.room);
  if (room && room.size >= ROOM_MAX_USERS) {
    return { room: "Room is full" };
  }

  let roomCount = 0;
  adapter.rooms.forEach((_, roomName) => {
    if (!adapter.sids.has(roomName)) {
      roomCount++;
    }
  });

  if (roomCount >= ROOM_MAX) {
    return { room: "Maximum number of rooms reached, please join an existing room" };
  }

  return null;
}
