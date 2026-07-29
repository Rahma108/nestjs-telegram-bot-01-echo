import { Injectable } from '@nestjs/common';
import { Help, On, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BOT_MESSAGES } from './constants/messages';

@Update()
@Injectable()
export class TelegramService {
  @Start()
    async onStart(ctx: Context) {
    const firstName = ctx.from?.first_name ?? 'User';
    console.log(ctx.from);
    await ctx.reply(BOT_MESSAGES.WELCOME(firstName));
    }

    @Help()
    async onHelp(ctx: Context) {
    await ctx.reply(BOT_MESSAGES.HELP);
  }

  @On('text')
  async onMessage(ctx: Context) {
      if (!ctx.message || !('text' in ctx.message)) return;

      await ctx.reply(`You said: ${ctx.message.text}`);
    }
}

