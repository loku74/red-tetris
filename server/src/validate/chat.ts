// global
import z from "zod";

// intern
import { Room, rooms } from "../objects/Room";
import { users } from "../objects/User";
import { formatSchemeError, messageValidation, roomValidation } from "./validation";

// types
import type { SocketChatData } from "client-types";
import type { Socket } from "socket.io";
import type { User } from "../objects/User";
import type { ValidateError } from "../types/server";
import { NOT_IN_A_ROOM, NOT_IN_THIS_ROOM } from "../constants/error";

const schema = z.object({
  message: messageValidation,
  room: roomValidation
});

type ValidateChatSuccess = {
  status: true;
  current: User;
  message: string;
  room: Room;
};

type ValidateChatResult = ValidateChatSuccess | ValidateError;

export function validateChat(socket: Socket, data: SocketChatData): ValidateChatResult {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { status: false, error: formatSchemeError(result.error) };
  }

  const current = users.get(socket.id);
  const room = rooms.get(result.data.room);
  if (current === undefined) {
    return { status: false, error: { room: NOT_IN_A_ROOM } };
  }
  if (!current.room || room !== current.room) {
    return { status: false, error: { room: NOT_IN_THIS_ROOM } };
  }

  return { status: true, current, message: result.data.message, room };
}
