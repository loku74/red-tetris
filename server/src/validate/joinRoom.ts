// global
import z from "zod";

// intern
import { ROOM_MAX, ROOM_MAX_USERS } from "../constants/core";
import { rooms } from "../objects/Room";
import { formatSchemeError, roomValidation, usernameValidation } from "./validation";

// types
import type { SocketJoinRoomData } from "client-types";
import type { Socket } from "socket.io";
import type { ValidateError } from "../types/server";
import {
  ALREADY_IN_A_ROOM,
  MAX_ROOMS,
  PLAYING_ROOM,
  ROOM_IS_FULL,
  USERNAME_TAKEN
} from "../constants/error";

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
      error: { roomName: ALREADY_IN_A_ROOM }
    };
  }

  const room = rooms.get(result.data.room);
  if (room && room.users.size >= ROOM_MAX_USERS) {
    return { status: false, error: { roomName: ROOM_IS_FULL } };
  }
  if (rooms.size >= ROOM_MAX) {
    return {
      status: false,
      error: { roomName: MAX_ROOMS }
    };
  }
  if (room && room.get(data.username)) {
    return { status: false, error: { username: USERNAME_TAKEN } };
  }
  if (room && room.playing === true) {
    return { status: false, error: { roomName: PLAYING_ROOM } };
  }

  return { status: true, roomName: result.data.room, username: result.data.username };
}
