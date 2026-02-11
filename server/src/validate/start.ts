// intern
import {
  ERROR_NOT_HOST,
  ERROR_NOT_IN_A_ROOM,
  ERROR_PLAYING_ROOM
} from "../constants/validateErrors";
import { getRoomBySocket } from "../core/room";
import { getUser } from "../core/user";
import { Room } from "../objects/Room";
import z from "zod";
import { formatSchemeError, tickValidation } from "./validation";

// types
import type { ValidateError } from "../types/validate";
import type { ServerSocket } from "../types/socket";
import type { EventStartPayload, GameSettings } from "@app/shared";

const schema = z.object({
  tick: tickValidation
});

type ValidateStartSuccess = {
  status: true;
  room: Room;
  GameSettings: GameSettings;
};

type ValideStartResult = ValidateStartSuccess | ValidateError;

export function validateStart(socket: ServerSocket, payload: EventStartPayload): ValideStartResult {
  const result = schema.safeParse(payload);

  if (!result.success) {
    return { status: false, error: formatSchemeError(result.error) };
  }
  const current = getUser(socket.id);
  const room = getRoomBySocket(socket);

  if (!current || !room) {
    return { status: false, error: { room: ERROR_NOT_IN_A_ROOM } };
  }
  if (room.host != current) {
    return { status: false, error: { room: ERROR_NOT_HOST } };
  }
  if (room.game) {
    return { status: false, error: { room: ERROR_PLAYING_ROOM } };
  }

  const GameSettings: GameSettings = {
    tick: result.data.tick
  };

  return { status: true, room, GameSettings: GameSettings };
}
