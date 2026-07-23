// ============================================================
// CASHBOT - Configuration Centralisée
// ============================================================

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredVars = ['BOT_TOKEN', 'DATABASE_URL', 'JWT_SECRET'];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error('Variable manquante: ' + varName);
  }
}

export const BOT_CONFIG = {
  token: process.env.BOT_TOKEN!,
  username: process.env.BOT_USERNAME || 'cashbot_bot',
  webhookUrl: process.env.BOT_WEBHOOK_URL || '',
  useWebhook: !!(process.env.NODE_ENV === 'production' && process.env.BOT_WEBHOOK_URL),
  webhookPort: parseInt(process.env.WEBHOOK_PORT || '8443', 10),
};

export const DATABASE_CONFIG = { url: process.env.DATABASE_URL! };
export const REDIS_CONFIG = { url: process.env.REDIS_URL || 'redis://localhost:6379', password: process.env.REDIS_PASSWORD || undefined };
export const JWT_CONFIG = { secret: process.env.JWT_SECRET!, expiresIn: process.env.JWT_EXPIRES_IN || '7d' };
export const ADMIN_CONFIG = { ids: (process.env.ADMIN_IDS || '').split(',').map(function(id: string) { return parseInt(id, 10); }).filter(function(id: number) { return !isNaN(id); }), panelUrl: process.env.ADMIN_PANEL_URL || 'http://localhost:3000' };
export const API_CONFIG = { port: parseInt(process.env.PORT || process.env.API_PORT || '3001', 10), url: process.env.API_URL || 'http://localhost:3001' };
export const KADO_CONFIG = { apiUrl: process.env.KADO_API_URL || 'https://api.26kado.com', apiKey: process.env.KADO_API_KEY || '', webhookSecret: process.env.KADO_WEBHOOK_SECRET || '' };
export const STORAGE_CONFIG = { uploadDir: process.env.UPLOAD_DIR || './uploads', maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10) };
export const LOG_CONFIG = { level: process.env.LOG_LEVEL || 'info', dir: process.env.LOG_DIR || './logs' };
export const CACHE_CONFIG = { ttl: parseInt(process.env.CACHE_TTL || '300', 10) };
export const RATE_LIMIT_CONFIG = { windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10), max: parseInt(process.env.RATE_LIMIT_MAX || '30', 10) };
export const NOTIFICATION_CONFIG = { batchSize: parseInt(process.env.NOTIFICATION_BATCH_SIZE || '100', 10) };
export const PROJECT_INFO = { name: 'Cashbot', version: '1.0.0', description: 'Bot Telegram de gains par taches', environment: process.env.NODE_ENV || 'development', isProduction: process.env.NODE_ENV === 'production', isDevelopment: process.env.NODE_ENV !== 'production' };
export const BOT_CONSTANTS = { MAX_TASK_ATTEMPTS: 3, DAILY_BONUS_COOLDOWN: 20, WEEKLY_BONUS_COOLDOWN: 6, REFERRAL_BONUS_PERCENT: 10, MIN_REFERRALS_FOR_BONUS: 1, MIN_WITHDRAWAL_AMOUNT: 5, WITHDRAWAL_FEE_PERCENT: 2, MAX_PROOF_TEXT_LENGTH: 5000 };

