ARG BUN_VERSION=1.3.13

FROM oven/bun:${BUN_VERSION} AS builder

WORKDIR /app

COPY package.json bun.lock ./
COPY client/package.json client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/

RUN bun install --frozen-lockfile

COPY . .
RUN bun run build


FROM oven/bun:${BUN_VERSION} AS runner

WORKDIR /app

COPY --from=builder /app/client/build sveltekit-build
COPY --from=builder /app/server/app.js app.js

EXPOSE 3000

CMD ["bun", "app.js"]
