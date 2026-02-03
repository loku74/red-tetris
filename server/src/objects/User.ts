import { WARMUP_RESTART_DELAY } from "../constants/core";
import type { UserColor } from "@app/shared";
import type { ServerSocket } from "../types/socket";

export class User {
  public color: UserColor = "cyan";
  public warmUp: boolean = false;
  public lastWarmUp: Date | null = null;

  constructor(
    public id: string,
    public name: string,
    public socket: ServerSocket
  ) {}

  public setWarmUp(): void {
    this.warmUp = true;
    this.lastWarmUp = new Date();
  }

  public canWarmUp(): boolean {
    if (!this.lastWarmUp) return true;

    const now = new Date();
    const timeSinceLastWarmUp = now.getTime() - this.lastWarmUp.getTime();
    return timeSinceLastWarmUp > WARMUP_RESTART_DELAY * 1_000;
  }
}
