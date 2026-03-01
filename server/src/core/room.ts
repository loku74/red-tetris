import type { Socket } from "socket.io";

import type { RoomData } from "@app/shared";

import { Room } from "@app/objects/Room";
import { User } from "@app/objects/User";

const rooms: Map<string, Room> = new Map();

export function removeUserFromRoom(user: User, room: Room): RoomData {
  const info = room.remove(user);
  user.socket.leave(room.name);

  if (user.warmUp) {
    user.warmUp.ongoing = false;
  }
  if (room.game && room.game.ongoing) {
    room.game.getPlayer(user.id).alive = false;
  }

  return info;
}

export function joinOrCreateRoom(user: User, room_id: string): Room {
  let room = rooms.get(room_id);

  if (room == undefined) {
    room = new Room(room_id, user);

    rooms.set(room_id, room);
  } else room.add(user);

  return room;
}

export function getRoom(id: string): Room | undefined {
  return rooms.get(id);
}

export function getRooms(): Map<string, Room> {
  return rooms;
}

export function getRoomBySocket(socket: Socket): Room | undefined {
  for (const roomId of socket.rooms) {
    if (roomId !== socket.id) {
      return rooms.get(roomId);
    }
  }
}

export function setRoom(name: string, room: Room) {
  rooms.set(name, room);
}

export function deleteRoom(name: string) {
  rooms.delete(name);
}
