import { ROOM_MAX_USERS } from "../constants";
import type { RoomInfo } from "../types";
import type { User } from "./User";

export class Room {
  public users: Map<string, User> = new Map();

  constructor(
    public name: string,
    public host: User
  ) {
    this.add(host);
  }

  public exist(user: User) {
    return this.users.has(user.id);
  }

  public add(user: User) {
    this.users.set(user.id, user);
  }

  public remove(user: User) {
    this.users.delete(user.id);
  }

  // there are no duplicates usernames in a room
  public get(username: string): User | undefined {
    return [...this.users.values()].find((u) => u.name === username);
  }

  public asInfo(): RoomInfo {
    return {
      players: [...this.users.values()].map((u) => u.name),
      userCount: this.users.size,
      max: ROOM_MAX_USERS,
      host: this.host.name
    };
  }
}

export const rooms: Map<string, Room> = new Map();
