// types
import type { ServerSocket } from "../types/socket";

// intern
import { Game } from "./Game";
import { Colors } from "@app/shared";

// const
import { WARMUP_RESTART_DELAY } from "../constants/core";

export class User {
  public color: Colors = Colors.CYAN;
  public warmUp: Game | null = null;
  public lastWarmUp: Date | null = null;

  constructor(
    public id: string,
    public name: string,
    public socket: ServerSocket
  ) {}

  public setWarmUp(): void {
    if (this.warmUp) {
      this.warmUp.ongoing = false;
    }

    this.warmUp = new Game(new Map([[this.id, { color: this.color, user: this }]]));
    this.lastWarmUp = new Date();
  }

  public canWarmUp(): boolean {
    if (!this.lastWarmUp) return true;

    const now = new Date();
    const timeSinceLastWarmUp = now.getTime() - this.lastWarmUp.getTime();
    return timeSinceLastWarmUp > WARMUP_RESTART_DELAY * 1_000;
  }
}
