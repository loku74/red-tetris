import { Mutex } from "async-mutex";

import { PieceShape, type PlayerInfo } from "@app/shared";

import { SCORE_PIECE } from "@app/constants/core";
import { logger } from "@app/utils/log";

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

  public async applyPenality(game: Game, nb: number) {
    return await this.mutex.runExclusive(() => {
      logger.debug(`PENALITY user: ${this.user.name} acquire`);
      if (this.alive) {
        const diff = this.board.addRestrictedLines(nb);

        for (let i = 0; i < diff; i++) {
          if ((this.actualPiece.type === PieceShape.I || this.actualPiece.type === PieceShape.O) && this.actualPiece.x === 0) break;
          if (this.actualPiece.x === 1) break;
          this.actualPiece.x--;
        }
      }

      logger.debug(`piece x ${this.actualPiece.x}`);
      const data = game.getGameInfo(this.user.id)
      logger.debug(`PENALITY user: ${this.user.name} release`);
      return data;
    });
  }

  public attachCurrentPiece(game: Game) {
    if (this.alive) {
      this.board.place(this.actualPiece);
      this.actualPiece = game.nextPiece(this.board.placedPieces);
      this.score += SCORE_PIECE;
      this.checkLost();
    }
  }
}
