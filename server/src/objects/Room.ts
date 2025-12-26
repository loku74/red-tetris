import { ROOM_MAX_USERS } from "../constants";
import type { SocketRoomInfoData, SocketUserColor } from "../types/types";
import type { User } from "./User";

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

  public add(user: User) {
    if (this.exist(user)) throw new Error("User already exists");
    else if (this.users.size >= ROOM_MAX_USERS) throw new Error("Room is full");
    const color = this.getColor();
    this.users.set(user.id, { color, user });
  }

  public remove(user: User) {
    const retrieved = this.users.get(user.id);
    if (!retrieved) throw new Error("User not found");
    this.users.delete(retrieved.user.id);
    this.colors.push(retrieved.color);
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
