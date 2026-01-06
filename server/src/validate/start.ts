// global
import z from "zod";

// intern
import { Room, rooms } from "../objects/Room";
import { users } from "../objects/User";
import { formatSchemeError, roomValidation } from "./validation";

// types
import type { SocketStartData } from "client-types";
import type { Socket } from "socket.io";
import type { ValidateError } from "../types/server";
import { INEXISTING_ROOM, NOT_HOST, NOT_IN_A_ROOM, PLAYING_ROOM } from "../constants/error";

const schema = z.object({
  room: roomValidation
});

type ValidateStartSuccess = {
  status: true;
  room: Room;
};

type ValideStartResult = ValidateStartSuccess | ValidateError;

export function validateStart(socket: Socket, data: SocketStartData): ValideStartResult {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { status: false, error: formatSchemeError(result.error) };
  }

  const current = users.get(socket.id);
  if (current === undefined) {
    return { status: false, error: { start: NOT_IN_A_ROOM } };
  }

  const room = rooms.get(data.room);
  if (room === undefined) {
    return { status: false, error: { start: INEXISTING_ROOM } };
  }
  if (room.host != current) {
    return { status: false, error: { start: NOT_HOST } };
  }
  if (room.playing === true) {
    return { status: false, error: { start: PLAYING_ROOM } };
  }

  return { status: true, room };
}
