// ============================================================
// CASHBOT - Service de Transactions
// ============================================================

import prisma from '../helpers/prisma';
import logger from '../helpers/logger';
import { BOT_CONSTANTS } from '../config';

export class TransactionService {
  /**
   * Crédite le bonus quotidien
   */
  async creditDailyBonus(userId: string): Promise<{ amount: number; streak: number }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Utilisateur non trouvé');

    // Vérifier le délai
    if (user.lastDailyBonus) {
      const hoursSince = (Date.now() - user.lastDailyBonus.getTime()) / (1000 * 60 * 60);
      if (hoursSince < BOT_CONSTANTS.DAILY_BONUS_COOLDOWN) {
        const nextBonus = new Date(user.lastDailyBonus.getTime() + BOT_CONSTANTS.DAILY_BONUS_COOLDOWN * 60 * 60 * 1000);
        throw new Error(`Prochain bonus disponible le ${nextBonus.toLocaleDateString('fr-FR')} à ${nextBonus.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`);
      }
    }

    const streak = (user.bonusStreak || 0) + 1;
    const amount = parseFloat((0.10 + (streak * 0.05)).toFixed(2));
    const newBalance = parseFloat((user.balance + amount).toFixed(2));

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { balance: newBalance, totalEarned: { increment: amount }, lastDailyBonus: new Date(), bonusStreak: streak },
      }),
      prisma.transaction.create({
        data: {
          userId, type: 'BONUS_DAILY', amount,
          balanceBefore: user.balance, balanceAfter: newBalance,
          description: `Bonus quotidien jour ${streak}`, status: 'COMPLETED',
        },
      }),
    ]);

    return { amount, streak };
  }

  /**
   * Crédite une récompense de tâche
   */
  async creditTaskReward(userId: string, taskId: string, amount: number): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Utilisateur non trouvé');
    const newBalance = parseFloat((user.balance + amount).toFixed(2));

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { balance: newBalance, totalEarned: { increment: amount } },
      }),
      prisma.transaction.create({
        data: {
          userId, type: 'TASK_REWARD', amount,
          balanceBefore: user.balance, balanceAfter: newBalance,
          description: 'Récompense de tâche', reference: taskId, status: 'COMPLETED',
        },
      }),
    ]);
  }

  /**
   * Crée une demande de retrait
   */
  async createWithdrawal(userId: string, amount: number, method: string, accountDetails: any): Promise<any> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Utilisateur non trouvé');
    if (amount < BOT_CONSTANTS.MIN_WITHDRAWAL_AMOUNT) throw new Error(`Montant minimum: ${BOT_CONSTANTS.MIN_WITHDRAWAL_AMOUNT} €`);
    if (amount > user.balance) throw new Error('Solde insuffisant');

    const fee = parseFloat((amount * (BOT_CONSTANTS.WITHDRAWAL_FEE_PERCENT / 100)).toFixed(2));
    const netAmount = parseFloat((amount - fee).toFixed(2));
    const newBalance = parseFloat((user.balance - amount).toFixed(2));

    return prisma.$transaction(async (tx: any) => {
      await tx.user.update({ where: { id: userId }, data: { balance: newBalance, pendingBalance: { increment: amount } } });
      await tx.transaction.create({
        data: {
          userId, type: 'WITHDRAWAL', amount: -amount, fee,
          balanceBefore: user.balance, balanceAfter: newBalance,
          description: `Retrait ${method}`, status: 'PENDING',
        },
      });
      return tx.withdrawal.create({
        data: { userId, amount: netAmount, fee, method, accountInfo: JSON.stringify(accountDetails), status: 'PENDING' },
      });
    });
  }

  /**
   * Récupère l'historique des transactions
   */
  async getTransactionHistory(userId: string, limit = 20): Promise<any[]> {
    return prisma.transaction.findMany({
      where: { userId }, orderBy: { createdAt: 'desc' }, take: limit,
    });
  }

  /**
   * Récupère l'historique des retraits
   */
  async getWithdrawalHistory(userId: string): Promise<any[]> {
    return prisma.withdrawal.findMany({
      where: { userId }, orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Récupère les tâches disponibles pour un utilisateur
   */
  async getAvailableTasks(userId: string): Promise<any[]> {
    const now = new Date();
    const tasks = await prisma.task.findMany({
      where: {
        status: 'ACTIVE',
        OR: [{ startDate: null }, { startDate: { lte: now } }],
        AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
      },
      include: {
        category: true,
        completions: { where: { userId } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tasks.filter((task: any) => {
      if (task.completions.length >= task.maxPerUser) return false;
      if (task.maxParticipants && task.currentParticipants >= task.maxParticipants) return false;
      return true;
    });
  }

  /**
   * Utilise un code promo
   */
  async usePromoCode(userId: string, code: string): Promise<number> {
    const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } });
    if (!promo) throw new Error('Code promo invalide');
    if (!promo.isActive) throw new Error('Code promo inactif');
    if (promo.currentUses >= promo.maxUses) throw new Error('Code promo épuisé');
    if (promo.expiresAt && promo.expiresAt < new Date()) throw new Error('Code promo expiré');

    const existingUse = await prisma.userPromoCode.findUnique({
      where: { userId_promoId: { userId, promoId: promo.id } },
    });
    if (existingUse) throw new Error('Code déjà utilisé');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Utilisateur non trouvé');

    const newBalance = parseFloat((user.balance + promo.reward).toFixed(2));

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { balance: newBalance, totalEarned: { increment: promo.reward } } }),
      prisma.promoCode.update({ where: { id: promo.id }, data: { currentUses: { increment: 1 } } }),
      prisma.userPromoCode.create({ data: { userId, promoId: promo.id } }),
      prisma.transaction.create({
        data: {
          userId, type: 'BONUS_PROMO', amount: promo.reward,
          balanceBefore: user.balance, balanceAfter: newBalance,
          description: `Code promo: ${code}`, status: 'COMPLETED',
        },
      }),
    ]);

    return promo.reward;
  }

  /**
   * Récupère les notifications non lues
   */
  async getUnreadNotifications(userId: string): Promise<any[]> {
    return prisma.notification.findMany({
      where: { userId, isRead: false }, orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Marque une notification comme lue
   */
  async markNotificationRead(notificationId: string): Promise<void> {
    await prisma.notification.update({
      where: { id: notificationId }, data: { isRead: true, readAt: new Date() },
    });
  }
}

export const transactionService = new TransactionService();