import z from "zod";
import { rooms, type Room } from "../objects/Room";
import { type User } from "../objects/User";
import { formatSchemeError, roomValidation } from "./validation";
import type { SocketLeaveRoomData } from "client-types";
import type { ValidateError } from "../types/server";

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
  data: SocketLeaveRoomData,
  current: User | undefined
): ValidateLeaveRoomResult {
  const result = schema.safeParse(data);

  if (!result.success) {
    return { status: false, error: formatSchemeError(result.error) };
  }

  if (current === undefined) {
    return { status: false, error: { leaveRoom: "User not found" } };
  }

  const room = rooms.get(result.data.room);

  if (room === undefined) {
    return { status: false, error: { leaveRoom: `The room ${data.room} does not exist` } };
  }

  if (!room.exist(current)) {
    return { status: false, error: { leaveRoom: "You do not belong to this room" } };
  }

  return { status: true, room, current };
}
