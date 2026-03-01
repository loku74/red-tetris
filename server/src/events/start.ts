import { EVENT_GAME_START } from "@app/shared";

import { WARMUP_CHECK_DELAY } from "@app/constants/core";
import { gameLoop } from "@app/core/runners";
import type { AppServer, ServerSocket } from "@app/types/socket";
import { sleep } from "@app/utils/sleep";
import { validateStart } from "@app/validate/start";

export function registerHandlers(io: AppServer, socket: ServerSocket) {
  socket.on(EVENT_GAME_START, async (payload, callback) => {
    const result = validateStart(socket, payload);
    if (!result.status) {
      callback({ success: false });
      return;
    }

    const room = result.room;
    room.start();

    await Promise.all(
      room.users.values().map(async (user) => {
        while (user.warmUp != null) {
          if (user.warmUp.ongoing) {
            user.warmUp.ongoing = false;
          }
          await sleep(WARMUP_CHECK_DELAY);
        }
      })
    );

    io.to(result.room.name).emit(EVENT_GAME_START);
    gameLoop(io, room, result.GameSettings);
    callback({ success: true });
  });
}
