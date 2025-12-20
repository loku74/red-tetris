import type { Socket } from "socket.io";
import type { Room } from "./Room";

export class User {
  public room: Room | null = null;

  constructor(
    public id: string,
    public name: string,
    public socket: Socket
  ) {}
}

export const users: Map<string, User> = new Map();
