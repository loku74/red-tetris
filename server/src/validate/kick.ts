import z from "zod";
import { rooms } from "../objects/Room";
import { type User } from "../objects/User";
import { formatSchemeError, roomValidation, usernameValidation } from "./utils";
import type { SocketKickData } from "client-types";

const schema = z.object({
  username: usernameValidation,
  room: roomValidation
});

export function validateKick(
  data: SocketKickData,
  current: User | undefined
): Record<string, string> | null {
  const result = schema.safeParse(data); // à changer!

  if (!result.success) {
    return formatSchemeError(result.error);
  }
  const room = rooms.get(data.room);

  if (current === undefined) {
    return { kick: "You do not belong to a room!" };
  }
  if (room === undefined) {
    return { kick: `The room ${data.room} does not exist!` };
  }
  if (room.host != current) {
    return { kick: "You are not the host of this room!" };
  }
  if (data.username === current.name) {
    return { kick: "You can't kick yourself! " };
  }
  if (room.get(data.username) === undefined) {
    return { kick: `The user ${data.username} is not in the room!` };
  }
  return null;
}
