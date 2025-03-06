FROM hub.aiursoft.cn/oven/bun:slim as bun

WORKDIR /app

COPY ./package.json ./package.json
COPY ./bun.lock ./bun.lock

RUN bun i

COPY . .

RUN bun run build

FROM hub.aiursoft.cn/nginx:alpine as final

COPY --from=bun /app/dist/ /usr/share/nginx/html/