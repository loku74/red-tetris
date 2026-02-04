// type
import type { PlayerInfo, Colors } from "@app/shared";
import type { Piece } from "./Piece";
import type { User } from "./User";

// intern
import { Board } from "./Board";

export class Player {
  public board = new Board();
  public score = 0;
  public alive = true;
  public actualPiece: Piece;

  constructor(
    public user: User,
    public color: Colors,
    public initPiece: Piece
  ) {
    this.actualPiece = initPiece.clone();
  }

  public hasLost(): boolean {
    // the new generated piece does not have valid position = lose
    const piece = this.actualPiece;
    return !piece.alreadyMoved && !this.board.isValidPiece(piece);
  }

  public getInfo(): PlayerInfo {
    return {
      matrix: this.board.matrix,
      score: this.score,
      alive: this.alive,
      color: this.color
    };
  }
}
