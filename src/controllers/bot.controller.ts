// ============================================================
// CASHBOT - Contrôleur Principal du Bot Telegram
// ============================================================

import { Telegraf, Markup } from 'telegraf';
import { BOT_CONFIG, BOT_MESSAGES, ADMIN_CONFIG, BOT_CONSTANTS } from '../config';
import { userService } from '../services/user.service';
import logger from '../helpers/logger';

export class BotController {
  private bot: Telegraf;

  constructor() {
    this.bot = new Telegraf(BOT_CONFIG.token);
    this.setupCommands();
    this.setupActions();
    this.setupHears();
  }

  private setupCommands(): void {
    this.bot.start(async (ctx: any) => {
      try {
        const user = await userService.register(ctx);
        if (!user.isOnboarded) {
          await ctx.reply(BOT_MESSAGES.welcome, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
              [Markup.button.callback('📋 Menu Principal', 'menu')],
            ]),
          });
          await ctx.reply(BOT_MESSAGES.joinChannels, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
              [Markup.button.url('📢 Rejoindre les canaux', 'https://t.me/cashbot')],
              [Markup.button.callback('✅ Vérifier', 'check_channels')],
            ]),
          });
        } else {
          await this.showMainMenu(ctx);
        }
      } catch (error) {
        logger.error('Erreur commande /start', { error, userId: ctx.from?.id });
        await ctx.reply(BOT_MESSAGES.error, { parse_mode: 'Markdown' });
      }
    });

    this.bot.command('menu', async (ctx: any) => {
      await this.showMainMenu(ctx);
    });

    this.bot.command('balance', async (ctx: any) => {
      try {
        const telegramId = String(ctx.from.id);
        const user = await userService.getByTelegramId(telegramId);
        if (!user) {
          await ctx.reply(BOT_MESSAGES.notRegistered, { parse_mode: 'Markdown' });
          return;
        }
        await ctx.reply(
          BOT_MESSAGES.balanceInfo(
            user.balance.toFixed(2),
            user.pendingBalance.toFixed(2),
            user.totalEarned.toFixed(2)
          ),
          { parse_mode: 'Markdown' }
        );
      } catch (error) {
        logger.error('Erreur commande /balance', { error, userId: ctx.from?.id });
        await ctx.reply(BOT_MESSAGES.error, { parse_mode: 'Markdown' });
      }
    });

    this.bot.command('tasks', async (ctx: any) => {
      await this.showTasks(ctx);
    });

    this.bot.command('profile', async (ctx: any) => {
      try {
        const telegramId = String(ctx.from.id);
        const user = await userService.getByTelegramId(telegramId);
        if (!user) {
          await ctx.reply(BOT_MESSAGES.notRegistered, { parse_mode: 'Markdown' });
          return;
        }
        await ctx.reply(BOT_MESSAGES.profileInfo(user), {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('🔙 Retour au menu', 'menu')],
          ]),
        });
      } catch (error) {
        logger.error('Erreur commande /profile', { error, userId: ctx.from?.id });
        await ctx.reply(BOT_MESSAGES.error, { parse_mode: 'Markdown' });
      }
    });

    this.bot.command('referral', async (ctx: any) => {
      try {
        const telegramId = String(ctx.from.id);
        const user = await userService.getByTelegramId(telegramId);
        if (!user) {
          await ctx.reply(BOT_MESSAGES.notRegistered, { parse_mode: 'Markdown' });
          return;
        }
        const referralLink = `https://t.me/${BOT_CONFIG.username}?start=${user.referralCode}`;
        await ctx.reply(BOT_MESSAGES.referralInfo(user, referralLink), {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.switchToChat('📤 Partager', `💰 Rejoins Cashbot et gagne de l'argent ! ${referralLink}`)],
            [Markup.button.callback('🔙 Retour au menu', 'menu')],
          ]),
        });
      } catch (error) {
        logger.error('Erreur commande /referral', { error, userId: ctx.from?.id });
        await ctx.reply(BOT_MESSAGES.error, { parse_mode: 'Markdown' });
      }
    });

    this.bot.command('withdraw', async (ctx: any) => {
      await ctx.reply(BOT_MESSAGES.withdrawalInfo, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('📱 Mobile Money', 'withdraw_momo')],
          [Markup.button.callback('₿ Crypto', 'withdraw_crypto')],
          [Markup.button.callback('💰 PayPal', 'withdraw_paypal')],
          [Markup.button.callback('🏦 Virement', 'withdraw_bank')],
          [Markup.button.callback('🔙 Retour au menu', 'menu')],
        ]),
      });
    });

    this.bot.command('daily', async (ctx: any) => {
      try {
        const telegramId = String(ctx.from.id);
        const user = await userService.getByTelegramId(telegramId);
        if (!user) {
          await ctx.reply(BOT_MESSAGES.notRegistered, { parse_mode: 'Markdown' });
          return;
        }
        const now = new Date();
        const lastBonus = user.lastDailyBonus;
        if (lastBonus) {
          const hoursSinceLastBonus = (now.getTime() - lastBonus.getTime()) / (1000 * 60 * 60);
          if (hoursSinceLastBonus < BOT_CONSTANTS.DAILY_BONUS_COOLDOWN) {
            const nextBonus = new Date(lastBonus.getTime() + BOT_CONSTANTS.DAILY_BONUS_COOLDOWN * 60 * 60 * 1000);
            await ctx.reply(
              `⏳ *Bonus déjà réclamé !*\n\nProchain bonus disponible le : ${nextBonus.toLocaleDateString('fr-FR')} à ${nextBonus.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
              { parse_mode: 'Markdown' }
            );
            return;
          }
        }
        const dailyAmount = 0.10 + (user.bonusStreak * 0.05);
        const newStreak = (user.bonusStreak || 0) + 1;
        await ctx.reply(BOT_MESSAGES.dailyBonusClaimed(dailyAmount.toFixed(2), newStreak), {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('🔙 Retour au menu', 'menu')],
          ]),
        });
      } catch (error) {
        logger.error('Erreur commande /daily', { error, userId: ctx.from?.id });
        await ctx.reply(BOT_MESSAGES.error, { parse_mode: 'Markdown' });
      }
    });

    this.bot.help(async (ctx: any) => {
      await ctx.reply(
        `🤖 *Cashbot - Aide*\n\n` +
        `/start - Démarrer le bot\n` +
        `/menu - Menu principal\n` +
        `/balance - Voir mon solde\n` +
        `/tasks - Tâches disponibles\n` +
        `/profile - Mon profil\n` +
        `/referral - Parrainage\n` +
        `/withdraw - Retraits\n` +
        `/daily - Bonus quotidien\n` +
        `/history - Historique\n` +
        `/notifications - Notifications\n` +
        `/support - Support\n` +
        `/settings - Paramètres\n` +
        `/help - Cette aide`,
        { parse_mode: 'Markdown' }
      );
    });

    this.bot.command('admin', async (ctx: any) => {
      if (!userService.isAdmin(ctx.from.id)) {
        await ctx.reply('⛔ Accès non autorisé.', { parse_mode: 'Markdown' });
        return;
      }
      await ctx.reply(
        '🛠 *Panneau Admin*\n\n' +
        '/admin_users - Voir les utilisateurs\n' +
        '/admin_stats - Statistiques\n' +
        '/admin_broadcast - Envoyer une annonce',
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.webApp('📊 Dashboard', ADMIN_CONFIG.panelUrl)],
          ]),
        }
      );
    });
  }

  private setupActions(): void {
    this.bot.action('menu', async (ctx: any) => {
      await ctx.answerCbQuery();
      await this.showMainMenu(ctx);
    });

    this.bot.action('check_channels', async (ctx: any) => {
      await ctx.answerCbQuery('🔍 Vérification en cours...');
      await ctx.reply('✅ *Tous les canaux sont vérifiés !*\n\nTu peux maintenant accéder au menu principal.', {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('📋 Menu Principal', 'menu')],
        ]),
      });
    });

    this.bot.action('balance', async (ctx: any) => {
      await ctx.answerCbQuery();
      try {
        const telegramId = String(ctx.from.id);
        const user = await userService.getByTelegramId(telegramId);
        if (user) {
          await ctx.reply(
            BOT_MESSAGES.balanceInfo(
              user.balance.toFixed(2),
              user.pendingBalance.toFixed(2),
              user.totalEarned.toFixed(2)
            ),
            {
              parse_mode: 'Markdown',
              ...Markup.inlineKeyboard([
                [Markup.button.callback('💸 Retirer', 'withdraw')],
                [Markup.button.callback('🔙 Retour', 'menu')],
              ]),
            }
          );
        }
      } catch (error) {
        logger.error('Erreur action balance', { error, userId: ctx.from?.id });
      }
    });

    this.bot.action('tasks', async (ctx: any) => {
      await ctx.answerCbQuery();
      await this.showTasks(ctx);
    });

    this.bot.action('profile', async (ctx: any) => {
      await ctx.answerCbQuery();
      try {
        const telegramId = String(ctx.from.id);
        const user = await userService.getByTelegramId(telegramId);
        if (user) {
          await ctx.reply(BOT_MESSAGES.profileInfo(user), {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
              [Markup.button.callback('🔙 Retour', 'menu')],
            ]),
          });
        }
      } catch (error) {
        logger.error('Erreur action profile', { error, userId: ctx.from?.id });
      }
    });

    this.bot.action('referral', async (ctx: any) => {
      await ctx.answerCbQuery();
      try {
        const telegramId = String(ctx.from.id);
        const user = await userService.getByTelegramId(telegramId);
        if (user) {
          const referralLink = `https://t.me/${BOT_CONFIG.username}?start=${user.referralCode}`;
          await ctx.reply(BOT_MESSAGES.referralInfo(user, referralLink), {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
              [Markup.button.switchToChat('📤 Partager', `💰 Gagne de l'argent avec Cashbot ! ${referralLink}`)],
              [Markup.button.callback('🔙 Retour', 'menu')],
            ]),
          });
        }
      } catch (error) {
        logger.error('Erreur action referral', { error, userId: ctx.from?.id });
      }
    });

    this.bot.action('withdraw', async (ctx: any) => {
      await ctx.answerCbQuery();
      await ctx.reply(BOT_MESSAGES.withdrawalInfo, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('📱 Mobile Money', 'withdraw_momo')],
          [Markup.button.callback('₿ Crypto', 'withdraw_crypto')],
          [Markup.button.callback('💰 PayPal', 'withdraw_paypal')],
          [Markup.button.callback('🏦 Virement', 'withdraw_bank')],
          [Markup.button.callback('🔙 Retour', 'menu')],
        ]),
      });
    });

    this.bot.action('history', async (ctx: any) => {
      await ctx.answerCbQuery();
      await ctx.reply(BOT_MESSAGES.historyInfo, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('🔙 Retour', 'menu')],
        ]),
      });
    });

    this.bot.action('bonus', async (ctx: any) => {
      await ctx.answerCbQuery();
      await ctx.reply(BOT_MESSAGES.bonusInfo, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('🎁 Bonus quotidien', 'daily_bonus')],
          [Markup.button.callback('🔙 Retour', 'menu')],
        ]),
      });
    });

    this.bot.action('notifications', async (ctx: any) => {
      await ctx.answerCbQuery();
      await ctx.reply(BOT_MESSAGES.notificationsInfo, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('🔙 Retour', 'menu')],
        ]),
      });
    });

    this.bot.action('support', async (ctx: any) => {
      await ctx.answerCbQuery();
      await ctx.reply(BOT_MESSAGES.supportInfo, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.url('💬 Contact Support', 'https://t.me/CashbotSupport')],
          [Markup.button.callback('🔙 Retour', 'menu')],
        ]),
      });
    });

    this.bot.action('settings', async (ctx: any) => {
      await ctx.answerCbQuery();
      await ctx.reply(BOT_MESSAGES.settingsInfo, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('🔙 Retour', 'menu')],
        ]),
      });
    });

    this.bot.action('daily_bonus', async (ctx: any) => {
      await ctx.answerCbQuery();
      await ctx.reply('Utilise /daily pour réclamer ton bonus quotidien !', {
        parse_mode: 'Markdown',
      });
    });

    const withdrawalMethods = ['withdraw_momo', 'withdraw_crypto', 'withdraw_paypal', 'withdraw_bank'];
    withdrawalMethods.forEach(method => {
      this.bot.action(method, async (ctx: any) => {
        await ctx.answerCbQuery('🔧 Fonctionnalité en cours de développement...');
      });
    });
  }

  private setupHears(): void {
    this.bot.hears(/.*/, async (ctx: any) => {
      if (ctx.message?.text?.startsWith('/')) return;
      await ctx.reply(
        'Désolé, je n\'ai pas compris. Utilise /menu pour voir les options disponibles.',
        Markup.inlineKeyboard([
          [Markup.button.callback('📋 Menu Principal', 'menu')],
        ])
      );
    });
  }

  private async showMainMenu(ctx: any): Promise<void> {
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('💰 Mon solde', 'balance'), Markup.button.callback('🎯 Tâches', 'tasks')],
      [Markup.button.callback('👤 Profil', 'profile'), Markup.button.callback('👥 Parrainage', 'referral')],
      [Markup.button.callback('💸 Retraits', 'withdraw'), Markup.button.callback('📜 Historique', 'history')],
      [Markup.button.callback('🎁 Bonus', 'bonus'), Markup.button.callback('📨 Notifications', 'notifications')],
      [Markup.button.callback('❓ Support', 'support'), Markup.button.callback('⚙ Paramètres', 'settings')],
    ]);
    await ctx.reply(BOT_MESSAGES.menuPrincipal, {
      parse_mode: 'Markdown',
      ...keyboard,
    });
  }

  private async showTasks(ctx: any): Promise<void> {
    await ctx.reply(BOT_MESSAGES.taskList([]), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Retour au menu', 'menu')],
      ]),
    });
  }

  async start(): Promise<void> {
    try {
      if (BOT_CONFIG.useWebhook && BOT_CONFIG.webhookUrl) {
        await this.bot.telegram.setWebhook(BOT_CONFIG.webhookUrl);
        logger.info('Bot démarré en mode webhook', { url: BOT_CONFIG.webhookUrl });
      } else {
        await this.bot.launch();
        logger.info('Bot démarré en mode polling');
      }
      const botInfo = await this.bot.telegram.getMe();
      logger.info('Informations du bot', {
        username: botInfo.username,
        id: botInfo.id,
      });
    } catch (error) {
      logger.error('Erreur lors du démarrage du bot', { error });
      throw error;
    }
  }

  async stop(): Promise<void> {
    this.bot.stop();
    logger.info('Bot arrêté');
  }

  getBot(): Telegraf {
    return this.bot;
  }
}

export const botController = new BotController();