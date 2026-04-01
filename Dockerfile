ARG NODE_VERSION=23
ARG APP_VERSION=dev

FROM node:${NODE_VERSION}-slim

ARG APP_VERSION=dev

RUN apt-get update && apt-get install -y ca-certificates curl jq

RUN npm install -g pnpm

WORKDIR /src

ENV APP_VERSION=$APP_VERSION
ENV NEXT_PUBLIC_APP_VERSION=$APP_VERSION

COPY . .
RUN pnpm install
RUN pnpm run build

RUN chmod +x ./entrypoint.sh

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3000
ENV OTEL_LOG_LEVEL=info

EXPOSE $PORT

HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=10s \
  CMD curl -f http://localhost:$PORT/ || exit 1

ENTRYPOINT ./entrypoint.sh
