// ============================================================
// CASHBOT - Routes API REST
// ============================================================
// Points d'accès API pour le tableau de bord et les webhooks
// ============================================================

import { Router, Request, Response } from 'express';
import prisma from '../helpers/prisma';
import logger from '../helpers/logger';

const router = Router();

// Middleure d'authentification - pas requis car l'admin est servi par le même serveur
function authMiddleware(req: Request, res: Response, next: any) {
  next();
}

// ============================================================
// SANTÉ DE L'API
// ============================================================

router.get('/status', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// UTILISATEURS
// ============================================================

// Récupérer tous les utilisateurs (admin)
router.get('/users', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '50', search, status } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const where: any = {};
    if (search) {
      where.OR = [
        { username: { contains: search as string } },
        { firstName: { contains: search as string } },
        { lastName: { contains: search as string } },
      ];
    }
    if (status) {
      where.status = status as string;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          telegramId: true,
          username: true,
          firstName: true,
          lastName: true,
          balance: true,
          referralCount: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      data: users,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    logger.error('Erreur GET /users', { error });
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer un utilisateur par ID Telegram
router.get('/users/telegram/:telegramId', async (req: Request, res: Response) => {
  try {
    const telegramId = req.params.telegramId;
    const user = await prisma.user.findUnique({
      where: { telegramId },
      include: {
        transactions: { orderBy: { createdAt: 'desc' }, take: 20 },
        taskCompletions: { include: { task: true }, orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    logger.error('Erreur GET /users/telegram/:id', { error });
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// TÂCHES
// ============================================================

// Récupérer toutes les tâches
router.get('/tasks', async (req: Request, res: Response) => {
  try {
    const { status, type, page = '1', limit = '20' } = req.query;
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      data: tasks,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    logger.error('Erreur GET /tasks', { error });
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer une tâche (admin)
router.post('/tasks', authMiddleware, async (req: Request, res: Response) => {
  try {
    const task = await prisma.task.create({
      data: {
        ...req.body,
        createdById: req.body.adminId || 'admin',
      },
    });
    res.status(201).json(task);
  } catch (error) {
    logger.error('Erreur POST /tasks', { error });
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
});

// Mettre à jour une tâche
router.put('/tasks/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(task);
  } catch (error) {
    logger.error('Erreur PUT /tasks/:id', { error });
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// Supprimer une tâche
router.delete('/tasks/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Tâche supprimée' });
  } catch (error) {
    logger.error('Erreur DELETE /tasks/:id', { error });
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// ============================================================
// CATÉGORIES DE TÂCHES
// ============================================================

router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.taskCategory.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// TRANSACTIONS
// ============================================================

router.get('/transactions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId, type, page = '1', limit = '50' } = req.query;
    const where: any = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { username: true, firstName: true } } },
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      data: transactions,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// RETRAITS
// ============================================================

router.get('/withdrawals', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '50' } = req.query;
    const where: any = {};
    if (status) where.status = status;

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { username: true, firstName: true } } },
      }),
      prisma.withdrawal.count({ where }),
    ]);

    res.json({
      data: withdrawals,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Valider/rejeter un retrait (admin)
router.put('/withdrawals/:id/process', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { status, adminComment, processedById } = req.body;
    const withdrawal = await prisma.withdrawal.update({
      where: { id: req.params.id },
      data: {
        status,
        adminComment,
        processedById,
        processedAt: status === 'COMPLETED' || status === 'FAILED' ? new Date() : undefined,
      },
    });

    // Si retrait approuvé, met à jour le solde
    if (status === 'COMPLETED') {
      await prisma.user.update({
        where: { id: withdrawal.userId },
        data: {
          totalWithdrawn: { increment: withdrawal.amount },
        },
      });
    }

    // Si retrait refusé, rembourse le solde
    if (status === 'FAILED' || status === 'CANCELLED') {
      await prisma.user.update({
        where: { id: withdrawal.userId },
        data: {
          balance: { increment: withdrawal.amount },
        },
      });
    }

    res.json(withdrawal);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// STATISTIQUES
// ============================================================

router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalTasks,
      totalTransactions,
      totalWithdrawals,
      pendingWithdrawals,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.task.count({ where: { status: 'ACTIVE' } }),
      prisma.transaction.count(),
      prisma.withdrawal.count(),
      prisma.withdrawal.count({ where: { status: 'PENDING' } }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { username: true, firstName: true, balance: true, createdAt: true },
      }),
    ]);

    res.json({
      totalUsers,
      activeUsers,
      totalTasks,
      totalTransactions,
      totalWithdrawals,
      pendingWithdrawals,
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// CANAUX OBLIGATOIRES
// ============================================================

router.get('/channels', authMiddleware, async (req: Request, res: Response) => {
  try {
    const channels = await prisma.requiredChannel.findMany({
      orderBy: { orderIndex: 'asc' },
    });
    res.json(channels);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/channels', authMiddleware, async (req: Request, res: Response) => {
  try {
    const channel = await prisma.requiredChannel.create({ data: req.body });
    res.status(201).json(channel);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/channels/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await prisma.requiredChannel.delete({ where: { id: req.params.id } });
    res.json({ message: 'Canal supprimé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// CODES PROMO
// ============================================================

router.get('/promocodes', authMiddleware, async (req: Request, res: Response) => {
  try {
    const codes = await prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(codes);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/promocodes', authMiddleware, async (req: Request, res: Response) => {
  try {
    const code = await prisma.promoCode.create({ data: req.body });
    res.status(201).json(code);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// WEBHOOK 26KADO
// ============================================================

router.post('/webhook/kado', async (req: Request, res: Response) => {
  try {
    const { event, userId, data } = req.body;

    logger.info('Webhook 26KADO reçu', { event, userId });

    // Vérifier la signature du webhook
    const signature = req.headers['x-webhook-signature'];
    // TODO: Vérifier la signature

    switch (event) {
      case 'registration_completed':
        // Valider automatiquement une tâche d'inscription
        break;
      case 'email_confirmed':
        // Valider une tâche de confirmation email
        break;
      case 'deposit_made':
        // Créditer un bonus de dépôt
        break;
      default:
        logger.warn('Événement 26KADO inconnu', { event });
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Erreur webhook KADO', { error });
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// ANNONCES GÉNÉRALES
// ============================================================

router.post('/announcements', authMiddleware, async (req: Request, res: Response) => {
  try {
    const announcement = await prisma.announcement.create({
      data: {
        ...req.body,
        createdById: req.body.adminId || 'admin',
      },
    });
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;