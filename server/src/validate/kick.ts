// global
import z from "zod";

// intern
import { rooms, type Room } from "../objects/Room";
import { users, type User } from "../objects/User";
import { formatSchemeError, roomValidation, usernameValidation } from "./validation";

// types
import type { SocketKickData } from "client-types";
import type { Socket } from "socket.io";
import type { ValidateError } from "../types/server";

const schema = z.object({
  username: usernameValidation,
  room: roomValidation
});

type ValidateKickSuccess = {
  status: true;
  room: Room;
  current: User;
  targetUser: User;
};

export type ValidateKickResult = ValidateKickSuccess | ValidateError;

export function validateKick(socket: Socket, data: SocketKickData): ValidateKickResult {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { status: false, error: formatSchemeError(result.error) };
  }

  const current = users.get(socket.id);
  if (current === undefined) {
    return { status: false, error: { kick: "You do not belong to a room!" } };
  }
  if (result.data.username === current.name) {
    return { status: false, error: { kick: "You can't kick yourself! " } };
  }

  const room = rooms.get(data.room);
  if (room === undefined) {
    return { status: false, error: { kick: `The room ${data.room} does not exist!` } };
  }
  if (room.host != current) {
    return { status: false, error: { kick: "You are not the host of this room!" } };
  }
  if (room.playing === true) {
    return { status: false, error: { kick: "You can't kick while playing!" } };
  }
  if (room.playing) {
    return { status: false, error: { kick: "You can't kick while playing!" } };
  }

  const targetUser = room.get(data.username);
  if (targetUser === undefined) {
    return { status: false, error: { kick: `The user ${data.username} is not in the room!` } };
  }

  return { status: true, room, current, targetUser };
}
