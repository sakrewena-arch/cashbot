FROM node:20-slim AS admin-builder
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app/admin
COPY admin/package.json admin/package-lock.json ./
RUN npm ci
COPY admin/ .
RUN npm run build

FROM node:20-slim AS builder
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY . .
COPY --from=admin-builder /app/admin/out ./admin/out
RUN npx prisma generate && npx tsc

FROM node:20-slim
RUN apt-get update -y && apt-get install -y openssl ca-certificates
ENV NODE_ENV=production
ENV PORT=3001
WORKDIR /app
RUN mkdir -p logs uploads
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
COPY --from=builder /app/admin/out ./admin/out
EXPOSE 3001
CMD npx prisma db push --skip-generate 2>/dev/null; node dist/index.js