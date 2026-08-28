FROM node:24-alpine AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
RUN npm ci --ignore-scripts

FROM dependencies AS builder

WORKDIR /app
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=postgresql://marketlens:marketlens@localhost:5432/marketlens?schema=public
RUN npm run db:generate && npm run build

FROM node:24-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 marketlens && adduser --system --uid 1001 marketlens
COPY --from=builder --chown=marketlens:marketlens /app/apps/web/.next/standalone ./
COPY --from=builder --chown=marketlens:marketlens /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=marketlens:marketlens /app/apps/web/public ./apps/web/public

USER marketlens
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
