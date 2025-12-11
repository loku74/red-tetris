import { Socket } from "socket.io";
import * as z from "zod";
import { ROOM_MAX, ROOM_MAX_LENGTH, ROOM_MAX_USERS, USERNAME_MAX_LENGTH } from "../constants";
import { Room, rooms } from "../objects/Room";
import { type User } from "../objects/User";
import type { JoinRoomData, KickData } from "../types";
import { formatSchemeError } from "./utils";

const roomSchema = z.object({
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
  const result = roomSchema.safeParse(data);
  if (!result.success) {
    return formatSchemeError(result.error);
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

export function joinOrCreateRoom(user: User, room_id: string): Room {
  let room = rooms.get(room_id);

  if (room == undefined) {
    room = new Room(room_id, user);

    rooms.set(room_id, room);
  } else {
    room.add(user);
  }

  // the current socket will receive information with the callback
  // we can exclude him on this call
  // see: https://socket.io/docs/v4/rooms/
  user.socket.to(room.name).emit("room", room.asInfo());
  return room;
}

function setNextHost(room: Room) {
  const next = room.users.entries().next();

  if (next.value) {
    room.host = next.value[1];
  }
}

export function leaveRoom(target: User, room_id: string) {
  const room = rooms.get(room_id);

  if (room) {
    room.remove(target);
    target.socket.leave(room_id);

    console.log(`User ${target.name} left room ${room_id}`);

    // deletion of empty room
    if (room.users.size == 0) {
      rooms.delete(room_id);
      console.log(`room ${room_id} deleted`);
    } else {
      setNextHost(room);

      // update all people of the "situation" of the room
      target.socket.to(room.name).emit("room", room.asInfo());

      // game logic then (declare lose etc..)
    }
  }
}

export function validateKick(
  data: KickData,
  current: User | undefined
): Record<string, string> | null {
  const result = roomSchema.safeParse(data);

  if (!result.success) {
    return formatSchemeError(result.error);
  }
  const room = rooms.get(data.room);

  if (current === undefined) {
    return { kick: "You do not belong to a room!" };
  }
  if (room === undefined) {
    return { kick: `The room ${data.room} does not exist!` };
  }
  if (room.host.name != current.name) {
    return { kick: "You are not the host of this room!" };
  }
  if (data.username === current.name) {
    return { kick: "You can't kick yourself! " };
  }
  if (room.get(data.username) === undefined) {
    return { kick: `The user ${data.username} is not in the room!` };
  }
  return null;
}
