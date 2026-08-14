FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/contracts/package.json packages/contracts/package.json

RUN npm ci

COPY . .

ARG SITE_URL=https://liyaro.ru
ARG PUBLIC_API_URL=https://liyaro.ru
ENV SITE_URL=${SITE_URL}
ENV PUBLIC_API_URL=${PUBLIC_API_URL}

RUN npx prisma generate --schema apps/backend/prisma/schema.prisma && npm run build

FROM build AS backend

ENV NODE_ENV=production
EXPOSE 3000

CMD ["sh", "-c", "npm run prisma:migrate:deploy && npm start --workspace @liyaro/backend"]

FROM caddy:2.10-alpine AS web

COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/apps/frontend/dist /srv

EXPOSE 80 443 443/udp
