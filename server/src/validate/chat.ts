// global
import z from "zod";

// intern
import { formatSchemeError, messageValidation, roomValidation } from "./validation";
import { Room, rooms } from "../objects/Room";
import { users } from "../objects/User";

// types
import type { User } from "../objects/User";
import type { SocketChatData } from "client-types";
import type { ValidateError } from "../types/server";
import type { Socket } from "socket.io";

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
    return { status: false, error: { chat: "You do not belong to a room!" } };
  }

  if (!current.room || room !== current.room) {
    return { status: false, error: { chat: `You are not in the room ${room?.name}` } };
  }

  return { status: true, current, message: result.data.message, room };
}
