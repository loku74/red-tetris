// global
import z from "zod";

// intern
import { rooms, type Room } from "../objects/Room";
import { users, type User } from "../objects/User";
import { formatSchemeError, roomValidation } from "./validation";

// types
import type { SocketLeaveRoomData } from "client-types";
import type { Socket } from "socket.io";
import type { ValidateError } from "../types/server";
import { INEXISTING_ROOM, NOT_IN_THIS_ROOM, USER_NOT_FOUND } from "../constants/error";

const schema = z.object({
  room: roomValidation
});

type ValidateLeaveRoomSuccess = {
  status: true;
  current: User;
  room: Room;
};

type ValidateLeaveRoomResult = ValidateLeaveRoomSuccess | ValidateError;

export function validateLeaveRoom(
  socket: Socket,
  data: SocketLeaveRoomData
): ValidateLeaveRoomResult {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { status: false, error: formatSchemeError(result.error) };
  }

  const current = users.get(socket.id);
  if (current === undefined) {
    return { status: false, error: { leaveRoom: USER_NOT_FOUND } };
  }

  const room = rooms.get(result.data.room);
  if (room === undefined) {
    return { status: false, error: { leaveRoom: INEXISTING_ROOM } };
  }
  if (!room.exist(current)) {
    return { status: false, error: { leaveRoom: NOT_IN_THIS_ROOM } };
  }

  return { status: true, room, current };
}
