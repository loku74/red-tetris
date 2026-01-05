import z from "zod";
import { rooms } from "../objects/Room";
import { type User } from "../objects/User";
import { formatSchemeError, roomValidation } from "./validation";
import type { SocketStartData } from "client-types";

const schema = z.object({
  room: roomValidation
});

export function validateStart(
  data: SocketStartData,
  current: User | undefined
): Record<string, string> | null {
  const result = schema.safeParse(data); // à changer!

  if (!result.success) {
    return formatSchemeError(result.error);
  }
  const room = rooms.get(data.room);

  if (current === undefined) {
    return { start: "You do not belong to a room!" };
  }
  if (room === undefined) {
    return { start: `The room ${data.room} does not exist!` };
  }
  if (room.host != current) {
    return { start: "You are not the host of this room!" };
  }
  if (room.playing === true) {
    return { start: "Room is already started!" };
  }
  return null;
}
