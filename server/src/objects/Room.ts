import type { User } from "./User";

export class Room {
  public users: Map<string, User> = new Map();

  constructor(public name: string) {}

  public exist(user: User) {
    return this.users.has(user.name);
  }

  public add(user: User) {
    this.users.set(user.name, user);
  }

  public remove(user: User) {
    this.users.delete(user.name);
  }
}

export const rooms: Map<string, Room> = new Map();
