// ============================================================
// CASHBOT - Service Utilisateur
// ============================================================
// Gère l'inscription, la récupération et la mise à jour des utilisateurs
// ============================================================

import prisma from '../helpers/prisma';
import logger from '../helpers/logger';
import { BOT_CONSTANTS } from '../config';

export class UserService {
  /**
   * Inscrit un nouvel utilisateur ou retourne l'existant
   */
  async register(ctx: any): Promise<any> {
    const telegramId = String(ctx.from.id);
    const referralCode = ctx.startPayload || null;

    try {
      // Vérifie si l'utilisateur existe déjà
      let user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (user) {
        // Met à jour les infos si nécessaire
        user = await prisma.user.update({
          where: { telegramId },
          data: {
            username: ctx.from.username || user.username,
            firstName: ctx.from.first_name || user.firstName,
            lastName: ctx.from.last_name || user.lastName,
            languageCode: ctx.from.language_code || user.languageCode,
          },
        });
        return user;
      }

      // Crée un nouvel utilisateur
      user = await prisma.user.create({
        data: {
          telegramId,
          username: ctx.from.username,
          firstName: ctx.from.first_name,
          lastName: ctx.from.last_name,
          languageCode: ctx.from.language_code || 'fr',
        },
      });

      // Gère le parrainage si un code a été fourni
      if (referralCode) {
        await this.handleReferral(user.id, referralCode);
      }

      logger.info('Nouvel utilisateur inscrit', {
        telegramId: telegramId.toString(),
        username: ctx.from.username,
      });

      return user;
    } catch (error) {
      logger.error('Erreur lors de l\'inscription', { error, telegramId: telegramId.toString() });
      throw error;
    }
  }

  /**
   * Récupère un utilisateur par son ID Telegram
   */
  async getByTelegramId(telegramId: string): Promise<any> {
    return prisma.user.findUnique({
      where: { telegramId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        taskCompletions: {
          include: { task: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  /**
   * Récupère un utilisateur par son ID
   */
  async getById(id: string): Promise<any> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  /**
   * Récupère un utilisateur par son code de parrainage
   */
  async getByReferralCode(code: string): Promise<any> {
    return prisma.user.findUnique({
      where: { referralCode: code },
    });
  }

  /**
   * Gère le parrainage d'un nouvel utilisateur
   */
  async handleReferral(newUserId: string, referralCode: string): Promise<void> {
    try {
      const referrer = await this.getByReferralCode(referralCode);
      if (!referrer || referrer.id === newUserId) return;

      // Met à jour le parrain
      await prisma.user.update({
        where: { id: referrer.id },
        data: {
          referralCount: { increment: 1 },
        },
      });

      // Met à jour le filleul
      await prisma.user.update({
        where: { id: newUserId },
        data: {
          referredById: referrer.id,
        },
      });

      logger.info('Parrainage enregistré', {
        referrerId: referrer.id,
        newUserId,
      });
    } catch (error) {
      logger.error('Erreur lors du parrainage', { error, newUserId, referralCode });
    }
  }

  /**
   * Crédite le bonus de parrainage
   */
  async creditReferralBonus(referrerId: string, amount: number): Promise<void> {
    const bonusAmount = amount * (BOT_CONSTANTS.REFERRAL_BONUS_PERCENT / 100);

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
          balanceBefore: 0,
          balanceAfter: 0,
          description: 'Bonus de parrainage',
        },
      }),
    ]);
  }

  /**
   * Vérifie si l'utilisateur est un administrateur
   */
  isAdmin(telegramId: number): boolean {
    const adminIds = (process.env.ADMIN_IDS || '').split(',').map(Number);
    return adminIds.includes(telegramId);
  }

  /**
   * Bloque un utilisateur
   */
  async blockUser(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'BLOCKED' },
    });
    logger.warn('Utilisateur bloqué', { userId });
  }

  /**
   * Débloque un utilisateur
   */
  async unblockUser(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' },
    });
    logger.info('Utilisateur débloqué', { userId });
  }

  /**
   * Marque les canaux comme vérifiés pour un utilisateur
   */
  async updateChannelsJoined(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { joinedChannels: true, isOnboarded: true },
    });
  }

  /**
   * Récupère les statistiques d'un utilisateur
   */
  async getUserStats(userId: string): Promise<any> {
    const [totalTasks, pendingTasks, totalWithdrawals, completedWithdrawals] = await Promise.all([
      prisma.taskCompletion.count({
        where: { userId, status: 'APPROVED' },
      }),
      prisma.taskCompletion.count({
        where: { userId, status: 'PENDING' },
      }),
      prisma.withdrawal.count({
        where: { userId },
      }),
      prisma.withdrawal.count({
        where: { userId, status: 'COMPLETED' },
      }),
    ]);

    return {
      totalTasks,
      pendingTasks,
      totalWithdrawals,
      completedWithdrawals,
    };
  }
}

export const userService = new UserService();