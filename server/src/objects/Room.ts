import { ROOM_MAX_USERS } from "../constants";
import type { RoomInfo } from "../types";
import type { User } from "./User";

export class Room {
  public users: Map<string, User> = new Map();

  constructor(
    public name: string,
    public host: string
  ) {}

  public exist(user: User) {
    return this.users.has(user.name);
  }

  public add(user: User) {
    this.users.set(user.name, user);
  }

  public remove(user: User) {
    this.users.delete(user.name);
  }

  public asInfo(): RoomInfo {
    return {
      players: this.users.keys().toArray(),
      userCount: this.users.size,
      max: ROOM_MAX_USERS,
      host: this.host
    };
  }
}

export const rooms: Map<string, Room> = new Map();
