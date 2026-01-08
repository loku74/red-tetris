// intern
import {
  ERROR_NOT_IN_A_ROOM,
  ERROR_PLAYING_ROOM,
  ERROR_WARM_UP_TIMEOUT
} from "../constants/validateErrors";
import { getRoomBySocket } from "../core/room";
import { getUser } from "../core/user";

// types
import type { Socket } from "socket.io";
import type { User } from "../objects/User";
import type { ValidateError } from "../types/server";

type ValidateWarmUpSuccess = {
  status: true;
  current: User;
};

type ValidateWarmUpResult = ValidateWarmUpSuccess | ValidateError;

export function validateWarmUp(socket: Socket): ValidateWarmUpResult {
  const current = getUser(socket.id);
  const room = getRoomBySocket(socket);

  if (current === undefined || room === undefined) {
    return { status: false, error: { room: ERROR_NOT_IN_A_ROOM } };
  }
  if (room.playing) {
    return { status: false, error: { room: ERROR_PLAYING_ROOM } };
  }
  if (current.canWarmUp() == false) {
    return { status: false, error: { room: ERROR_WARM_UP_TIMEOUT } };
  }

  return { status: true, current: current };
}
