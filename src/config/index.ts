// ============================================================
// CASHBOT - Configuration Centralisée
// ============================================================
// Ce fichier centralise toutes les variables d'environnement
// et fournit des constantes de configuration pour l'ensemble du projet.
// ============================================================

import dotenv from 'dotenv';
import path from 'path';

// Chargement des variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Validation des variables requises
const requiredVars = ['BOT_TOKEN', 'DATABASE_URL', 'JWT_SECRET'];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error('Variable manquante: ' + varName);
  }
}

// ============================================================
// CONFIGURATION DU BOT TELEGRAM
// ============================================================
export const BOT_CONFIG = {
  token: process.env.BOT_TOKEN!,
  username: process.env.BOT_USERNAME || 'cashbot_bot',
  webhookUrl: process.env.BOT_WEBHOOK_URL,
  useWebhook: process.env.NODE_ENV === 'production',
  webhookPort: parseInt(process.env.WEBHOOK_PORT || '8443', 10),
};

// ============================================================
// CONFIGURATION DE LA BASE DE DONNÉES
// ============================================================
export const DATABASE_CONFIG = {
  url: process.env.DATABASE_URL!,
};

// ============================================================
// CONFIGURATION REDIS
// ============================================================
export const REDIS_CONFIG = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD || undefined,
};

// ============================================================
// CONFIGURATION JWT
// ============================================================
export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET!,
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

// ============================================================
// CONFIGURATION ADMIN
// ============================================================
export const ADMIN_CONFIG = {
  ids: (process.env.ADMIN_IDS || '').split(',').map(function(id: string) { return parseInt(id, 10); }).filter(function(id: number) { return !isNaN(id); }),
  panelUrl: process.env.ADMIN_PANEL_URL || 'http://localhost:3000',
};

// ============================================================
// CONFIGURATION API
// ============================================================
export const API_CONFIG = {
  port: parseInt(process.env.API_PORT || '3001', 10),
  url: process.env.API_URL || 'http://localhost:3001',
};

// ============================================================
// CONFIGURATION 26KADO
// ============================================================
export const KADO_CONFIG = {
  apiUrl: process.env.KADO_API_URL || 'https://api.26kado.com',
  apiKey: process.env.KADO_API_KEY || '',
  webhookSecret: process.env.KADO_WEBHOOK_SECRET || '',
};

// ============================================================
// CONFIGURATION STOCKAGE
// ============================================================
export const STORAGE_CONFIG = {
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
};

// ============================================================
// CONFIGURATION LOGS
// ============================================================
export const LOG_CONFIG = {
  level: process.env.LOG_LEVEL || 'info',
  dir: process.env.LOG_DIR || './logs',
};

// ============================================================
// CONFIGURATION CACHE
// ============================================================
export const CACHE_CONFIG = {
  ttl: parseInt(process.env.CACHE_TTL || '300', 10),
};

// ============================================================
// CONFIGURATION RATE LIMIT
// ============================================================
export const RATE_LIMIT_CONFIG = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '30', 10),
};

// ============================================================
// CONFIGURATION NOTIFICATIONS
// ============================================================
export const NOTIFICATION_CONFIG = {
  batchSize: parseInt(process.env.NOTIFICATION_BATCH_SIZE || '100', 10),
};

// ============================================================
// INFORMATIONS DU PROJET
// ============================================================
export const PROJECT_INFO = {
  name: 'Cashbot',
  version: '1.0.0',
  description: 'Bot Telegram de gains par taches',
  environment: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
};

// ============================================================
// CONSTANTES DU BOT
// ============================================================
export const BOT_CONSTANTS = {
  MAX_TASK_ATTEMPTS: 3,
  DAILY_BONUS_COOLDOWN: 20,
  WEEKLY_BONUS_COOLDOWN: 6,
  REFERRAL_BONUS_PERCENT: 10,
  MIN_REFERRALS_FOR_BONUS: 1,
  MIN_WITHDRAWAL_AMOUNT: 5,
  WITHDRAWAL_FEE_PERCENT: 2,
  MAX_PROOF_TEXT_LENGTH: 5000,
};

