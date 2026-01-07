import { Room } from "../objects/Room";
import { User } from "../objects/User";
import type { SocketRoomInfoData } from "../types/types";
import type { Socket } from "socket.io";

export const rooms: Map<string, Room> = new Map();

export function removeUserFromRoom(user: User, room: Room): SocketRoomInfoData {
  const info = room.remove(user);
  user.socket.leave(room.name);

  return info;
}

export function joinOrCreateRoom(user: User, room_id: string): Room {
  let room = rooms.get(room_id);

  if (room == undefined) {
    room = new Room(room_id, user);

    rooms.set(room_id, room);
  } else {
    const userColor = room.add(user);
    user.color = userColor;
  }

  user.room = room;
  return room;
}

export function getRoom(id: string): Room | undefined {
  return rooms.get(id);
}

export function getRoomBySocket(socket: Socket): Room | undefined {
  for (const roomId of socket.rooms) {
    if (roomId !== socket.id) {
      return rooms.get(roomId) ?? undefined;
    }
  }
  return undefined;
}

export function getRoomByUser(user: User): Room | undefined {
  return getRoomBySocket(user.socket);
}
