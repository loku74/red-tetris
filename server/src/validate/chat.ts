import z from "zod";
import { formatSchemeError, messageValidation, roomValidation } from "./utils";
import type { User } from "../objects/User";
import { rooms } from "../objects/Room";
import type { SocketChatData } from "client-types";

const chatSchema = z.object({
  message: messageValidation,
  room: roomValidation
});

export function validateChat(
  data: SocketChatData,
  current: User | undefined
): Record<string, string> | null {
  const result = chatSchema.safeParse(data);

  if (!result.success) {
    return formatSchemeError(result.error);
  }
  const room = rooms.get(data.room);

  if (current === undefined) {
    return { chat: "You do not belong to a room!" };
  }
  if (!current.room || room !== current.room) {
    return { chat: `You are not in the room ${room?.name}` };
  }
  return null;
}
