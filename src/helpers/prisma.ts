// ============================================================
// CASHBOT - Client Prisma (Singleton)
// ============================================================
// Instance unique du client Prisma pour toute l'application
// ============================================================

import { PrismaClient } from '@prisma/client';

// Empêche plusieurs instances en développement (hot reload)
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;