import type { Socket } from "socket.io";

export class User {
  public color: string = "";
  public warmUp: boolean = false;

  constructor(
    public id: string,
    public name: string,
    public socket: Socket
  ) {}
}
