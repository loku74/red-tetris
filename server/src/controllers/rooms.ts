import { Socket } from "socket.io";
import * as z from "zod";
import {
  CHAT_MAX_LENGTH,
  ROOM_MAX,
  ROOM_MAX_LENGTH,
  ROOM_MAX_USERS,
  USERNAME_MAX_LENGTH
} from "../constants";
import { Room, rooms } from "../objects/Room";
import { users, type User } from "../objects/User";
import type { SocketJoinRoomData, SocketChatData, SocketKickData } from "client-types";
import { formatSchemeError } from "./utils";

const roomValidation = z
  .string()
  .min(1, "Room name cannot be empty")
  .max(ROOM_MAX_LENGTH, `Room name cannot be longer than ${ROOM_MAX_LENGTH} characters`);

const usernameValidation = z
  .string()
  .min(1, "Username cannot be empty")
  .max(USERNAME_MAX_LENGTH, `Username cannot be longer than ${USERNAME_MAX_LENGTH} characters`);

const messageValidation = z
  .string()
  .min(1, "Message cannot be empty")
  .max(CHAT_MAX_LENGTH, `Message cannot be longer than ${CHAT_MAX_LENGTH} characters`);

const joinRoomSchema = z.object({
  username: usernameValidation,
  room: roomValidation
});

const chatSchema = z.object({
  message: messageValidation,
  room: roomValidation
});

export function validateJoinRoom(
  socket: Socket,
  data: SocketJoinRoomData
): Record<string, string> | null {
  const result = joinRoomSchema.safeParse(data);
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

  return null;
}

export function getRoom(socket: Socket): Room | null {
  for (const roomId of socket.rooms) {
    if (roomId !== socket.id) {
      return rooms.get(roomId) ?? null;
    }
  }
  return null;
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
  user.socket.to(room.name).emit("room update", room.asInfo());
  return room;
}

function setNextHost(room: Room) {
  const next = room.users.entries().next();

  if (next.value) {
    room.host = next.value[1].user;
  }
}

export function leaveRoom(target: User, room: Room) {
  room.remove(target);
  target.socket.leave(room.name);

  console.log(`User ${target.name} left room ${room.name}`);

  // deletion of empty room
  if (room.users.size == 0) {
    rooms.delete(room.name);
    console.log(`room ${room.name} deleted`);
  } else {
    if (target === room.host) {
      setNextHost(room);
    }
  }

  // an user cannot exist outside of a room
  users.delete(target.socket.id);
  return room.asInfo();
}

export function validateKick(
  data: SocketKickData,
  current: User | undefined
): Record<string, string> | null {
  const result = joinRoomSchema.safeParse(data); // à changer!

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
  if (room.host != current) {
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

export function validateChat(
  data: SocketChatData,
  current: User | undefined
): Record<string, string> | null {
  const result = chatSchema.safeParse(data);

  if (!result.success) {
    return formatSchemeError(result.error);
  }
  const room = rooms.get(data.room);

  if (current === undefined) {
    return { chat: "You do not belong to a room!" };
  }
  if (!current.room || room !== current.room) {
    return { chat: `You are not in the room ${room?.name}` };
  }
  return null;
}
