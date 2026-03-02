import { type GameSettings, PieceColor, type UserColor } from "@app/shared";

import { WARMUP_CHECK_DELAY } from "@app/constants/core";
import type { ServerSocket } from "@app/types/socket";
import { sleep } from "@app/utils/sleep";

import { Game } from "./Game";

export class User {
  public color: UserColor = PieceColor.CYAN;
  public warmUp: Game | null = null;

  constructor(
    public id: string,
    public name: string,
    public socket: ServerSocket
  ) {}

  public async setWarmUp(settings: GameSettings) {
    if (this.warmUp) {
      this.warmUp.ongoing = false;

      while (this.warmUp != null) {
        await sleep(WARMUP_CHECK_DELAY);
      }
    }

    this.warmUp = new Game(new Map([[this.id, this]]), settings);
  }
}