export const BOT_MESSAGES = {
  welcome: ['🎉 *Bienvenue sur Cashbot !* 🎉', '', "Gagne de l'argent facilement en accomplissant des tâches simples.", '', '✅ Rejoins des canaux', '✅ Regarde des vidéos', '✅ Visite des sites', "✅ Invite tes amis", '✅ Et bien plus encore !', '', '💰 *Reçois des récompenses instantanées*', '💸 *Retire tes gains facilement*', '👥 *Gagne avec le parrainage*', '', 'Utilise /menu pour commencer !'].join('\n'),
  menuPrincipal: '📱 *Menu Principal*\n\nChoisis une option ci-dessous :',
  balanceInfo: function(balance: string, pending: string, totalEarned: string): string { return ['💰 *Ton Solde*', '', '💰 Disponible : *' + balance + ' €*', '⏳ En attente : *' + pending + ' €*', '📈 Total gagné : *' + totalEarned + ' €*'].join('\n'); },
  profileInfo: function(user: any): string { return ['👤 *Ton Profil*', '', '🆔 ID : `' + user.telegramId + '`', '👤 Nom : ' + (user.firstName || '') + ' ' + (user.lastName || ''), '📛 Pseudo : @' + (user.username || 'Non défini'), '🌍 Langue : ' + user.languageCode, '📅 Inscrit le : ' + new Date(user.createdAt).toLocaleDateString('fr-FR'), '🔗 Code parrain : `' + user.referralCode + '`', '👥 Filleuls : ' + user.referralCount, '💰 Gagné avec parrainage : ' + user.referralEarnings + ' €'].join('\n'); },
  referralInfo: function(user: any, referralLink: string): string { return ['👥 *Parrainage*', '', '🔗 *Ton lien de parrainage :*', '`' + referralLink + '`', '', '📊 *Tes statistiques :*', '👥 Filleuls : ' + user.referralCount, '💰 Gains parrainage : ' + user.referralEarnings + ' €', '', '💡 *Partage ton lien et gagne 10% des gains de tes filleuls !*', '', "Invite tes amis à utiliser le bot et gagne de l'argent !"].join('\n'); },
  withdrawalInfo: ['💸 *Retraits*', '', '💰 Solde disponible : utilise /balance pour voir ton solde.', '', '💳 *Méthodes disponibles :*', '• 📱 Mobile Money (Orange Money, MTN, etc.)', '• ₿ Crypto (Bitcoin, USDT)', '• 💰 PayPal', '• 🏦 Virement bancaire', '', '⚠️ *Conditions :*', '• Montant minimum : 5 €', '• Frais : 2%', '• Délai de traitement : 24-72h'].join('\n'),
  bonusInfo: ['🎁 *Bonus*', '', '💰 *Bonus quotidien :* Gagne une récompense chaque jour !', '📅 *Bonus hebdomadaire :* Gagne une récompense chaque semaine !', '🎟 *Codes promo :* Entre un code promo pour gagner un bonus.', '', 'Utilise /daily pour le bonus quotidien.'].join('\n'),
  notificationsInfo: "📨 *Notifications*\n\nTu n'as aucune notification non lue.",
  supportInfo: ['❓ *Support*', '', "Besoin d'aide ? Contacte notre support :", '', '📧 Email : support@cashbot.com', '💬 Telegram : @CashbotSupport'].join('\n'),
  settingsInfo: ['⚙ *Paramètres*', '', '🌍 Langue : Français', '🔔 Notifications : Activées', '', "Plus d'options bientôt disponibles !"].join('\n'),
  joinChannels: ['📢 *Rejoins nos canaux*', '', "Pour utiliser le bot, tu dois d'abord rejoindre tous les canaux ci-dessous.", '', 'Clique sur chaque canal pour le rejoindre, puis appuie sur ✅ Vérifier.'].join('\n'),
  taskList: function(tasks: any[]): string {
    if (tasks.length === 0) return "📭 *Aucune tâche disponible pour le moment.*\n\nReviens plus tard !";
    var lines = tasks.map(function(t: any, i: number) { return (i + 1) + '. ' + t.icon + ' *' + t.title + '* - ' + t.reward + ' €'; });
    return '🎯 *Tâches Disponibles*\n\n' + lines.join('\n');
  },
  taskDetail: function(task: any): string {
    var lines = ['*' + task.icon + ' ' + task.title + '*', '', '📝 *Description :*', task.description || 'Aucune description', '', '💰 *Récompense :* ' + task.reward + ' €', '👥 *Participants :* ' + task.currentParticipants + '/' + (task.maxParticipants || '∞')];
    if (task.instructions) { lines.push(''); lines.push('📋 *Instructions :*'); lines.push(task.instructions); }
    return lines.join('\n');
  },
  dailyBonusClaimed: function(amount: string, streak: number): string {
    return ['🎁 *Bonus quotidien réclamé !*', '', '💰 +' + amount + ' €', '🔥 Série : ' + streak + ' jours', '', 'Reviens demain pour ton prochain bonus !'].join('\n');
  },
  promoCodeUsed: function(code: string, reward: string): string {
    return ['🎟 *Code promo utilisé !*', '', 'Code : ' + code, '💰 Récompense : +' + reward + ' €'].join('\n');
  },
  withdrawalRequested: function(amount: string): string {
    return ['✅ *Demande de retrait soumise*', '', '💰 Montant : ' + amount + ' €', '⏳ Statut : En attente de validation', '', 'Tu seras notifié dès que ton retrait sera traité.'].join('\n');
  },
  error: "❌ *Une erreur est survenue*\n\nVeuillez réessayer plus tard.\nSi le problème persiste, contacte le support.",
  notRegistered: "⚠️ *Tu n'es pas encore inscrit !*\n\nUtilise /start pour créer ton compte.",
  notAvailable: "⚠️ *Non disponible*\n\nCette fonctionnalité n'est pas encore disponible.",
};