// ============================================================
// MESSAGES DU BOT (FRANÇAIS)
// Ces fonctions retournent les messages formatés en Markdown Telegram
// ============================================================
export const BOT_MESSAGES = {
  welcome: [
    '🎉 *Bienvenue sur Cashbot !* 🎉',
    '',
    "Gagne de l'argent facilement en accomplissant des tâches simples.",
    '',
    '✅ Rejoins des canaux',
    '✅ Regarde des vidéos',
    '✅ Visite des sites',
    "✅ Invite tes amis",
    '✅ Et bien plus encore !',
    '',
    '💰 *Reçois des récompenses instantanées*',
    '💸 *Retire tes gains facilement*',
    '👥 *Gagne avec le parrainage*',
    '',
    'Utilise /menu pour commencer !',
  ].join('\n'),

  menuPrincipal: '📱 *Menu Principal*\n\nChoisis une option ci-dessous :',

  balanceInfo: function(balance: string, pending: string, totalEarned: string): string {
    return [
      '💰 *Ton Solde*',
      '',
      '💰 Disponible : *' + balance + ' €*',
      '⏳ En attente : *' + pending + ' €*',
      '📈 Total gagné : *' + totalEarned + ' €*',
    ].join('\n');
  },

  taskList: function(tasks: any[]): string {
    if (tasks.length === 0) {
      return "📭 *Aucune tâche disponible pour le moment.*\n\nReviens plus tard !";
    }
    var taskLines = tasks.map(function(t: any, i: number): string {
      return (i + 1) + '. ' + t.icon + ' *' + t.title + '* - ' + t.reward + ' €';
    });
    return '🎯 *Tâches Disponibles*\n\n' + taskLines.join('\n');
  },

  taskDetail: function(task: any): string {
    var lines = [
      '*' + task.icon + ' ' + task.title + '*',
      '',
      '📝 *Description :*',
      task.description || 'Aucune description',
      '',
      '💰 *Récompense :* ' + task.reward + ' €',
      '👥 *Participants :* ' + task.currentParticipants + '/' + (task.maxParticipants || '∞'),
      '📅 *Fin :* ' + (task.endDate ? new Date(task.endDate).toLocaleDateString('fr-FR') : 'Illimitée'),
    ];
    if (task.instructions) {
      lines.push('');
      lines.push('📋 *Instructions :*');
      lines.push(task.instructions);
    }
    return lines.join('\n');
  },

  joinChannels: [
    '📢 *Rejoins nos canaux*',
    '',
    "Pour utiliser le bot, tu dois d'abord rejoindre tous les canaux ci-dessous.",
    '',
    'Clique sur chaque canal pour le rejoindre, puis appuie sur ✅ Vérifier.',
  ].join('\n'),

  channelsRequired: [
    '⚠️ *Accès restreint*',
    '',
    "Tu dois d'abord rejoindre tous nos canaux obligatoires pour accéder au menu principal.",
    '',
    'Utilise /start pour vérifier.',
  ].join('\n'),

  profileInfo: function(user: any): string {
    return [
      '👤 *Ton Profil*',
      '',
      '🆔 ID : `' + user.telegramId + '`',
      '👤 Nom : ' + (user.firstName || '') + ' ' + (user.lastName || ''),
      '📛 Pseudo : @' + (user.username || 'Non défini'),
      '🌍 Langue : ' + user.languageCode,
      '📅 Inscrit le : ' + new Date(user.createdAt).toLocaleDateString('fr-FR'),
      '🔗 Code parrain : `' + user.referralCode + '`',
      '👥 Filleuls : ' + user.referralCount,
      '💰 Gagné avec parrainage : ' + user.referralEarnings + ' €',
    ].join('\n');
  },

  referralInfo: function(user: any, referralLink: string): string {
    return [
      '👥 *Parrainage*',
      '',
      '🔗 *Ton lien de parrainage :*',
      '`' + referralLink + '`',
      '',
      '📊 *Tes statistiques :*',
      '👥 Filleuls : ' + user.referralCount,
      '💰 Gains parrainage : ' + user.referralEarnings + ' €',
      '',
      '💡 *Partage ton lien et gagne 10% des gains de tes filleuls !*',
      '',
      "Invite tes amis à utiliser le bot et gagne de l'argent !",
    ].join('\n');
  },

  withdrawalInfo: [
    '💸 *Retraits*',
    '',
    '💰 Solde disponible : utilise /balance pour voir ton solde.',
    '',
    '💳 *Méthodes disponibles :*',
    '• 📱 Mobile Money (Orange Money, MTN, etc.)',
    '• ₿ Crypto (Bitcoin, USDT)',
    '• 💰 PayPal',
    '• 🏦 Virement bancaire',
    '',
    '⚠️ *Conditions :*',
    '• Montant minimum : 5 €',
    '• Frais : 2%',
    '• Délai de traitement : 24-72h',
  ].join('\n'),

  historyInfo: "📜 *Ton Historique*\n\nUtilise /transactions pour voir toutes tes transactions.",

  bonusInfo: [
    '🎁 *Bonus*',
    '',
    '💰 *Bonus quotidien :* Gagne une récompense chaque jour !',
    '📅 *Bonus hebdomadaire :* Gagne une récompense chaque semaine !',
    '🎟 *Codes promo :* Entre un code promo pour gagner un bonus.',
    '',
    'Utilise /daily pour le bonus quotidien.',
  ].join('\n'),

  notificationsInfo: "📨 *Notifications*\n\nTu n'as aucune notification non lue.",

  supportInfo: [
    '❓ *Support*',
    '',
    "Besoin d'aide ? Contacte notre support :",
    '',
    '📧 Email : support@cashbot.com',
    '💬 Telegram : @CashbotSupport',
  ].join('\n'),

  settingsInfo: [
    '⚙ *Paramètres*',
    '',
    '🌍 Langue : Français',
    '🔔 Notifications : Activées',
    '',
    "Plus d'options bientôt disponibles !",
  ].join('\n'),

  taskCompleted: function(task: any, reward: string): string {
    return [
      '✅ *Tâche complétée !*',
      '',
      '🎯 ' + task.title,
      '💰 Récompense : *' + reward + ' €*',
      '',
      "La récompense a été créditée sur ton solde.",
    ].join('\n');
  },

  taskPending: function(task: any): string {
    return [
      '⏳ *Tâche soumise !*',
      '',
      '🎯 ' + task.title,
      '',
      "Ta preuve a été envoyée à l'équipe de validation.",
      'Tu seras notifié dès que ta tâche sera validée.',
    ].join('\n');
  },

  taskRejected: function(task: any, reason: string): string {
    return [
      '❌ *Tâche refusée*',
      '',
      '🎯 ' + task.title,
      '📝 Raison : ' + (reason || 'Aucune raison fournie'),
      '',
      'Tu peux réessayer !',
    ].join('\n');
  },

  withdrawalRequested: function(amount: string): string {
    return [
      '✅ *Demande de retrait soumise*',
      '',
      '💰 Montant : ' + amount + ' €',
      '⏳ Statut : En attente de validation',
      '',
      'Tu seras notifié dès que ton retrait sera traité.',
    ].join('\n');
  },

  withdrawalApproved: function(amount: string): string {
    return [
      '✅ *Retrait approuvé !*',
      '',
      '💰 ' + amount + ' € a été envoyé sur ton compte.',
      '',
      'Merci de ta confiance !',
    ].join('\n');
  },

  withdrawalRejected: function(amount: string, reason: string): string {
    return [
      '❌ *Retrait refusé*',
      '',
      '💰 ' + amount + ' €',
      '📝 Raison : ' + (reason || 'Aucune raison fournie'),
      '',
      'Contacte le support pour plus d\'informations.',
    ].join('\n');
  },

  dailyBonusClaimed: function(amount: string, streak: number): string {
    return [
      '🎁 *Bonus quotidien réclamé !*',
      '',
      '💰 +' + amount + ' €',
      '🔥 Série : ' + streak + ' jours',
      '',
      'Reviens demain pour ton prochain bonus !',
    ].join('\n');
  },

  promoCodeUsed: function(code: string, reward: string): string {
    return [
      '🎟 *Code promo utilisé !*',
      '',
      'Code : ' + code,
      '💰 Récompense : +' + reward + ' €',
    ].join('\n');
  },

  newReferral: function(username: string, reward: string): string {
    return [
      '👥 *Nouveau filleul !*',
      '',
      username + ' a rejoint Cashbot grâce à toi !',
      '💰 Bonus parrainage : +' + reward + ' €',
    ].join('\n');
  },

  error: "❌ *Une erreur est survenue*\n\nVeuillez réessayer plus tard.\nSi le problème persiste, contacte le support.",

  notRegistered: "⚠️ *Tu n'es pas encore inscrit !*\n\nUtilise /start pour créer ton compte.",

  alreadyCompleted: "⚠️ *Tâche déjà complétée*\n\nTu as déjà accompli cette tâche.",

  taskExpired: "⚠️ *Tâche expirée*\n\nCette tâche n'est plus disponible.",

  maxParticipants: "⚠️ *Tâche complète*\n\nCette tâche a atteint son nombre maximum de participants.",

  notAvailable: "⚠️ *Non disponible*\n\nCette fonctionnalité n'est pas encore disponible.",
};