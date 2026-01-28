import type { Piece } from "./Piece";
import type { User } from "./User";
import { createPiece } from "../core/piece";
import type {
  Matrix2D,
  SocketGameInfoData,
  SocketGameSpectrumData,
  SocketUserColor
} from "../types/types";
import { Player } from "./Player";

export class Game {
  public players: Map<string, Player> = new Map();
  public pieces: Array<Piece> = [];
  public deadPlayers: number = 0;
  public started: boolean = false;

  constructor(users: Map<string, { color: SocketUserColor; user: User }>) {
    const initPiece = this.nextPiece(0);

    users.forEach((data, id) => {
      this.players.set(id, new Player(data.user, data.color, initPiece));
    });
  }

  public getPlayer(id: string): Player {
    const state = this.players.get(id);
    if (!state) throw new Error("User not existing!");

    return state;
  }

  public isFinish(): boolean {
    return this.deadPlayers === this.players.size;
  }

  public nextPiece(i: number): Piece {
    if (this.pieces.length < i) throw new Error("Too high index!");

    let piece = this.pieces.at(i);

    if (!piece) {
      piece = createPiece();
      this.pieces.push(piece);
    }
    return piece;
  }

  public getGameInfo(id: string): SocketGameInfoData {
    const player = this.getPlayer(id);

    // + 1 for the actual piece
    const nextPieces = Array.from({ length: 3 }, (_, i) =>
      this.nextPiece(i + 1 + player.board.placedPieces)
    );

    return {
      matrix: player.board.matrix,
      nextPieces: nextPieces,
      actualPiece: player.actualPiece,
      score: player.score,
      end: player.end
    };
  }

  public getGameSpectrum(id: string): SocketGameSpectrumData {
    const player = this.getPlayer(id);

    // simplified matrix as in the subject
    const columnsToChange = new Set<number>();
    const simplifiedMatrix = player.board.matrix.map((row) => {
      return row.map((cell, i) => {
        if (cell === 1 && !columnsToChange.has(i)) {
          columnsToChange.add(i);
        }
        if (cell === 0 && columnsToChange.has(i)) {
          return 1;
        }
        return cell;
      });
    }) as Matrix2D<number>;

    return {
      matrix: simplifiedMatrix,
      score: player.score,
      end: player.end,
      username: player.user.name
    };
  }
}
