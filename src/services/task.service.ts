// ============================================================
// CASHBOT - Service de Tâches et Validations
// ============================================================

import prisma from '../helpers/prisma';
import logger from '../helpers/logger';
import { BOT_CONFIG, BOT_CONSTANTS } from '../config';

export class TaskService {
  /**
   * Vérifie si un utilisateur est membre d'un canal Telegram
   */
  async checkChannelMembership(userId: string, channelId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return false;

      const telegramId = parseInt(user.telegramId);
      
      // Appel à l'API Telegram pour vérifier l'appartenance
      const response = await fetch(
        `https://api.telegram.org/bot${BOT_CONFIG.token}/getChatMember?chat_id=${channelId}&user_id=${telegramId}`
      );
      const data: any = await response.json();

      if (!data.ok) return false;

      const status = data.result?.status;
      // Statuts valides : member, administrator, creator, restricted
      return ['member', 'administrator', 'creator', 'restricted'].includes(status);
    } catch (error) {
      logger.error('Erreur vérification canal', { error, userId, channelId });
      return false;
    }
  }

  /**
   * Vérifie tous les canaux obligatoires pour un utilisateur
   */
  async checkAllRequiredChannels(userId: string): Promise<{ allJoined: boolean; channels: any[] }> {
    const channels = await prisma.requiredChannel.findMany({ where: { isActive: true } });
    const results = [];

    for (const channel of channels) {
      const isMember = await this.checkChannelMembership(userId, channel.channelId);
      
      // Enregistrer le résultat
      await prisma.userChannelCheck.upsert({
        where: { userId_channelId: { userId, channelId: channel.id } },
        update: { isMember, checkedAt: new Date() },
        create: { userId, channelId: channel.id, isMember },
      });

      results.push({ ...channel, isMember });
    }

    const allJoined = results.every(r => r.isMember);

    // Mettre à jour l'utilisateur
    if (allJoined) {
      await prisma.user.update({
        where: { id: userId },
        data: { joinedChannels: true, isOnboarded: true },
      });
    }

    return { allJoined, channels: results };
  }

  /**
   * Valide automatiquement une tâche de type canal/groupe
   */
  async validateChannelTask(userId: string, taskId: string): Promise<{ success: boolean; message: string }> {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return { success: false, message: 'Tâche introuvable' };

    // Vérifier si déjà complétée
    const existing = await prisma.taskCompletion.findUnique({
      where: { userId_taskId: { userId, taskId } },
    });
    if (existing && existing.status === 'APPROVED') {
      return { success: false, message: 'Tâche déjà complétée' };
    }

    // Vérifier l'appartenance au canal
    if (task.targetChannelId) {
      const isMember = await this.checkChannelMembership(userId, task.targetChannelId);
      if (!isMember) {
        return { success: false, message: 'Tu dois d\'abord rejoindre le canal' };
      }
    }

    // Créditer la récompense
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, message: 'Utilisateur introuvable' };

    const newBalance = parseFloat((user.balance + task.reward).toFixed(2));

    await prisma.$transaction([
      prisma.taskCompletion.upsert({
        where: { userId_taskId: { userId, taskId } },
        update: { status: 'APPROVED', validatedAt: new Date() },
        create: { userId, taskId, status: 'APPROVED', validatedAt: new Date() },
      }),
      prisma.task.update({
        where: { id: taskId },
        data: { currentParticipants: { increment: 1 } },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { balance: newBalance, totalEarned: { increment: task.reward } },
      }),
      prisma.transaction.create({
        data: {
          userId, type: 'TASK_REWARD', amount: task.reward,
          balanceBefore: user.balance, balanceAfter: newBalance,
          description: `Tâche: ${task.title}`, reference: taskId, status: 'COMPLETED',
        },
      }),
    ]);

    // Créer une notification
    await prisma.notification.create({
      data: {
        userId, type: 'TASK_REWARD',
        title: '✅ Tâche complétée !',
        message: `Tu as gagné ${task.reward} € en complétant "${task.title}"`,
      },
    });

    return { success: true, message: `✅ Tâche complétée ! +${task.reward} €` };
  }

  /**
   * Soumet une preuve pour validation manuelle
   */
  async submitProof(userId: string, taskId: string, proofType: string, content: string, fileUrl?: string): Promise<any> {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new Error('Tâche introuvable');

    // Créer ou mettre à jour la complétion
    const completion = await prisma.taskCompletion.upsert({
      where: { userId_taskId: { userId, taskId } },
      update: { status: 'PENDING', attempts: { increment: 1 } },
      create: { userId, taskId, status: 'PENDING', attempts: 1 },
    });

    // Enregistrer la preuve
    await prisma.proof.create({
      data: {
        completionId: completion.id,
        userId,
        type: proofType,
        content,
        fileUrl,
      },
    });

    // Notification à l'admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    await prisma.notification.create({
      data: {
        userId, type: 'SYSTEM',
        title: '📤 Preuve soumise',
        message: `Ta preuve pour "${task.title}" a été envoyée. Un admin va la vérifier.`,
      },
    });

    logger.info('Preuve soumise', { userId, taskId, proofType });

    return completion;
  }

  /**
   * Valide ou rejette une preuve (admin)
   */
  async reviewProof(completionId: string, status: string, adminComment?: string): Promise<void> {
    const completion = await prisma.taskCompletion.findUnique({
      where: { id: completionId },
      include: { task: true, user: true },
    });
    if (!completion) throw new Error('Complétion introuvable');

    await prisma.taskCompletion.update({
      where: { id: completionId },
      data: {
        status,
        validatedById: 'admin',
        validatedAt: status === 'APPROVED' ? new Date() : undefined,
        adminComment,
        rejectionReason: status === 'REJECTED' ? adminComment : undefined,
      },
    });

    if (status === 'APPROVED') {
      // Créditer la récompense
      const user = await prisma.user.findUnique({ where: { id: completion.userId } });
      if (user) {
        const newBalance = parseFloat((user.balance + completion.task.reward).toFixed(2));
        await prisma.$transaction([
          prisma.user.update({
            where: { id: completion.userId },
            data: { balance: newBalance, totalEarned: { increment: completion.task.reward } },
          }),
          prisma.transaction.create({
            data: {
              userId: completion.userId, type: 'TASK_REWARD', amount: completion.task.reward,
              balanceBefore: user.balance, balanceAfter: newBalance,
              description: `Tâche validée: ${completion.task.title}`, reference: completion.taskId, status: 'COMPLETED',
            },
          }),
          prisma.task.update({
            where: { id: completion.taskId },
            data: { currentParticipants: { increment: 1 } },
          }),
        ]);
      }

      await prisma.notification.create({
        data: {
          userId: completion.userId, type: 'TASK_REWARD',
          title: '✅ Preuve acceptée !',
          message: `Ta preuve pour "${completion.task.title}" a été acceptée. +${completion.task.reward} €`,
        },
      });
    } else {
      await prisma.notification.create({
        data: {
          userId: completion.userId, type: 'SYSTEM',
          title: '❌ Preuve refusée',
          message: `Ta preuve pour "${completion.task.title}" a été refusée. Raison: ${adminComment || 'Aucune'}`,
        },
      });
    }
  }

  /**
   * Récupère les preuves en attente de validation
   */
  async getPendingProofs(): Promise<any[]> {
    return prisma.taskCompletion.findMany({
      where: { status: 'PENDING' },
      include: {
        user: { select: { username: true, firstName: true, telegramId: true } },
        task: { select: { title: true, reward: true, icon: true } },
        proofs: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const taskService = new TaskService();