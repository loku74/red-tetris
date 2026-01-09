// intern
import { EVENT_WARM_UP } from "../constants/events";
import { validateWarmUp } from "../validate/warmUp";

// types
import type { Socket } from "socket.io";
import type { Callback } from "../types/types";

export function registerHandlers(socket: Socket) {
  socket.on(EVENT_WARM_UP, (callback: Callback) => {
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
