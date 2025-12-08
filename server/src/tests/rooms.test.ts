import { expect, it, beforeEach, afterEach } from "vitest";
import { createServer } from "node:http";
import { type AddressInfo } from "node:net";
import { io as ioc, type Socket as ClientSocket } from "socket.io-client";
import { Server } from "socket.io";
import { registerClientHandlers } from "../events";
import type { Callback } from "../types";
import { Room, rooms } from "../objects/Room";
import { ROOM_MAX_USERS } from "../constants";
import { User } from "../objects/User";

let io: Server, clientSocket: ClientSocket;

// create test socket.io server
// see: https://socket.io/docs/v4/testing/
beforeEach(() => {
  return new Promise<void>((resolve) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      clientSocket = ioc(`http://localhost:${port}`);
      io.on("connection", (socket) => {
        registerClientHandlers(socket);
      });
      clientSocket.on("connect", resolve);
    });
  });
});

afterEach(() => {
  io.close();
  clientSocket.disconnect();
});

it("Invalid scheme", () => {
  return new Promise<void>((resolve) => {
    clientSocket.emit("join room", {}, ((err, response) => {
      expect(response).toEqual({ success: false });
      resolve();
    }) as Callback);
  });
});

it("Room is full", () => {
  const room = new Room("example");
  const users = new Map<string, User>(
    Array.from({ length: ROOM_MAX_USERS }, (_, i) => [
      `example${i + 1}`,
      new User(`example${i + 1}`)
    ])
  );

  room.users = users;
  rooms.set("example", room);

  return new Promise<void>((resolve) => {
    const data = {
      username: "example",
      room: "example"
    };

    clientSocket.emit("join room", data, ((err, response) => {
      expect(response).toEqual({ success: false });

      // this is shared between others tests of this file
      rooms.clear();

      resolve();
    }) as Callback);
  });
});

it("Valid join", () => {
  return new Promise<void>((resolve) => {
    const data = {
      username: "example",
      room: "example"
    };

    clientSocket.emit("join room", data, ((err, response) => {
      expect(response).toEqual({ success: true });
      resolve();
    }) as Callback);
  });
});

it("Get rooms", () => {
  rooms.set("example", new Room("example"));

  return new Promise<void>((resolve) => {
    clientSocket.emit("get rooms", ((err, response) => {
      expect(response).toEqual({
        rooms: [
          {
            name: "example",
            userCount: 0,
            max: ROOM_MAX_USERS
          }
        ]
      });
      resolve();
    }) as Callback);
  });
});
