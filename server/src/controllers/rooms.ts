import { Server, Socket } from "socket.io";
import * as z from "zod";
import { ROOM_MAX, ROOM_MAX_LENGTH, ROOM_MAX_USERS, USERNAME_MAX_LENGTH } from "../constants";
import { Room, rooms } from "../objects/Room";
import type { User } from "../objects/User";
import type { JoinRoomData } from "../types";

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

export function joinOrCreateRoom(socket: Socket, room_id: string, user: User): Room {
  let room = rooms.get(room_id);

  if (room == undefined) {
    room = new Room(room_id, user.name);
    room.add(user);
    room.host = user.name;

    rooms.set(room_id, room);
  } else {
    room.add(user);
  }

  // the current socket will receive information with the callback
  // we can exclude him on this call
  // see: https://socket.io/docs/v4/rooms/
  socket.to(room.name).emit("room", room.asInfo());
  return room;
}

function setNextHost(room: Room) {
  const next = room.users.entries().next();

  room.host = next.value![0];
}

export function leaveRoom(server: Server, room_id: string, user: User) {
  const room = rooms.get(room_id);

  if (room) {
    room.remove(user);
    console.log(`User ${user.name} left room ${room_id}`);

    // deletion of empty room
    if (room.users.size == 0) {
      rooms.delete(room_id);
      console.log(`room ${room_id} deleted`);
    } else {
      setNextHost(room);

      // update all people of the "situation" of the room
      server.to(room.name).emit("room", room.asInfo());

      // game logic then (declare lose etc..)
    }
  }
}
