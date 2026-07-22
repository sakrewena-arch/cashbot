// ============================================================
// CASHBOT - Health Check pour Docker
// ============================================================

import prisma from './helpers/prisma';

async function healthcheck() {
  try {
    // Vérifie la connexion à la base de données
    await prisma.$queryRaw`SELECT 1`;
    
    // Vérifie que le serveur répond
    const response = await fetch(`http://localhost:${process.env.API_PORT || 3001}/health`);
    
    if (!response.ok) {
      process.exit(1);
    }

    console.log('✅ Health check réussi');
    process.exit(0);
  } catch (error) {
    console.error('❌ Health check échoué:', error);
    process.exit(1);
  }
}

healthcheck();