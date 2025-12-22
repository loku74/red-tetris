import type { Socket } from "socket.io";
import { ROOM_MAX_USERS } from "../constants";
import type { SocketRoomInfoData, SocketUserColor } from "../types/types";
import { users, type User } from "./User";

export class Room {
  public users: Map<string, { color: SocketUserColor; user: User }> = new Map();
  public colors: Array<SocketUserColor> = [
    "cyan",
    "red",
    "green",
    "blue",
    "yellow",
    "orange",
    "purple",
    "grey"
  ];

  constructor(
    public name: string,
    public host: User
  ) {
    this.add(host);
  }

  public exist(user: User) {
    return this.users.has(user.id);
  }

  private getColor() {
    const color = this.colors.shift();

    // should never be empty because max player is checked
    if (!color) throw new Error("No more colors available");

    return color;
  }

  public setNextHost() {
    const next = this.users.entries().next();

    if (next.value) {
      this.host = next.value[1].user;
    }
  }

  public add(user: User): SocketRoomInfoData {
    if (this.exist(user)) throw new Error("User already exists");
    else if (this.users.size >= ROOM_MAX_USERS) throw new Error("Room is full");

    const color = this.getColor();
    this.users.set(user.id, { color, user });

    return this.asInfo();
  }

  public remove(user: User): SocketRoomInfoData {
    const retrieved = this.users.get(user.id);
    if (!retrieved) throw new Error("User not found");

    this.users.delete(retrieved.user.id);
    this.colors.push(retrieved.color);

    console.log(`User ${user.name} left room ${user.name}`);
    // deletion of empty room
    if (this.users.size == 0) {
      rooms.delete(this.name);
      console.log(`room ${this.name} deleted`);
    } else {
      if (user === this.host) {
        this.setNextHost();
      }
    }

    // an user cannot exist outside of a room
    users.delete(user.socket.id);
    return this.asInfo();
  }

  // there are no duplicates usernames in a room
  public get(username: string): User | undefined {
    const found = [...this.users.values()].find((u) => u.user.name === username);
    return found?.user;
  }

  public asInfo(): SocketRoomInfoData {
    return {
      name: this.name,
      players: [...this.users.values()].map((u) => ({ color: u.color, username: u.user.name })),
      userCount: this.users.size,
      max: ROOM_MAX_USERS,
      host: this.host.name
    };
  }
}

export const rooms: Map<string, Room> = new Map();

export function joinOrCreateRoom(user: User, room_id: string): Room {
  let room = rooms.get(room_id);

  if (room == undefined) {
    room = new Room(room_id, user);

    rooms.set(room_id, room);
  } else {
    room.add(user);
  }

  user.room = room;
  return room;
}

export function getRoom(socket: Socket): Room | null {
  for (const roomId of socket.rooms) {
    if (roomId !== socket.id) {
      return rooms.get(roomId) ?? null;
    }
  }
  return null;
}
