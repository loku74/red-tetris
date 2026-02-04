import type { Piece } from "./Piece";
import type { User } from "./User";
import { createPiece } from "../core/piece";
import type { GameData, GameSpectrum, Matrix2D, UserColor } from "@app/shared";
import { Player } from "./Player";

export class Game {
  public players: Map<string, Player> = new Map();
  public pieces: Array<Piece> = [];
  public ongoing: boolean = false;

  constructor(users: Map<string, { color: UserColor; user: User }>) {
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

  public getDeadPlayers(): Player[] {
    return [...this.players.values()].filter((p) => !p.alive);
  }

  public isFinish(): boolean {
    return this.getDeadPlayers().length === this.players.size || !this.ongoing;
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

  public getGameInfo(id: string): GameData {
    const player = this.getPlayer(id);

    // + 1 for the actual piece
    const nextPieces = Array.from({ length: 3 }, (_, i) =>
      this.nextPiece(i + 1 + player.board.placedPieces).asData()
    );

    return {
      matrix: player.board.matrix,
      nextPieces: nextPieces,
      actualPiece: player.actualPiece,
      score: player.score,
      alive: player.alive
    };
  }

  public getGameSpectrum(id: string): GameSpectrum {
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
      username: player.user.name,
      alive: player.alive
    };
  }
}
