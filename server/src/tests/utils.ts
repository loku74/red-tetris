import type { AddressInfo } from "net";
import type { Socket as ClientSocket } from "socket.io-client";
import { io as ioc } from "socket.io-client";
import { expect } from "vitest";

import type {
  EventJoinRoomError,
  EventJoinRoomPayload,
  EventJoinRoomSuccess,
  EventStartError,
  EventStartPayload,
  EventStartSuccess,
  EventWarmUpError,
  EventWarmUpPayload,
  EventWarmUpSuccess,
  GameSettings,
  SocketResponse
} from "@app/shared";
import { EVENT_GAME_START, EVENT_JOIN_ROOM, EVENT_WARMUP_START } from "@app/shared";

import { getRoom, getRoomBySocket, getRooms } from "@app/core/room";
import { getUser, getUsers } from "@app/core/user";
import type { Game } from "@app/objects/Game";
import type { Player } from "@app/objects/Player";
import { Room } from "@app/objects/Room";
import { User } from "@app/objects/User";
import type { AppServer, ServerSocket } from "@app/types/socket";

import { init } from "../../app";
import type { TestServerData, TestSocket } from "./types";

export function createClient(address: string, io: AppServer): Promise<TestSocket> {
  return new Promise((resolve) => {
    const client = ioc(address);
    let server: ServerSocket;

    io.once("connection", (socket: ServerSocket) => {
      server = socket;
    });
    client.once("connect", () => {
      resolve({ client, server });
    });
  });
}

export function emitAsync<P = unknown, S = unknown, E = unknown>(
  socket: ClientSocket,
  event: string,
  data?: P
): Promise<SocketResponse<S, E>> {
  return new Promise((resolve) => {
    if (data) {
      socket.emit(event, data, (response: SocketResponse<S, E>) => {
        resolve(response);
      });
    } else {
      socket.emit(event, (response: SocketResponse<S, E>) => {
        resolve(response);
      });
    }
  });
}

export function onceAsync<T = unknown>(socket: ClientSocket, event: string): Promise<T> {
  return new Promise((resolve) => {
    socket.once(event, (data: T) => {
      resolve(data);
    });
  });
}

export async function setupTestServer(): Promise<TestServerData> {
  const struct = init();
  const io = struct.io;

  await new Promise<void>((resolve) => {
    struct.server.listen(() => resolve());
  });

  const address = `http://localhost:${(struct.server.address() as AddressInfo).port}`;
  const test1 = await createClient(address, io);

  return {
    io,
    address,
    test1
  };
}

export async function shutdownTestServer(ctx: TestServerData): Promise<void> {
  await ctx.io.close();
  getRooms().clear();
  getUsers().clear();
}

export async function testJoinRoom(
  test: TestSocket,
  roomName: string,
  username: string
): Promise<{ room: Room; user: User }> {
  await emitAsync<EventJoinRoomPayload, EventJoinRoomSuccess, EventJoinRoomError>(
    test.client,
    EVENT_JOIN_ROOM,
    {
      username: username,
      room: roomName
    }
  );

  const room = getRoom(roomName);
  if (!room) {
    expect.fail("Room not defined!");
  }
  const user = room.get(username);
  if (!user) {
    expect.fail("User not defined!");
  }

  return { room: room, user: user };
}

export async function testStartWarmup(test: TestSocket): Promise<{ game: Game; player: Player }> {
  const GameSettings: GameSettings = {
    tick: 300
  };
  const user = getUser(test.server.id);

  if (!user) {
    expect.fail("User not defined!");
  }
  await emitAsync<EventWarmUpPayload, EventWarmUpSuccess, EventWarmUpError>(
    test.client,
    EVENT_WARMUP_START,
    GameSettings
  ).then(({ success }) => {
    expect(success).toBe(true);
  });

  const game = user.warmUp;
  if (!game) {
    expect.fail("Warmup not defined!");
  }
  return { game: game, player: game.getPlayer(test.server.id) };
}

export async function testStartGame(test: TestSocket): Promise<{ game: Game; player: Player }> {
  const GameSettings: GameSettings = {
    tick: 300
  };
  const room = getRoomBySocket(test.server);

  if (!room) {
    expect.fail("Room not defined!");
  }
  await emitAsync<EventStartPayload, EventStartSuccess, EventStartError>(
    test.client,
    EVENT_GAME_START,
    GameSettings
  ).then(({ success }) => {
    expect(success).toBe(true);
  });

  const game = room.game;
  if (!game) {
    expect.fail("Game not defined!");
  }
  return { game: game, player: game.getPlayer(test.server.id) };
}

export function fakeUser(id: string, name: string): User {
  return new User(id, name, {} as ServerSocket);
}
