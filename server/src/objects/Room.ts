import { PieceColor, type RoomData, type UserColor } from "@app/shared";

import { ROOM_MAX_USERS } from "@app/constants/core";
import { getRooms } from "@app/core/room";
import { deleteUser } from "@app/core/user";

import { logger } from "../utils/log";
import { Game } from "./Game";
import type { User } from "./User";

export class Room {
  public users: Map<string, User> = new Map();
  public colors: Array<UserColor> = [
    PieceColor.RED,
    PieceColor.BLUE,
    PieceColor.GREEN,
    PieceColor.YELLOW,
    PieceColor.PURPLE,
    PieceColor.ORANGE,
    PieceColor.CYAN,
    PieceColor.GREY
  ];
  public game: Game | null = null;

  constructor(
    public name: string,
    public host: User
  ) {
    const userColor = this.add(host);
    host.color = userColor;
  }

  public userExists(user: User) {
    return this.users.has(user.id);
  }

  private getColor(): UserColor {
    const color = this.colors.shift();

    // should never be empty because max player is checked
    if (color === undefined) throw new Error("No more colors available");

    return color;
  }

  public setNextHost() {
    const next = this.users.entries().next();

    if (next.value) {
      this.host = next.value[1];
    }
  }

  public add(user: User) {
    if (this.userExists(user)) throw new Error("User already exists");
    else if (this.users.size >= ROOM_MAX_USERS) throw new Error("Room is full");

    const color = this.getColor();
    user.color = color;

    this.users.set(user.id, user);

    return color;
  }

  public remove(user: User | undefined): RoomData {
    if (!user) return this.asInfo();

    const retrieved = this.users.get(user.id);
    if (!retrieved) throw new Error("User not found");

    this.users.delete(retrieved.id);
    this.colors.push(retrieved.color);

    // deletion of empty room
    if (this.users.size == 0) {
      getRooms().delete(this.name);
      logger.info(`Room ${this.name} deleted`);
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
    return this.users.values().find((u) => u.name === username);
  }

  public asInfo(): RoomData {
    return {
      name: this.name,
      players: [...this.users.values().map((u) => ({ color: u.color, username: u.name }))],
      userCount: this.users.size,
      max: ROOM_MAX_USERS,
      host: this.host.name,
      playing: this.game ? true : false
    };
  }

  public start() {
    this.game = new Game(this.users);
  }
}
