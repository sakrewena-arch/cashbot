// ============================================================
// CASHBOT - Point d'entrée principal
// ============================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { botController } from './controllers/bot.controller';
import { API_CONFIG, PROJECT_INFO } from './config';
import logger from './helpers/logger';
import prisma from './helpers/prisma';

async function main() {
  logger.info(`🚀 Démarrage de ${PROJECT_INFO.name} v${PROJECT_INFO.version}`, {
    environment: PROJECT_INFO.environment,
  });

  try {
    await prisma.$connect();
    logger.info('✅ Base de données connectée');

    await botController.start();

    const app = express();

    app.use(helmet({ contentSecurityPolicy: false }));
    app.use(cors());
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // Servir le dashboard admin (Next.js build)
    const adminPath = path.join(__dirname, '../admin/out');
    app.use(express.static(adminPath));
    
    // Routes API
    app.use('/api', require('./routes/api').default);

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

    // Rediriger toutes les routes admin vers index.html
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
        res.sendFile(path.join(adminPath, 'index.html'));
      }
    });

    // Webhook Telegram
    if (process.env.NODE_ENV === 'production') {
      const webhookPath = `/webhook/${process.env.BOT_TOKEN}`;
      app.post(webhookPath, (req, res) => {
        botController.getBot().handleUpdate(req.body, res);
      });
    }

    app.use((err: any, req: any, res: any, next: any) => {
      logger.error('Erreur serveur', { error: err.message });
      res.status(500).json({ error: 'Erreur interne du serveur' });
    });

    app.listen(API_CONFIG.port, () => {
      logger.info(`✅ Serveur démarré sur le port ${API_CONFIG.port}`);
      logger.info(`🌐 API: ${API_CONFIG.url}/api`);
      logger.info(`🏥 Health: ${API_CONFIG.url}/health`);
      logger.info(`📊 Admin: ${API_CONFIG.url}`);
    });

    require('./jobs/cron');

    process.once('SIGINT', async () => { await shutdown(); });
    process.once('SIGTERM', async () => { await shutdown(); });

    logger.info(`✅ ${PROJECT_INFO.name} est prêt !`);
  } catch (error) {
    logger.error('❌ Erreur fatale', { error });
    await shutdown(1);
  }
}

async function shutdown(exitCode: number = 0) {
  logger.info('Arrêt des services...');
  try {
    await botController.stop();
    await prisma.$disconnect();
  } catch (error) {
    logger.error('Erreur arrêt', { error });
  }
  process.exit(exitCode);
}

process.on('unhandledRejection', (reason: any) => {
  logger.error('Promesse non gérée', { error: reason });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Exception non capturée', { error: error.message });
  shutdown(1);
});

main();