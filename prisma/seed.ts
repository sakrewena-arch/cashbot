// ============================================================
// CASHBOT - Seed (Données initiales)
// ============================================================
// Peuple la base de données avec des données de test
// ============================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...');

  // 1. Créer les catégories de tâches
  const categories = await Promise.all([
    prisma.taskCategory.create({
      data: {
        name: 'Réseaux sociaux',
        description: 'Tâches sur les réseaux sociaux',
        icon: '📱',
        color: '#3b82f6',
        orderIndex: 1,
      },
    }),
    prisma.taskCategory.create({
      data: {
        name: 'Inscriptions',
        description: "Création de comptes et inscriptions",
        icon: '📝',
        color: '#10b981',
        orderIndex: 2,
      },
    }),
    prisma.taskCategory.create({
      data: {
        name: 'Vidéos',
        description: 'Regarder des vidéos',
        icon: '🎬',
        color: '#f59e0b',
        orderIndex: 3,
      },
    }),
    prisma.taskCategory.create({
      data: {
        name: 'Visites',
        description: 'Visiter des sites web',
        icon: '🌐',
        color: '#8b5cf6',
        orderIndex: 4,
      },
    }),
    prisma.taskCategory.create({
      data: {
        name: 'Parrainage',
        description: 'Inviter des amis',
        icon: '👥',
        color: '#ec4899',
        orderIndex: 5,
      },
    }),
  ]);

  console.log(`✅ ${categories.length} catégories créées`);

  // 2. Créer des canaux obligatoires
  const channels = await Promise.all([
    prisma.requiredChannel.create({
      data: {
        channelId: '-1001234567890',
        channelName: 'Cashbot Officiel',
        channelUrl: 'https://t.me/cashbot',
        description: 'Canal officiel de Cashbot',
        orderIndex: 1,
      },
    }),
  ]);

  console.log(`✅ ${channels.length} canaux créés`);

  // 3. Créer les codes promotionnels
  const promoCodes = await Promise.all([
    prisma.promoCode.create({
      data: {
        code: 'WELCOME2024',
        description: 'Code de bienvenue',
        reward: 0.50,
        maxUses: 1000,
      },
    }),
    prisma.promoCode.create({
      data: {
        code: 'BONUS10',
        description: 'Bonus 10 centimes',
        reward: 0.10,
        maxUses: 500,
      },
    }),
  ]);

  console.log(`✅ ${promoCodes.length} codes promo créés`);

  // 4. Créer quelques tâches de test
  const tasksData = [
    {
      title: 'Rejoindre notre canal Telegram',
      description: 'Rejoins le canal officiel Cashbot',
      instructions: '1. Clique sur le bouton ci-dessous\n2. Rejoins le canal\n3. Reviens et valide',
      icon: '📢',
      reward: 0.10,
      type: 'JOIN_CHANNEL' as const,
      validationMode: 'AUTO' as const,
      status: 'ACTIVE' as const,
      categoryId: categories[0].id,
      maxPerUser: 1,
      createdById: 'seed',
    },
    {
      title: "S'inscrire sur 26KADO",
      description: "Crée un compte sur 26KADO.com",
      instructions: "1. Visite 26KADO.com\n2. Crée ton compte\n3. Confirme ton email",
      icon: '📝',
      reward: 0.50,
      type: 'REGISTER_26KADO' as const,
      validationMode: 'AUTO' as const,
      status: 'ACTIVE' as const,
      categoryId: categories[1].id,
      maxPerUser: 1,
      createdById: 'seed',
      apiEndpoint: 'https://api.26kado.com/v1/check-user',
    },
    {
      title: 'Regarder une vidéo',
      description: 'Regarde une vidéo de 30 secondes',
      instructions: '1. Clique sur le lien\n2. Regarde la vidéo jusqu\'à la fin\n3. Envoie une capture d\'écran',
      icon: '🎬',
      reward: 0.05,
      type: 'WATCH_VIDEO' as const,
      validationMode: 'MANUAL' as const,
      proofType: 'SCREENSHOT' as const,
      status: 'ACTIVE' as const,
      categoryId: categories[2].id,
      maxPerUser: 5,
      createdById: 'seed',
      linkUrl: 'https://www.youtube.com/watch?v=example',
    },
    {
      title: 'Visiter notre site partenaire',
      description: 'Visite le site de notre partenaire',
      instructions: "1. Clique sur le lien\n2. Reste 30 secondes sur le site\n3. Reviens valider",
      icon: '🌐',
      reward: 0.03,
      type: 'VISIT_WEBSITE' as const,
      validationMode: 'AUTO' as const,
      status: 'ACTIVE' as const,
      categoryId: categories[3].id,
      maxPerUser: 10,
      createdById: 'seed',
      linkUrl: 'https://exemple.com',
      minTimeMinutes: 1,
    },
    {
      title: 'Inviter un ami',
      description: 'Invite un ami à rejoindre Cashbot',
      instructions: "1. Utilise ton lien de parrainage\n2. Ton ami doit s'inscrire\n3. Gagne ta récompense",
      icon: '👥',
      reward: 0.20,
      type: 'INVITE_FRIENDS' as const,
      validationMode: 'AUTO' as const,
      status: 'ACTIVE' as const,
      categoryId: categories[4].id,
      maxPerUser: 100,
      createdById: 'seed',
    },
  ];

  for (const taskData of tasksData) {
    await prisma.task.create({ data: taskData });
  }

  console.log(`✅ ${tasksData.length} tâches créées`);

  // 5. Créer un utilisateur admin de test
  const adminUser = await prisma.user.upsert({
    where: { telegramId: BigInt(123456789) },
    update: {},
    create: {
      telegramId: BigInt(123456789),
      username: 'admin_cashbot',
      firstName: 'Admin',
      lastName: 'Cashbot',
      role: 'SUPER_ADMIN',
      isOnboarded: true,
      joinedChannels: true,
    },
  });

  console.log(`✅ Utilisateur admin créé: ${adminUser.username}`);

  console.log('\n🎉 Seed terminé avec succès !');
  console.log(`📊 Statistiques:`);
  console.log(`   - ${categories.length} catégories`);
  console.log(`   - ${channels.length} canaux`);
  console.log(`   - ${promoCodes.length} codes promo`);
  console.log(`   - ${tasksData.length} tâches`);
  console.log(`   - 1 admin`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });