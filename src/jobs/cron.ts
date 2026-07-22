// ============================================================
// CASHBOT - Jobs CRON
// ============================================================
// Tâches planifiées exécutées périodiquement
// ============================================================

import cron from 'node-cron';
import prisma from '../helpers/prisma';
import logger from '../helpers/logger';

// ============================================================
// STATISTIQUES JOURNALIÈRES (tous les jours à minuit)
// ============================================================
cron.schedule('0 0 * * *', async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [newUsers, tasksCompleted, withdrawalsRequested] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: yesterday, lt: today } },
      }),
      prisma.taskCompletion.count({
        where: { createdAt: { gte: yesterday, lt: today } },
      }),
      prisma.withdrawal.count({
        where: { createdAt: { gte: yesterday, lt: today } },
      }),
    ]);

    await prisma.dailyStats.create({
      data: {
        date: yesterday,
        newUsers,
        tasksCompleted,
        withdrawalsRequested,
      },
    });

    logger.info('Statistiques journalières mises à jour', {
      date: yesterday.toISOString(),
      newUsers,
      tasksCompleted,
    });
  } catch (error) {
    logger.error('Erreur CRON stats journalières', { error });
  }
});

// ============================================================
// NETTOYAGE DES SESSIONS EXPIRÉES (toutes les heures)
// ============================================================
cron.schedule('0 * * * *', async () => {
  try {
    const result = await prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    if (result.count > 0) {
      logger.info(`Sessions expirées nettoyées: ${result.count}`);
    }
  } catch (error) {
    logger.error('Erreur CRON nettoyage sessions', { error });
  }
});

// ============================================================
// VÉRIFICATION DES TÂCHES EXPIRÉES (toutes les 30 minutes)
// ============================================================
cron.schedule('*/30 * * * *', async () => {
  try {
    const now = new Date();
    const expiredTasks = await prisma.task.updateMany({
      where: {
        endDate: { lt: now },
        status: 'ACTIVE',
      },
      data: { status: 'COMPLETED' },
    });
    if (expiredTasks.count > 0) {
      logger.info(`Tâches expirées désactivées: ${expiredTasks.count}`);
    }
  } catch (error) {
    logger.error('Erreur CRON tâches expirées', { error });
  }
});

// ============================================================
// ACTIVATION DES TÂCHES PLANIFIÉES (toutes les 5 minutes)
// ============================================================
cron.schedule('*/5 * * * *', async () => {
  try {
    const now = new Date();
    const activatedTasks = await prisma.task.updateMany({
      where: {
        startDate: { lte: now },
        status: 'DRAFT',
        endDate: { gt: now },
      },
      data: { status: 'ACTIVE' },
    });
    if (activatedTasks.count > 0) {
      logger.info(`Tâches activées: ${activatedTasks.count}`);
    }
  } catch (error) {
    logger.error('Erreur CRON activation tâches', { error });
  }
});

logger.info('✅ Jobs CRON initialisés');