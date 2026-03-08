FROM oven/bun:1.3.10

WORKDIR  /app
COPY . .

ARG SERVER_PORT
ENV SERVER_PORT=${SERVER_PORT}

RUN bun install
RUN bun run build

CMD ["bun", "run", "prod"]
