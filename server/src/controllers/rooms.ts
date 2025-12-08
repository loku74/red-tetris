import * as z from "zod";
import { USERNAME_MAX_LENGTH, ROOM_MAX_LENGTH, ROOM_MAX_USERS, ROOM_MAX } from "../constants";
import { Socket } from "socket.io";
import type { JoinRoomData } from "../types";
import type { User } from "../objects/User";
import { Room, rooms } from "../objects/Room";

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
  const room = rooms.get(data.room);

  if (socket.rooms.size > 1) {
    return { room: `You are already in room ${Array.from(socket.rooms)[1]}` };
  }

  if (room && room.users.size >= ROOM_MAX_USERS) {
    return { room: "Room is full" };
  }

  if (rooms.size >= ROOM_MAX) {
    return { room: "Maximum number of rooms reached, please join an existing room" };
  }

  return null;
}

export function getRoomId(socket: Socket): string | undefined {
  for (const roomId of socket.rooms) {
    if (roomId !== socket.id) {
      return roomId;
    }
  }
  return undefined;
}

export function joinOrCreateRoom(room_id: string, user: User) {
  let room = rooms.get(room_id);

  if (room == undefined) {
    room = new Room(room_id);
    room.add(user);

    rooms.set(room_id, room);
  } else {
    room.add(user);
  }
}

export function leaveRoom(room_id: string, user: User) {
  const room = rooms.get(room_id);

  if (room) {
    room.remove(user);
    console.log(`User ${user.name} left room ${room_id}`);

    // deletion of empty room
    if (room.users.size == 0) {
      rooms.delete(room_id);
    } else {
      // game logic then (declare lose etc..)
    }
  }
}
