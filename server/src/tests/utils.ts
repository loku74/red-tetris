import { Server, type Socket as ServerSocket } from "socket.io";
import { io as ioc, type Socket as ClientSocket } from "socket.io-client";
import { expect } from "vitest";
import { init } from "../../app";
import { Room } from "../objects/Room";
import { getRoom, getRooms } from "../core/room";
import { getUsers } from "../core/user";
import type { AddressInfo } from "net";
import type { Callback } from "../types/types";
import type { TestServerData, TestSocket } from "./types";
import { User } from "../objects/User";

export function createClient(address: string, io: Server): Promise<TestSocket> {
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

export function emitAsync(
  socket: ClientSocket | ServerSocket,
  event: string,
  data?: unknown
): Promise<{ success: boolean; data?: unknown }> {
  return new Promise((resolve) => {
    if (data) {
      socket.emit(event, data, ((success: boolean, data?: unknown) => {
        resolve({ success, data });
      }) as Callback);
    } else {
      socket.emit(event, ((success: boolean, data?: unknown) => {
        resolve({ success, data });
      }) as Callback);
    }
  });
}

export function onceAsync(socket: ClientSocket | ServerSocket, event: string): Promise<unknown> {
  return new Promise((resolve) => {
    socket.once(event, (data) => {
      resolve(data);
    });
  });
}

export async function setupTestServer(): Promise<TestServerData> {
  const struct = init();
  const io: Server = struct.io;

  await new Promise<void>((resolve) => {
    struct.server.listen(() => resolve());
  });

  const address = `http://localhost:${(struct.server.address() as AddressInfo).port}`;
  const test1 = await createClient(address, io);

  return {
    io: io,
    address: address,
    test1: test1
  };
}

export async function shutdownTestServer(ctx: TestServerData): Promise<void> {
  await ctx.io.close();
  getRooms().clear();
  getUsers().clear();
}

export async function joinRoom(
  test: TestSocket,
  roomname: string,
  username: string
): Promise<Room> {
  await emitAsync(test.client, "join room", {
    username: username,
    roomName: roomname
  });

  const room = getRoom(roomname);

  if (!room) {
    expect.fail("Room isn't defined!");
  }
  expect(room).toBeInstanceOf(Room);

  return room;
}

export function fakeUser(id: string, name: string): User {
  return new User(id, name, {} as ServerSocket);
}
