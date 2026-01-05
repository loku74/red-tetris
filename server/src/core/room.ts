import { Room } from "../objects/Room";
import { User } from "../objects/User";
import type { SocketRoomInfoData } from "../types/types";

export function removeUserFromRoom(user: User, room: Room): SocketRoomInfoData {
  const info = room.remove(user);
  user.socket.leave(room.name);

  return info;
}
