# Multi-stage Production Dockerfile for Nexus360
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copy application source
COPY tsconfig.json ./
COPY src ./src
COPY nexus360.html ./
COPY index.html ./
COPY assets ./assets

# Generate Prisma Client & Compile TypeScript
RUN npx prisma generate
RUN npm run build

# Production Runtime Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Install runtime production dependencies only
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production
RUN npx prisma generate

# Copy compiled code and assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/nexus360.html ./nexus360.html
COPY --from=builder /app/index.html ./index.html
COPY --from=builder /app/assets ./assets
COPY --from=builder /app/prisma/dev.db ./prisma/dev.db

# Expose server port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start Server
CMD ["node", "dist/server.js"]
