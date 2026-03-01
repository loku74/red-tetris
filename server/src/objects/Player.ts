import type { PieceColor, PlayerInfo } from "@app/shared";

import { Board } from "./Board";
import type { Game } from "./Game";
import type { Piece } from "./Piece";
import type { User } from "./User";

export class Player {
  public board = new Board();
  public score = 0;
  public alive = true;
  public actualPiece: Piece;

  constructor(
    public user: User,
    public color: PieceColor,
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
  }

  public getInfo(): PlayerInfo {
    return {
      matrix: this.board.matrix,
      score: this.score,
      alive: this.alive,
      color: this.color
    };
  }

  public isNextPositionValid(): boolean {
    const next = this.actualPiece.clone().moveDown();

    return this.board.isValidPiece(next);
  }

  public applyPenality(nb: number) {
    if (this.alive) {
      this.board.addRestrictedLines(nb);
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
