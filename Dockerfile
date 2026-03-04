FROM node:25-alpine3.22

RUN apk add --no-cache curl bash
RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.3.10"

ENV BUN_INSTALL="/root/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"

WORKDIR  /app
COPY . .

ARG PUBLIC_SERVER_ADDRESS
ARG PUBLIC_SERVER_PORT
ENV PUBLIC_SERVER_ADDRESS=${PUBLIC_SERVER_ADDRESS}
ENV PUBLIC_SERVER_PORT=${PUBLIC_SERVER_PORT}

RUN bun install --no-cache
RUN npm run build

CMD ["npm", "run", "prod"]
