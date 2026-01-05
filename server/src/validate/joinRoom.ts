// global
import z from "zod";

// intern
import { ROOM_MAX, ROOM_MAX_USERS } from "../constants";
import { rooms } from "../objects/Room";
import { formatSchemeError, roomValidation, usernameValidation } from "./validation";

// types
import type { SocketJoinRoomData } from "client-types";
import type { Socket } from "socket.io";
import type { ValidateError } from "../types/server";

const schema = z.object({
  username: usernameValidation,
  room: roomValidation
});

type ValidateJoinRoomSuccess = {
  status: true;
  roomName: string;
  username: string;
};

type ValidateJoinRoomResult = ValidateJoinRoomSuccess | ValidateError;

export function validateJoinRoom(socket: Socket, data: SocketJoinRoomData): ValidateJoinRoomResult {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { status: false, error: formatSchemeError(result.error) };
  }

  if (socket.rooms.size > 1) {
    return {
      status: false,
      error: { joinRoom: `You are already in room ${Array.from(socket.rooms)[1]}` }
    };
  }

  const room = rooms.get(result.data.room);
  if (room && room.users.size >= ROOM_MAX_USERS) {
    return { status: false, error: { joinRoom: "Room is full" } };
  }
  if (rooms.size >= ROOM_MAX) {
    return {
      status: false,
      error: { joinRoom: "Maximum number of rooms reached, please join an existing room" }
    };
  }
  if (room && room.get(data.username)) {
    return { status: false, error: { joinRoom: "This username is already taken in the room!" } };
  }
  if (room && room.playing === true) {
    return { status: false, error: { joinRoom: "This is room is already playing!" } };
  }

  return { status: true, roomName: result.data.room, username: result.data.username };
}
