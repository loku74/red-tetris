// global
import { io as ioc } from "socket.io-client";
import { expect } from "vitest";

// intern
import { init } from "../../app";
import { EVENT_JOIN_ROOM } from "@app/shared";
import { getRoom, getRooms } from "../core/room";
import { getUsers } from "../core/user";
import { Room } from "../objects/Room";
import { User } from "../objects/User";

// types
import type { AddressInfo } from "net";
import type { Socket as ClientSocket } from "socket.io-client";
import type { SocketResponse } from "@app/shared";
import type { AppServer, ServerSocket } from "../types/socket";
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

export function emitAsync<S = unknown, E = unknown, P = unknown>(
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

export async function joinRoom(
  test: TestSocket,
  roomName: string,
  username: string
): Promise<Room> {
  await emitAsync(test.client, EVENT_JOIN_ROOM, {
    username: username,
    room: roomName
  });

  const room = getRoom(roomName);

  if (!room) {
    expect.fail("Room isn't defined!");
  }

  return room;
}

export function fakeUser(id: string, name: string): User {
  return new User(id, name, {} as ServerSocket);
}
