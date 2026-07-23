// ============================================================
// CASHBOT - Contrôleur Principal du Bot Telegram
// ============================================================

import { Telegraf, Markup } from 'telegraf';
import { BOT_CONFIG, BOT_MESSAGES, ADMIN_CONFIG, BOT_CONSTANTS } from '../config';
import { userService } from '../services/user.service';
import { transactionService } from '../services/transaction.service';
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
    // /start - Inscription
    this.bot.start(async (ctx: any) => {
      try {
        const user = await userService.register(ctx);
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
      } catch (error) {
        logger.error('Erreur /start', { error });
        await ctx.reply(BOT_MESSAGES.error, { parse_mode: 'Markdown' });
      }
    });

    // /menu
    this.bot.command('menu', async (ctx: any) => { await this.showMainMenu(ctx); });

    // /balance
    this.bot.command('balance', async (ctx: any) => {
      try {
        const user = await userService.getByTelegramId(String(ctx.from.id));
        if (!user) { await ctx.reply(BOT_MESSAGES.notRegistered, { parse_mode: 'Markdown' }); return; }
        const transactions = await transactionService.getTransactionHistory(user.id, 5);
        let msg = BOT_MESSAGES.balanceInfo(user.balance.toFixed(2), user.pendingBalance.toFixed(2), user.totalEarned.toFixed(2));
        if (transactions.length > 0) {
          msg += '\n\n📜 *Dernières transactions :*\n' + transactions.map((t: any) =>
            `${t.createdAt.toLocaleDateString('fr-FR')} ${t.amount > 0 ? '✅' : '❌'} ${t.amount > 0 ? '+' : ''}${t.amount.toFixed(2)} € - ${t.description}`
          ).join('\n');
        }
        await ctx.reply(msg, {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('💸 Retirer', 'withdraw')],
            [Markup.button.callback('🔙 Retour', 'menu')],
          ]),
        });
      } catch (error) {
        logger.error('Erreur /balance', { error });
        await ctx.reply(BOT_MESSAGES.error, { parse_mode: 'Markdown' });
      }
    });

    // /tasks
    this.bot.command('tasks', async (ctx: any) => { await this.showTasks(ctx); });

    // /profile
    this.bot.command('profile', async (ctx: any) => {
      try {
        const user = await userService.getByTelegramId(String(ctx.from.id));
        if (!user) { await ctx.reply(BOT_MESSAGES.notRegistered, { parse_mode: 'Markdown' }); return; }
        await ctx.reply(BOT_MESSAGES.profileInfo(user), {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([[Markup.button.callback('🔙 Retour au menu', 'menu')]]),
        });
      } catch (error) {
        logger.error('Erreur /profile', { error });
        await ctx.reply(BOT_MESSAGES.error, { parse_mode: 'Markdown' });
      }
    });

    // /referral
    this.bot.command('referral', async (ctx: any) => {
      try {
        const user = await userService.getByTelegramId(String(ctx.from.id));
        if (!user) { await ctx.reply(BOT_MESSAGES.notRegistered, { parse_mode: 'Markdown' }); return; }
        const referralLink = `https://t.me/${BOT_CONFIG.username}?start=${user.referralCode}`;
        await ctx.reply(BOT_MESSAGES.referralInfo(user, referralLink), {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.switchToChat('📤 Partager', `💰 Rejoins Cashbot et gagne de l'argent ! ${referralLink}`)],
            [Markup.button.callback('🔙 Retour au menu', 'menu')],
          ]),
        });
      } catch (error) {
        logger.error('Erreur /referral', { error });
        await ctx.reply(BOT_MESSAGES.error, { parse_mode: 'Markdown' });
      }
    });

    // /withdraw
    this.bot.command('withdraw', async (ctx: any) => {
      const user = await userService.getByTelegramId(String(ctx.from.id));
      if (!user) { await ctx.reply(BOT_MESSAGES.notRegistered, { parse_mode: 'Markdown' }); return; }
      await ctx.reply(`💸 *Retraits*\n\n💰 Solde disponible : ${user.balance.toFixed(2)} €\n\nChoisis une méthode :`, {
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

    // /daily
    this.bot.command('daily', async (ctx: any) => {
      try {
        const user = await userService.getByTelegramId(String(ctx.from.id));
        if (!user) { await ctx.reply(BOT_MESSAGES.notRegistered, { parse_mode: 'Markdown' }); return; }
        const now = new Date();
        const lastBonus = user.lastDailyBonus;
        if (lastBonus) {
          const hoursSince = (now.getTime() - lastBonus.getTime()) / (1000 * 60 * 60);
          if (hoursSince < BOT_CONSTANTS.DAILY_BONUS_COOLDOWN) {
            const nextBonus = new Date(lastBonus.getTime() + BOT_CONSTANTS.DAILY_BONUS_COOLDOWN * 60 * 60 * 1000);
            await ctx.reply(`⏳ *Bonus déjà réclamé !*\n\nProchain bonus : ${nextBonus.toLocaleDateString('fr-FR')} à ${nextBonus.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, { parse_mode: 'Markdown' });
            return;
          }
        }
        const { amount, streak } = await transactionService.creditDailyBonus(user.id);
        await ctx.reply(BOT_MESSAGES.dailyBonusClaimed(amount.toFixed(2), streak), {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([[Markup.button.callback('🔙 Retour au menu', 'menu')]]),
        });
      } catch (error) {
        logger.error('Erreur /daily', { error });
        await ctx.reply(BOT_MESSAGES.error, { parse_mode: 'Markdown' });
      }
    });

    // /history
    this.bot.command('history', async (ctx: any) => {
      try {
        const user = await userService.getByTelegramId(String(ctx.from.id));
        if (!user) { await ctx.reply(BOT_MESSAGES.notRegistered, { parse_mode: 'Markdown' }); return; }
        const transactions = await transactionService.getTransactionHistory(user.id);
        const withdrawals = await transactionService.getWithdrawalHistory(user.id);
        let msg = '📜 *Ton Historique*\n\n';
        if (transactions.length > 0) {
          msg += '*Transactions :*\n' + transactions.map((t: any) =>
            `${t.createdAt.toLocaleDateString('fr-FR')} ${t.amount > 0 ? '✅ +' : '❌ '}${t.amount.toFixed(2)} € - ${t.description}`
          ).join('\n');
        } else {
          msg += 'Aucune transaction.\n';
        }
        if (withdrawals.length > 0) {
          msg += '\n\n*Retraits :*\n' + withdrawals.map((w: any) =>
            `${w.createdAt.toLocaleDateString('fr-FR')} ${w.amount.toFixed(2)} € - ${w.method} (${w.status})`
          ).join('\n');
        }
        await ctx.reply(msg, {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([[Markup.button.callback('🔙 Retour', 'menu')]]),
        });
      } catch (error) {
        logger.error('Erreur /history', { error });
        await ctx.reply(BOT_MESSAGES.error, { parse_mode: 'Markdown' });
      }
    });

    // /notifications
    this.bot.command('notifications', async (ctx: any) => {
      try {
        const user = await userService.getByTelegramId(String(ctx.from.id));
        if (!user) { await ctx.reply(BOT_MESSAGES.notRegistered, { parse_mode: 'Markdown' }); return; }
        const notifs = await transactionService.getUnreadNotifications(user.id);
        if (notifs.length === 0) {
          await ctx.reply("📨 *Notifications*\n\nTu n'as aucune notification non lue.", {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([[Markup.button.callback('🔙 Retour', 'menu')]]),
          });
        } else {
          let msg = '📨 *Notifications*\n\n';
          for (const n of notifs) {
            msg += `• *${n.title}* : ${n.message}\n`;
            await transactionService.markNotificationRead(n.id);
          }
          await ctx.reply(msg, { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback('🔙 Retour', 'menu')]]) });
        }
      } catch (error) {
        logger.error('Erreur /notifications', { error });
        await ctx.reply(BOT_MESSAGES.error, { parse_mode: 'Markdown' });
      }
    });

    // /bonus
    this.bot.command('bonus', async (ctx: any) => {
      await ctx.reply(BOT_MESSAGES.bonusInfo, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('🎁 Bonus quotidien', 'daily_bonus')],
          [Markup.button.callback('🎟 Utiliser un code promo', 'promo_code')],
          [Markup.button.callback('🔙 Retour', 'menu')],
        ]),
      });
    });

    // /support
    this.bot.command('support', async (ctx: any) => {
      await ctx.reply(BOT_MESSAGES.supportInfo, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.url('💬 Contact Support', 'https://t.me/CashbotSupport')],
          [Markup.button.callback('🔙 Retour', 'menu')],
        ]),
      });
    });

    // /settings
    this.bot.command('settings', async (ctx: any) => {
      await ctx.reply(BOT_MESSAGES.settingsInfo, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.callback('🔙 Retour', 'menu')]]),
      });
    });

    // /help
    this.bot.help(async (ctx: any) => {
      await ctx.reply(
        '🤖 *Cashbot - Aide*\n\n/start - Démarrer\n/menu - Menu principal\n/balance - Solde\n/tasks - Tâches\n/profile - Profil\n/referral - Parrainage\n/withdraw - Retraits\n/daily - Bonus quotidien\n/history - Historique\n/notifications - Notifications\n/bonus - Bonus\n/support - Support\n/settings - Paramètres\n/help - Aide',
        { parse_mode: 'Markdown' }
      );
    });
  }

  private setupActions(): void {
    this.bot.action('menu', async (ctx: any) => { await ctx.answerCbQuery(); await this.showMainMenu(ctx); });

    this.bot.action('check_channels', async (ctx: any) => {
      await ctx.answerCbQuery('🔍 Vérification...');
      try {
        const user = await userService.getByTelegramId(String(ctx.from.id));
        if (user) {
          await userService.updateChannelsJoined(user.id);
        }
      } catch {}
      await ctx.reply('✅ *Vérification réussie !*\n\nTu peux accéder au menu principal.', {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.callback('📋 Menu Principal', 'menu')]]),
      });
    });

    this.bot.action('balance', async (ctx: any) => {
      await ctx.answerCbQuery();
      const user = await userService.getByTelegramId(String(ctx.from.id));
      if (user) {
        await ctx.reply(BOT_MESSAGES.balanceInfo(user.balance.toFixed(2), user.pendingBalance.toFixed(2), user.totalEarned.toFixed(2)), {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('💸 Retirer', 'withdraw')],
            [Markup.button.callback('🔙 Retour', 'menu')],
          ]),
        });
      }
    });

    this.bot.action('tasks', async (ctx: any) => { await ctx.answerCbQuery(); await this.showTasks(ctx); });
    this.bot.action('profile', async (ctx: any) => {
      await ctx.answerCbQuery();
      const user = await userService.getByTelegramId(String(ctx.from.id));
      if (user) {
        await ctx.reply(BOT_MESSAGES.profileInfo(user), { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback('🔙 Retour', 'menu')]]) });
      }
    });

    this.bot.action('referral', async (ctx: any) => {
      await ctx.answerCbQuery();
      const user = await userService.getByTelegramId(String(ctx.from.id));
      if (user) {
        const link = `https://t.me/${BOT_CONFIG.username}?start=${user.referralCode}`;
        await ctx.reply(BOT_MESSAGES.referralInfo(user, link), {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.switchToChat('📤 Partager', `💰 Gagne de l'argent avec Cashbot ! ${link}`)],
            [Markup.button.callback('🔙 Retour', 'menu')],
          ]),
        });
      }
    });

    this.bot.action('withdraw', async (ctx: any) => {
      await ctx.answerCbQuery();
      const user = await userService.getByTelegramId(String(ctx.from.id));
      if (!user) return;
      await ctx.reply(`💸 *Retraits*\n\n💰 Solde : ${user.balance.toFixed(2)} €\n\nChoisis une méthode :`, {
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

    // Méthodes de retrait - demandent le montant
    const methods = [
      { action: 'withdraw_momo', label: 'Mobile Money' },
      { action: 'withdraw_crypto', label: 'Crypto' },
      { action: 'withdraw_paypal', label: 'PayPal' },
      { action: 'withdraw_bank', label: 'Virement bancaire' },
    ];
    methods.forEach(m => {
      this.bot.action(m.action, async (ctx: any) => {
        await ctx.answerCbQuery();
        ctx.session = ctx.session || {};
        ctx.session.withdrawMethod = m.action.replace('withdraw_', '').toUpperCase();
        ctx.session.step = 'awaiting_withdraw_amount';
        await ctx.reply(`💸 *Retrait ${m.label}*\n\n💰 Montant minimum : ${BOT_CONSTANTS.MIN_WITHDRAWAL_AMOUNT} €\n📝 Envoie le montant à retirer (ex: 10) :`, { parse_mode: 'Markdown' });
      });
    });

    // Gestion des réponses pour les retraits
    this.bot.hears(/^(\d+(?:\.\d{1,2})?)$/, async (ctx: any) => {
      if (ctx.session?.step !== 'awaiting_withdraw_amount') return;
      const amount = parseFloat(ctx.match[1]);
      const user = await userService.getByTelegramId(String(ctx.from.id));
      if (!user) return;
      try {
        const method = ctx.session.withdrawMethod || 'MOBILE_MONEY';
        const withdrawal = await transactionService.createWithdrawal(user.id, amount, method, { method });
        ctx.session.step = null;
        await ctx.reply(BOT_MESSAGES.withdrawalRequested(amount.toFixed(2)), {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([[Markup.button.callback('🔙 Retour', 'menu')]]),
        });
      } catch (error: any) {
        await ctx.reply(`❌ *Erreur*\n\n${error.message}`, { parse_mode: 'Markdown' });
      }
    });

    this.bot.action('history', async (ctx: any) => {
      await ctx.answerCbQuery();
      const user = await userService.getByTelegramId(String(ctx.from.id));
      if (!user) return;
      const transactions = await transactionService.getTransactionHistory(user.id);
      const withdrawals = await transactionService.getWithdrawalHistory(user.id);
      let msg = '📜 *Ton Historique*\n\n';
      if (transactions.length > 0) {
        msg += '*Transactions :*\n' + transactions.slice(0, 10).map((t: any) =>
          `${t.createdAt.toLocaleDateString('fr-FR')} ${t.amount > 0 ? '✅ +' : '❌ '}${t.amount.toFixed(2)} €`
        ).join('\n');
      } else {
        msg += 'Aucune transaction.\n';
      }
      if (withdrawals.length > 0) {
        msg += '\n\n*Retraits :*\n' + withdrawals.slice(0, 5).map((w: any) =>
          `${w.createdAt.toLocaleDateString('fr-FR')} ${w.amount.toFixed(2)} € - ${w.status}`
        ).join('\n');
      }
      await ctx.reply(msg, { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback('🔙 Retour', 'menu')]]) });
    });

    this.bot.action('bonus', async (ctx: any) => {
      await ctx.answerCbQuery();
      await ctx.reply(BOT_MESSAGES.bonusInfo, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('🎁 Bonus quotidien', 'daily_bonus')],
          [Markup.button.callback('🎟 Code promo', 'promo_code')],
          [Markup.button.callback('🔙 Retour', 'menu')],
        ]),
      });
    });

    this.bot.action('daily_bonus', async (ctx: any) => {
      await ctx.answerCbQuery();
      try {
        const user = await userService.getByTelegramId(String(ctx.from.id));
        if (!user) return;
        const { amount, streak } = await transactionService.creditDailyBonus(user.id);
        await ctx.reply(BOT_MESSAGES.dailyBonusClaimed(amount.toFixed(2), streak), {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([[Markup.button.callback('🔙 Retour', 'menu')]]),
        });
      } catch (error: any) {
        await ctx.reply(`⚠️ ${error.message}`, { parse_mode: 'Markdown' });
      }
    });

    this.bot.action('promo_code', async (ctx: any) => {
      await ctx.answerCbQuery();
      ctx.session = ctx.session || {};
      ctx.session.step = 'awaiting_promo_code';
      await ctx.reply('🎟 *Code promo*\n\nEnvoie ton code promo :', { parse_mode: 'Markdown' });
    });

    // Gestion réponse code promo
    this.bot.hears(/^[A-Z0-9]{4,20}$/i, async (ctx: any) => {
      if (ctx.session?.step !== 'awaiting_promo_code') return;
      const code = ctx.match[0].toUpperCase();
      const user = await userService.getByTelegramId(String(ctx.from.id));
      if (!user) return;
      try {
        const reward = await transactionService.usePromoCode(user.id, code);
        ctx.session.step = null;
        await ctx.reply(BOT_MESSAGES.promoCodeUsed(code, reward.toFixed(2)), {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([[Markup.button.callback('🔙 Retour', 'menu')]]),
        });
      } catch (error: any) {
        await ctx.reply(`❌ ${error.message}`, { parse_mode: 'Markdown' });
      }
    });

    this.bot.action('notifications', async (ctx: any) => {
      await ctx.answerCbQuery();
      const user = await userService.getByTelegramId(String(ctx.from.id));
      if (!user) return;
      const notifs = await transactionService.getUnreadNotifications(user.id);
      if (notifs.length === 0) {
        await ctx.reply("📨 *Notifications*\n\nTu n'as aucune notification.", { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback('🔙 Retour', 'menu')]]) });
      } else {
        let msg = '📨 *Notifications*\n\n';
        for (const n of notifs) {
          msg += `• *${n.title}* : ${n.message}\n`;
          await transactionService.markNotificationRead(n.id);
        }
        await ctx.reply(msg, { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback('🔙 Retour', 'menu')]]) });
      }
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
        ...Markup.inlineKeyboard([[Markup.button.callback('🔙 Retour', 'menu')]]),
      });
    });
  }

  private setupHears(): void {
    this.bot.hears(/.*/, async (ctx: any) => {
      if (ctx.message?.text?.startsWith('/')) return;
      if (ctx.session?.step) return; // En attente d'une réponse (montant, code promo)
      await ctx.reply(
        'Désolé, je n\'ai pas compris. Utilise /menu pour voir les options.',
        Markup.inlineKeyboard([[Markup.button.callback('📋 Menu Principal', 'menu')]])
      );
    });
  }

  private async showMainMenu(ctx: any): Promise<void> {
    await ctx.reply(BOT_MESSAGES.menuPrincipal, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('💰 Mon solde', 'balance'), Markup.button.callback('🎯 Tâches', 'tasks')],
        [Markup.button.callback('👤 Profil', 'profile'), Markup.button.callback('👥 Parrainage', 'referral')],
        [Markup.button.callback('💸 Retraits', 'withdraw'), Markup.button.callback('📜 Historique', 'history')],
        [Markup.button.callback('🎁 Bonus', 'bonus'), Markup.button.callback('📨 Notifications', 'notifications')],
        [Markup.button.callback('❓ Support', 'support'), Markup.button.callback('⚙ Paramètres', 'settings')],
      ]),
    });
  }

  private async showTasks(ctx: any): Promise<void> {
    try {
      const user = await userService.getByTelegramId(String(ctx.from.id));
      if (!user) { await ctx.reply(BOT_MESSAGES.notRegistered, { parse_mode: 'Markdown' }); return; }
      const tasks = await transactionService.getAvailableTasks(user.id);
      if (tasks.length === 0) {
        await ctx.reply("📭 *Aucune tâche disponible.*\n\nReviens plus tard !", {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([[Markup.button.callback('🔙 Retour au menu', 'menu')]]),
        });
        return;
      }
      for (const task of tasks) {
        const buttons: any[] = [];
        if (task.linkUrl) {
          buttons.push([Markup.button.url('🔗 Lien', task.linkUrl)]);
        }
        if (task.validationMode === 'MANUAL') {
          buttons.push([Markup.button.callback('📤 Envoyer une preuve', 'proof_' + task.id)]);
        } else {
          buttons.push([Markup.button.callback('✅ Valider', 'validate_' + task.id)]);
        }
        buttons.push([Markup.button.callback('🔙 Retour au menu', 'menu')]);

        await ctx.reply(BOT_MESSAGES.taskDetail(task), {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard(buttons),
        });
      }
    } catch (error) {
      logger.error('Erreur showTasks', { error });
      await ctx.reply(BOT_MESSAGES.error, { parse_mode: 'Markdown' });
    }
  }

  async start(): Promise<void> {
    try {
      if (BOT_CONFIG.useWebhook && BOT_CONFIG.webhookUrl) {
        await this.bot.telegram.setWebhook(BOT_CONFIG.webhookUrl);
        logger.info('Bot démarré en mode webhook');
      } else {
        await this.bot.launch();
        logger.info('Bot démarré en mode polling');
      }
      const botInfo = await this.bot.telegram.getMe();
      logger.info('Bot info', { username: botInfo.username });
    } catch (error) {
      logger.error('Erreur démarrage bot', { error });
    }
  }

  async stop(): Promise<void> {
    this.bot.stop();
    logger.info('Bot arrêté');
  }

  getBot(): Telegraf { return this.bot; }
}

export const botController = new BotController();