import { Mutex } from "async-mutex";

import type { PlayerInfo } from "@app/shared";

import { Board } from "./Board";
import type { Game } from "./Game";
import type { Piece } from "./Piece";
import type { User } from "./User";

export class Player {
  public board = new Board();
  public score = 0;
  public alive = true;
  public actualPiece: Piece;
  public mutex = new Mutex();

  constructor(
    public user: User,
    public initPiece: Piece
  ) {
    this.actualPiece = initPiece.clone();
  }

  public checkLost() {
    // the new generated piece does not have valid position = lose
    const piece = this.actualPiece;

    if (!piece.alreadyMoved && !this.board.isValidPiece(piece)) {
      this.alive = false;
    }
    return this.alive;
  }

  public getInfo(): PlayerInfo {
    return {
      name: this.user.name,
      color: this.user.color,
      matrix: this.board.matrix,
      score: this.score,
      alive: this.alive
    };
  }

  public isNextPositionValid(): boolean {
    const next = this.actualPiece.clone().moveDown();

    return this.board.isValidPiece(next);
  }

  public async applyPenality(nb: number) {
    if (this.alive) {
      await this.mutex.runExclusive(() => {
        const diff = this.board.addRestrictedLines(nb);

        for (let i = 0; i < diff; i++) {
          if (this.actualPiece.x === 0) break;
          this.actualPiece.x--;
        }
      });
    }
  }

  public attachCurrentPiece(game: Game) {
    if (this.alive) {
      this.board.place(this.actualPiece);
      this.actualPiece = game.nextPiece(this.board.placedPieces);
      this.score++;
      this.checkLost();
    }
  }
}
