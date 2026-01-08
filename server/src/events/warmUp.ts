import type { Socket } from "socket.io";
import { validateWarmUp } from "../validate/warmUp";
import type { Callback } from "../types/types";

export function registerHandlers(socket: Socket) {
  socket.on("warm-up", (callback: Callback) => {
    const result = validateWarmUp(socket);
    if (!result.status) {
      callback(result.status, result.error);
      return;
    }

    result.current.setWarmUp();

    console.log(`user ${result.current.name} started warm-up`);

    callback(true);
  });
}
