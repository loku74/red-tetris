// global
import z from "zod";

// intern
import { ERROR_NOT_IN_A_ROOM } from "../constants/validateErrors";
import { getRoomBySocket } from "../core/room";
import { getUser } from "../core/user";
import { Room } from "../objects/Room";
import { formatSchemeError, messageValidation } from "./validation";

// types
import type { EventMessagePayload } from "@app/shared";
import type { Socket } from "socket.io";
import type { User } from "../objects/User";
import type { ValidateError } from "../types/validate";

const schema = z.object({
  message: messageValidation
});

type ValidateChatSuccess = {
  status: true;
  current: User;
  message: string;
  room: Room;
};

type ValidateChatResult = ValidateChatSuccess | ValidateError;

export function validateMessage(socket: Socket, data: EventMessagePayload): ValidateChatResult {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { status: false, error: formatSchemeError(result.error) };
  }

  const current = getUser(socket.id);
  const room = getRoomBySocket(socket);

  if (!current || !room) {
    return { status: false, error: { room: ERROR_NOT_IN_A_ROOM } };
  }

  return { status: true, current, message: result.data.message, room: room };
}
