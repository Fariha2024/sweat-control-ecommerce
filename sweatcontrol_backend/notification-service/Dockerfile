@'
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:20-alpine

RUN apk add --no-cache tini curl

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

RUN mkdir -p logs && chown -R nodejs:nodejs logs

USER nodejs

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3006/health || exit 1

EXPOSE 3006

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "src/server.js"]
'@ | Out-File -FilePath Dockerfile -Encoding utf8