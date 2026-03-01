import z from "zod";

import { type EventStartPayload, GAME_MIN_PLAYERS, type GameSettings } from "@app/shared";

import {
  ERROR_GAME_NOT_ENOUGH_PLAYERS,
  ERROR_NOT_HOST,
  ERROR_NOT_IN_A_ROOM,
  ERROR_PLAYING_ROOM
} from "@app/constants/validateErrors";
import { getRoomBySocket } from "@app/core/room";
import { getUser } from "@app/core/user";
import { Room } from "@app/objects/Room";
import type { ServerSocket } from "@app/types/socket";
import type { ValidateError } from "@app/types/validate";

import { formatSchemeError, tickValidation } from "./validation";

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
  if (room.users.size < GAME_MIN_PLAYERS) {
    return { status: false, error: { room: ERROR_GAME_NOT_ENOUGH_PLAYERS } };
  }

  const GameSettings: GameSettings = {
    tick: result.data.tick
  };

  return { status: true, room, GameSettings: GameSettings };
}
