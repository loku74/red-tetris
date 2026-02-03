// global
import z from "zod";

// intern
import {
  ERROR_KICK_PLAYING,
  ERROR_KICK_SELF,
  ERROR_NOT_HOST,
  ERROR_NOT_IN_A_ROOM,
  ERROR_USER_NOT_FOUND
} from "../constants/validateErrors";
import { getRoomBySocket } from "../core/room";
import { getUser } from "../core/user";
import { formatSchemeError, usernameValidation } from "./validation";

// types
import type { EventKickPayload } from "@app/shared";
import type { Room } from "../objects/Room";
import type { User } from "../objects/User";
import type { ValidateError } from "../types/validate";
import type { ServerSocket } from "../types/socket";

const schema = z.object({
  username: usernameValidation
});

type ValidateKickSuccess = {
  status: true;
  room: Room;
  current: User;
  targetUser: User;
};

export type ValidateKickResult = ValidateKickSuccess | ValidateError;

export function validateKick(socket: ServerSocket, data: EventKickPayload): ValidateKickResult {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { status: false, error: formatSchemeError(result.error) };
  }

  const current = getUser(socket.id);
  const room = getRoomBySocket(socket);

  if (!current || !room) {
    return { status: false, error: { username: ERROR_NOT_IN_A_ROOM } };
  }
  if (result.data.username === current.name) {
    return { status: false, error: { username: ERROR_KICK_SELF } };
  }
  if (room.host != current) {
    return { status: false, error: { username: ERROR_NOT_HOST } };
  }
  if (room.playing === true) {
    return { status: false, error: { username: ERROR_KICK_PLAYING } };
  }

  const targetUser = room.get(data.username);
  if (targetUser === undefined) {
    return { status: false, error: { username: ERROR_USER_NOT_FOUND } };
  }

  return { status: true, room, current, targetUser };
}
