import type { GameData, PlayerInfo } from "@app/shared";

import { placePieceOnMatrix } from "@app/core/matrix";
import { createBagOfPieces } from "@app/core/piece";

import type { Piece } from "./Piece";
import { Player } from "./Player";
import type { User } from "./User";

export class Game {
  public players: Map<string, Player> = new Map();
  public pieces: Array<Piece> = [];
  public ongoing: boolean = false;

  constructor(users: Map<string, User>) {
    const initPiece = this.nextPiece(0);

    users.forEach((user, id) => {
      this.players.set(id, new Player(user, user.color, initPiece));
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

  public checkFinished() {
    const offset = this.players.size === 1 ? 0 : 1;

    if (this.getDeadPlayers().length + offset >= this.players.size) {
      this.ongoing = false;
    }
  }

  public nextPiece(i: number): Piece {
    if (this.pieces.length < i) throw new Error("Too high index!");
    const piece = this.pieces.at(i);

    if (!piece) {
      createBagOfPieces().forEach((p) => {
        this.pieces.push(p);
      });
      return this.nextPiece(i);
    } else {
      return piece.clone();
    }
  }

  public getGameInfo(id: string): GameData {
    const player = this.getPlayer(id);

    // + 1 for the actual piece
    const nextPieces = Array.from({ length: 3 }, (_, i) =>
      this.nextPiece(i + 1 + player.board.placedPieces).asData()
    );

    const copy = structuredClone(player.board.matrix);
    if (player.alive) {
      placePieceOnMatrix(player.actualPiece, copy);
    }

    const pieceCopy = player.actualPiece.clone();
    while (player.board.isValidPiece(pieceCopy)) {
      pieceCopy.moveDown();
    }
    pieceCopy.x -= 1;

    return {
      matrix: copy,
      nextPieces: nextPieces,
      shadowPiece: pieceCopy.asSpectrum(),
      score: player.score,
      alive: player.alive
    };
  }

  public getGameSpectrums(id: string): PlayerInfo[] {
    const currentPlayer = this.getPlayer(id);

    const players = this.players.values().filter((p) => currentPlayer !== p);

    return players.map((p) => p.getInfo()).toArray();
  }
}
