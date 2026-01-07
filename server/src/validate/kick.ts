// global
import z from "zod";

// intern
import { type Room } from "../objects/Room";
import { users, type User } from "../objects/User";
import { formatSchemeError, usernameValidation } from "./validation";

// types
import type { SocketKickData } from "client-types";
import type { Socket } from "socket.io";
import type { ValidateError } from "../types/server";
import {
  KICK_INEXISTING,
  KICK_ITSELF,
  KICK_PLAYING,
  NOT_HOST,
  NOT_IN_A_ROOM
} from "../constants/error";

const schema = z.object({
  username: usernameValidation,
});

type ValidateKickSuccess = {
  status: true;
  room: Room;
  current: User;
  targetUser: User;
};

export type ValidateKickResult = ValidateKickSuccess | ValidateError;

export function validateKick(socket: Socket, data: SocketKickData): ValidateKickResult {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { status: false, error: formatSchemeError(result.error) };
  }

  const current = users.get(socket.id);
  if (current === undefined || current.room === null) {
    return { status: false, error: { username: NOT_IN_A_ROOM } };
  }
  if (result.data.username === current.name) {
    return { status: false, error: { username: KICK_ITSELF } };
  }

  const room = current.room;
  if (room.host != current) {
    return { status: false, error: { username: NOT_HOST } };
  }
  if (room.playing === true) {
    return { status: false, error: { username: KICK_PLAYING } };
  }

  const targetUser = room.get(data.username);
  if (targetUser === undefined) {
    return { status: false, error: { username: KICK_INEXISTING } };
  }

  return { status: true, room, current, targetUser };
}
