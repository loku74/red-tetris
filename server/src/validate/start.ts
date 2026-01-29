// intern
import {
  ERROR_NOT_HOST,
  ERROR_NOT_IN_A_ROOM,
  ERROR_PLAYING_ROOM
} from "../constants/validateErrors";
import { getRoomBySocket } from "../core/room";
import { getUser } from "../core/user";
import { Room } from "../objects/Room";

// types
import type { Socket } from "socket.io";
import type { ValidateError } from "../types/validate";

type ValidateStartSuccess = {
  status: true;
  room: Room;
};

type ValideStartResult = ValidateStartSuccess | ValidateError;

export function validateStart(socket: Socket): ValideStartResult {
  const current = getUser(socket.id);
  const room = getRoomBySocket(socket);

  if (current === undefined || room === undefined) {
    return { status: false, error: { room: ERROR_NOT_IN_A_ROOM } };
  }
  if (room.host != current) {
    return { status: false, error: { room: ERROR_NOT_HOST } };
  }
  if (room.playing === true) {
    return { status: false, error: { room: ERROR_PLAYING_ROOM } };
  }

  return { status: true, room };
}
