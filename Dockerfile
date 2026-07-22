# ============================================================
# CASHBOT - Dockerfile
# ============================================================
# Construction multi-stage pour une image de production optimisée
# ============================================================

# ---------- ÉTAPE 1 : Installation des dépendances ----------
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# ---------- ÉTAPE 2 : Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# ---------- ÉTAPE 3 : Image finale ----------
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl ca-certificates tzdata

ENV NODE_ENV=production
ENV TZ=Europe/Paris

WORKDIR /app

# Création des dossiers nécessaires
RUN mkdir -p logs uploads

# Copie des fichiers depuis le builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

# Copie des scripts
COPY --from=builder /app/ecosystem.config.js ./

# Exposition des ports
EXPOSE 3001

# Santé du conteneur
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node dist/healthcheck.js || exit 1

# Commande de démarrage
CMD ["node", "dist/index.js"]