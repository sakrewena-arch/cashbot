# ============================================================
# CASHBOT - Dockerfile
# ============================================================

# ---------- ADMIN BUILD ----------
FROM node:20-alpine AS admin-builder
RUN apk add --no-cache libc6-compat
WORKDIR /app/admin
COPY admin/package.json admin/package-lock.json ./
RUN npm ci
COPY admin/ .
RUN npm run build

# ---------- BOT DEPENDENCIES ----------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# ---------- BOT BUILD ----------
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY --from=admin-builder /app/admin/out ./admin/out
RUN npx prisma generate && npx tsc

# ---------- FINAL IMAGE ----------
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl ca-certificates tzdata
ENV NODE_ENV=production
ENV TZ=Europe/Paris
WORKDIR /app
RUN mkdir -p logs uploads
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
COPY --from=builder /app/admin/out ./admin/out
EXPOSE 3001
CMD ["node", "dist/index.js"]