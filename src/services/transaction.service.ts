// ============================================================
// CASHBOT - Service de Transactions et Retraits
// ============================================================

import prisma from '../helpers/prisma';
import logger from '../helpers/logger';
import { BOT_CONSTANTS } from '../config';

export class TransactionService {
  /**
   * Crédite le solde d'un utilisateur après validation d'une tâche
   */
  async creditTaskReward(userId: string, taskId: string, amount: number): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Utilisateur non trouvé');

    const balanceBefore = user.balance;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          balance: { increment: amount },
          totalEarned: { increment: amount },
        },
      }),
      prisma.transaction.create({
        data: {
          userId,
          type: 'TASK_REWARD',
          amount,
          balanceBefore,
          balanceAfter: balanceBefore + amount,
          description: 'Récompense de tâche',
          reference: taskId,
          status: 'COMPLETED',
        },
      }),
    ]);
  }

  /**
   * Crédite le bonus de parrainage
   */
  async creditReferralBonus(referrerId: string, amount: number): Promise<void> {
    const bonusAmount = amount * (BOT_CONSTANTS.REFERRAL_BONUS_PERCENT / 100);
    const user = await prisma.user.findUnique({ where: { id: referrerId } });
    if (!user) return;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: referrerId },
        data: {
          balance: { increment: bonusAmount },
          referralEarnings: { increment: bonusAmount },
          totalEarned: { increment: bonusAmount },
        },
      }),
      prisma.transaction.create({
        data: {
          userId: referrerId,
          type: 'REFERRAL_BONUS',
          amount: bonusAmount,
          balanceBefore: user.balance,
          balanceAfter: user.balance + bonusAmount,
          description: 'Bonus de parrainage',
          status: 'COMPLETED',
        },
      }),
    ]);
  }

  /**
   * Crédite le bonus quotidien
   */
  async creditDailyBonus(userId: string): Promise<{ amount: number; streak: number }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Utilisateur non trouvé');

    const streak = (user.bonusStreak || 0) + 1;
    const amount = 0.10 + (streak * 0.05); // 0.10€ + 0.05€ par jour de streak

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          balance: { increment: amount },
          totalEarned: { increment: amount },
          lastDailyBonus: new Date(),
          bonusStreak: streak,
        },
      }),
      prisma.transaction.create({
        data: {
          userId,
          type: 'BONUS_DAILY',
          amount,
          balanceBefore: user.balance,
          balanceAfter: user.balance + amount,
          description: `Bonus quotidien jour ${streak}`,
          status: 'COMPLETED',
        },
      }),
    ]);

    return { amount, streak };
  }

  /**
   * Crée une demande de retrait
   */
  async createWithdrawal(
    userId: string,
    amount: number,
    method: string,
    accountDetails: any
  ): Promise<any> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Utilisateur non trouvé');
    if (amount < BOT_CONSTANTS.MIN_WITHDRAWAL_AMOUNT) {
      throw new Error(`Montant minimum de retrait: ${BOT_CONSTANTS.MIN_WITHDRAWAL_AMOUNT} €`);
    }
    if (amount > user.balance) {
      throw new Error('Solde insuffisant');
    }

    const fee = amount * (BOT_CONSTANTS.WITHDRAWAL_FEE_PERCENT / 100);
    const netAmount = amount - fee;

    const withdrawal = await prisma.$transaction(async (tx) => {
      // Déduire du solde
      await tx.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: amount },
          pendingBalance: { increment: amount },
        },
      });

      // Créer la transaction
      await tx.transaction.create({
        data: {
          userId,
          type: 'WITHDRAWAL',
          amount: -amount,
          fee,
          balanceBefore: user.balance,
          balanceAfter: user.balance - amount,
          description: `Retrait ${method}`,
          status: 'PENDING',
        },
      });

      // Créer la demande de retrait
      return tx.withdrawal.create({
        data: {
          userId,
          amount: netAmount,
          fee,
          method,
          accountInfo: JSON.stringify(accountDetails),
          status: 'PENDING',
        },
      });
    });

    return withdrawal;
  }

  /**
   * Récupère l'historique des transactions d'un utilisateur
   */
  async getTransactionHistory(userId: string, limit = 20): Promise<any[]> {
    return prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Récupère l'historique des retraits d'un utilisateur
   */
  async getWithdrawalHistory(userId: string): Promise<any[]> {
    return prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
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
        OR: [
          { startDate: null },
          { startDate: { lte: now } },
        ],
        AND: [
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      },
      include: {
        category: true,
        completions: {
          where: { userId },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filtrer les tâches déjà complétées
    return tasks.filter(task => {
      if (task.completions.length >= task.maxPerUser) return false;
      if (task.maxParticipants && task.currentParticipants >= task.maxParticipants) return false;
      return true;
    });
  }

  /**
   * Démarre une tâche pour un utilisateur
   */
  async startTask(userId: string, taskId: string): Promise<any> {
    const existingCompletion = await prisma.taskCompletion.findUnique({
      where: { userId_taskId: { userId, taskId } },
    });

    if (existingCompletion) {
      // Incrémente les tentatives si déjà commencé
      return prisma.taskCompletion.update({
        where: { id: existingCompletion.id },
        data: { attempts: { increment: 1 } },
      });
    }

    return prisma.taskCompletion.create({
      data: {
        userId,
        taskId,
        status: 'PENDING',
        attempts: 1,
      },
    });
  }

  /**
   * Crédite un code promo
   */
  async usePromoCode(userId: string, code: string): Promise<number> {
    const promo = await prisma.promoCode.findUnique({ where: { code } });
    if (!promo) throw new Error('Code promo invalide');
    if (!promo.isActive) throw new Error('Code promo expiré');
    if (promo.currentUses >= promo.maxUses) throw new Error('Code promo épuisé');
    if (promo.expiresAt && promo.expiresAt < new Date()) throw new Error('Code promo expiré');

    // Vérifier si l'utilisateur a déjà utilisé ce code
    const existingUse = await prisma.userPromoCode.findUnique({
      where: { userId_promoId: { userId, promoId: promo.id } },
    });
    if (existingUse) throw new Error('Code promo déjà utilisé');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Utilisateur non trouvé');

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          balance: { increment: promo.reward },
          totalEarned: { increment: promo.reward },
        },
      }),
      prisma.promoCode.update({
        where: { id: promo.id },
        data: { currentUses: { increment: 1 } },
      }),
      prisma.userPromoCode.create({
        data: { userId, promoId: promo.id },
      }),
      prisma.transaction.create({
        data: {
          userId,
          type: 'BONUS_PROMO',
          amount: promo.reward,
          balanceBefore: user.balance,
          balanceAfter: user.balance + promo.reward,
          description: `Code promo: ${code}`,
          status: 'COMPLETED',
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
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Marque une notification comme lue
   */
  async markNotificationRead(notificationId: string): Promise<void> {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }
}

export const transactionService = new TransactionService();