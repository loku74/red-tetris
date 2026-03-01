import type { EventChangeColorPayload, UserColor } from "@app/shared";

import {
  ERROR_COLOR_UNAVAILABLE,
  ERROR_NOT_IN_A_ROOM,
  ERROR_PLAYING_ROOM
} from "@app/constants/validateErrors";
import { getRoomBySocket } from "@app/core/room";
import { getUser } from "@app/core/user";
import type { Room } from "@app/objects/Room";
import type { User } from "@app/objects/User";
import type { ServerSocket } from "@app/types/socket";
import type { ValidateError } from "@app/types/validate";

type ValidateChangeColorSuccess = {
  status: true;
  room: Room;
  current: User;
  colorIndex: number;
  color: UserColor;
};

type ValidateChangeColorResult = ValidateChangeColorSuccess | ValidateError<{ room: string }>;

export function validateChangeColor(
  socket: ServerSocket,
  payload: EventChangeColorPayload
): ValidateChangeColorResult {
  const current = getUser(socket.id);
  const room = getRoomBySocket(socket);

  if (!current || !room) {
    return { status: false, error: { room: ERROR_NOT_IN_A_ROOM } };
  }
  if (room.game) {
    return { status: false, error: { room: ERROR_PLAYING_ROOM } };
  }

  const index = room.colors.indexOf(payload.color);
  if (index === -1) {
    return { status: false, error: { room: ERROR_COLOR_UNAVAILABLE } };
  }

  return { status: true, room, current, colorIndex: index, color: payload.color };
}
