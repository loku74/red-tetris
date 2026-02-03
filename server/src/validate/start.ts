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
import type { ValidateError } from "../types/validate";
import type { ServerSocket } from "../types/socket";

type ValidateStartSuccess = {
  status: true;
  room: Room;
};

type ValideStartResult = ValidateStartSuccess | ValidateError;

export function validateStart(socket: ServerSocket): ValideStartResult {
  const current = getUser(socket.id);
  const room = getRoomBySocket(socket);

  if (!current || !room) {
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
