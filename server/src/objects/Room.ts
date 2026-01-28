import { ROOM_MAX_USERS, WARMUP_RESTART_DELAY } from "../constants/core";
import { getRooms } from "../core/room";
import { deleteUser } from "../core/user";

import type { RoomData, UserColor } from "@app/shared";
import { Game } from "./Game";
import type { User } from "./User";

export class Room {
  public playing: boolean = false;
  public users: Map<string, { color: UserColor; user: User }> = new Map();
  public colors: Array<UserColor> = [
    "cyan",
    "red",
    "green",
    "blue",
    "yellow",
    "orange",
    "purple",
    "grey"
  ];
  public game: Game | null = null;

  constructor(
    public name: string,
    public host: User
  ) {
    const userColor = this.add(host);
    host.color = userColor;
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

  public add(user: User) {
    if (this.exist(user)) throw new Error("User already exists");
    else if (this.users.size >= ROOM_MAX_USERS) throw new Error("Room is full");

    const color = this.getColor();
    this.users.set(user.id, { color, user });

    return color;
  }

  public remove(user: User | undefined): RoomData {
    if (!user) return this.asInfo();

    const retrieved = this.users.get(user.id);
    if (!retrieved) throw new Error("User not found");

    this.users.delete(retrieved.user.id);
    this.colors.push(retrieved.color);

    console.log(`User ${user.name} left room ${user.name}`);
    // deletion of empty room
    if (this.users.size == 0) {
      getRooms().delete(this.name);
      console.log(`room ${this.name} deleted`);
    } else {
      if (user === this.host) {
        this.setNextHost();
      }
    }

    // an user cannot exist outside of a room
    deleteUser(user.socket.id);
    return this.asInfo();
  }

  // there are no duplicates usernames in a room
  public get(username: string): User | undefined {
    const found = [...this.users.values()].find((u) => u.user.name === username);
    return found?.user;
  }

  public asInfo(): RoomData {
    return {
      name: this.name,
      players: [...this.users.values()].map((u) => ({ color: u.color, username: u.user.name })),
      userCount: this.users.size,
      max: ROOM_MAX_USERS,
      host: this.host.name,
      playing: this.playing,
      warmUpRestartDelay: WARMUP_RESTART_DELAY * 1_000
    };
  }

  public start() {
    this.playing = true;
    this.game = new Game(this.users);
  }

  public finish() {
    this.playing = false;
    this.game = null;
  }
}
