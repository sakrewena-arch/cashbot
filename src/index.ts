// ============================================================
// CASHBOT - Point d'entrée principal
// ============================================================
// Démarre le bot Telegram et le serveur API REST
// ============================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { botController } from './controllers/bot.controller';
import { API_CONFIG, PROJECT_INFO } from './config';
import logger from './helpers/logger';
import prisma from './helpers/prisma';

// ============================================================
// INITIALISATION
// ============================================================

async function main() {
  logger.info(`🚀 Démarrage de ${PROJECT_INFO.name} v${PROJECT_INFO.version}`, {
    environment: PROJECT_INFO.environment,
  });

  try {
    // 1. Connexion à la base de données
    await prisma.$connect();
    logger.info('✅ Base de données connectée');

    // 2. Démarrage du bot Telegram
    await botController.start();

    // 3. Configuration du serveur API
    const app = express();

    // Middlewares
    app.use(helmet());
    app.use(cors());
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // Health check
    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        name: PROJECT_INFO.name,
        version: PROJECT_INFO.version,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    });

    // Routes API
    app.use('/api', require('./routes/api').default);

    // Webhook Telegram (si mode webhook)
    if (process.env.NODE_ENV === 'production') {
      const webhookPath = `/webhook/${process.env.BOT_TOKEN}`;
      app.post(webhookPath, (req, res) => {
        botController.getBot().handleUpdate(req.body, res);
      });
      logger.info('Webhook Telegram configuré', { path: webhookPath });
    }

    // Gestion des erreurs
    app.use((err: any, req: any, res: any, next: any) => {
      logger.error('Erreur serveur', { error: err.message, stack: err.stack });
      res.status(500).json({
        error: 'Erreur interne du serveur',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    });

    // Démarrage du serveur
    app.listen(API_CONFIG.port, () => {
      logger.info(`✅ Serveur API démarré sur le port ${API_CONFIG.port}`);
      logger.info(`🌐 API disponible sur ${API_CONFIG.url}`);
      logger.info(`🏥 Health check: ${API_CONFIG.url}/health`);
    });

    // 4. Démarrage des jobs CRON
    require('./jobs/cron');

    // 5. Gestion des signaux d'arrêt
    process.once('SIGINT', async () => {
      logger.info('🛑 Signal SIGINT reçu. Arrêt en cours...');
      await shutdown();
    });

    process.once('SIGTERM', async () => {
      logger.info('🛑 Signal SIGTERM reçu. Arrêt en cours...');
      await shutdown();
    });

    logger.info(`✅ ${PROJECT_INFO.name} est prêt !`);
  } catch (error) {
    logger.error('❌ Erreur fatale lors du démarrage', { error });
    await shutdown(1);
  }
}

// ============================================================
// ARRÊT PROPRE
// ============================================================

async function shutdown(exitCode: number = 0) {
  logger.info('Arrêt des services...');

  try {
    await botController.stop();
    await prisma.$disconnect();
    logger.info('Services arrêtés proprement');
  } catch (error) {
    logger.error('Erreur lors de l\'arrêt', { error });
  }

  process.exit(exitCode);
}

// ============================================================
// GESTION DES ERREURS NON CAPTURÉES
// ============================================================

process.on('unhandledRejection', (reason: any) => {
  logger.error('Promesse non gérée', { error: reason });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Exception non capturée', { error: error.message, stack: error.stack });
  shutdown(1);
});

// ============================================================
// DÉMARRAGE
// ============================================================

main();