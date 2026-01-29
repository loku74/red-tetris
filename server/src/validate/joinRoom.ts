// global
import z from "zod";

// intern
import { ROOM_MAX, ROOM_MAX_USERS } from "../constants/core";
import {
  ERROR_ALREADY_IN_A_ROOM,
  ERROR_MAX_ROOMS,
  ERROR_PLAYING_ROOM,
  ERROR_ROOM_IS_FULL,
  ERROR_USERNAME_TAKEN
} from "../constants/validateErrors";
import { getRoom, getRooms } from "../core/room";
import { formatSchemeError, roomValidation, usernameValidation } from "./validation";

// types
import type { EventJoinRoomPayload } from "@app/shared";
import type { Socket } from "socket.io";
import type { ValidateError } from "../types/validate";

const schema = z.object({
  username: usernameValidation,
  roomName: roomValidation
});

type ValidateJoinRoomSuccess = {
  status: true;
  roomName: string;
  username: string;
};

type ValidateJoinRoomResult = ValidateJoinRoomSuccess | ValidateError;

export function validateJoinRoom(
  socket: Socket,
  data: EventJoinRoomPayload
): ValidateJoinRoomResult {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { status: false, error: formatSchemeError(result.error) };
  }

  if (socket.rooms.size > 1) {
    return {
      status: false,
      error: { roomName: ERROR_ALREADY_IN_A_ROOM }
    };
  }

  const room = getRoom(result.data.roomName);
  if (room && room.users.size >= ROOM_MAX_USERS) {
    return { status: false, error: { roomName: ERROR_ROOM_IS_FULL } };
  }
  if (room && room.get(data.username)) {
    return { status: false, error: { username: ERROR_USERNAME_TAKEN } };
  }
  if (room && room.playing === true) {
    return { status: false, error: { roomName: ERROR_PLAYING_ROOM } };
  }
  if (getRooms().size >= ROOM_MAX) {
    return {
      status: false,
      error: { roomName: ERROR_MAX_ROOMS }
    };
  }

  return { status: true, roomName: result.data.roomName, username: result.data.username };
}
