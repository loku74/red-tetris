import type { SocketUserColor } from "../types/types";
import { Board } from "./Board";
import type { Piece } from "./Piece";
import type { User } from "./User";

export class Player {
  public board = new Board();
  public score = 0;
  public end = false;
  public actualPiece: Piece;

  constructor(
    public user: User,
    public color: SocketUserColor,
    public initPiece: Piece
  ) {
    this.actualPiece = initPiece.clone();
  }

  public hasLost(): boolean {
    // the new generated piece does not have valid position = lose
    const piece = this.actualPiece;
    return !piece.alreadyMoved && !this.board.isValidPiece(piece);
  }
}
