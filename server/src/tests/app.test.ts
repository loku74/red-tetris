import { type AddressInfo } from "node:net";
import { io as ioc } from "socket.io-client";
import { expect, it } from "vitest";
import { init } from "../../app";

const TEST_PORT = 8765;

it("Test default app", async () => {
  const struct = init();

  await new Promise<void>((resolve) => {
    struct.server.listen(TEST_PORT, resolve);
  });

  const port = (struct.server.address() as AddressInfo).port;
  const client = ioc(`http://localhost:${port}`);

  await new Promise<void>((resolve) => {
    client.on("connect", () => resolve());
  });

  expect(struct.io.engine.clientsCount).toBe(1);

  client.close();
  struct.server.close();
});
