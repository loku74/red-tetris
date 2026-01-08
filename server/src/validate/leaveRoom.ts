// intern
import { type Room } from "../objects/Room";
import { users, type User } from "../objects/User";

// types
import type { Socket } from "socket.io";
import type { ValidateError } from "../types/server";
import { INEXISTING_ROOM, USER_NOT_FOUND } from "../constants/error";

type ValidateLeaveRoomSuccess = {
  status: true;
  current: User;
  room: Room;
};

type ValidateLeaveRoomResult = ValidateLeaveRoomSuccess | ValidateError;

export function validateLeaveRoom(socket: Socket): ValidateLeaveRoomResult {
  const current = users.get(socket.id);
  const room = current?.room;

  if (current === undefined) {
    return { status: false, error: { room: USER_NOT_FOUND } };
  }
  if (room === undefined || room === null) {
    return { status: false, error: { room: INEXISTING_ROOM } };
  }

  return { status: true, room, current };
}
