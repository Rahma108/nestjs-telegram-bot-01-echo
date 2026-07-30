import { Injectable } from '@nestjs/common';
import { Action, Command, Help, On, Start, Update } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { BOT_MESSAGES } from './constants/messages';

@Update()
@Injectable()
export class TelegramService {
    // Telegram Bots وهي Inline Keyboard.
  @Start()
    async onStart(ctx: Context) {
    const firstName = ctx.from?.first_name ?? 'User';
    // await ctx.reply(BOT_MESSAGES.WELCOME(firstName));
    await ctx.reply(  
      BOT_MESSAGES.WELCOME(firstName),
      Markup.inlineKeyboard([
      [Markup.button.callback('👤 My Profile', 'PROFILE')],
      [Markup.button.callback('ℹ️ Help', 'HELP')],
      [Markup.button.callback('🏓 Ping', 'PING')],
    ]) );
    }
      // /ping
    @Action('PING')
    async pingButton(ctx: Context) {
      await ctx.answerCbQuery();

      await ctx.reply('🏓 Pong!');
    }

    @Action('PROFILE')
    async profile(ctx: Context) {
      await ctx.answerCbQuery();

      const user = ctx.from;

      await ctx.reply(
    `👤 Profile

    Name: ${user?.first_name}
    Username: @${user?.username}
    ID: ${user?.id}`,
      );
    }

    @Action('HELP')
    async helpButton(ctx: Context) {
      await ctx.answerCbQuery();

      await ctx.reply(BOT_MESSAGES.HELP);
    }

    @Help()
    async onHelp(ctx: Context) {
    await ctx.reply(BOT_MESSAGES.HELP);
  }


    @On('text')
    async onMessage(ctx: Context) {
      if (!ctx.message || !('text' in ctx.message)) return;
      const text = ctx.message.text;
      // تجاهل أي Command
      if (text.startsWith('/')) return;

      await ctx.reply(`You said: ${text}`);
}


  

}

