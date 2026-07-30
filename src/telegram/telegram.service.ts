import { Injectable } from '@nestjs/common';
import { Action, Command, On, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';

import {
  helpKeyboard,
  homeKeyboard,
  profileKeyboard,
} from './keyboards';

import {
  COMMON_MESSAGES,
  ERROR_MESSAGES,
  HELP_MESSAGES,
  REGISTRATION_MESSAGES,
} from './constants';

import { RegistrationStep } from './state/user-state.interface';
import { RegistrationService } from './registration/registration.service';

@Update()
@Injectable()
export class TelegramService {
  constructor(
    private readonly registrationService: RegistrationService,
  ) {}

  @Start()
  async onStart(ctx: Context) {
    const firstName = ctx.from?.first_name ?? 'User';

    await ctx.reply(
      COMMON_MESSAGES.WELCOME(firstName),
      homeKeyboard(),
    );
  }

  @Action('PING')
  async pingButton(ctx: Context) {
    await ctx.answerCbQuery();
    await ctx.reply('🏓 Pong!');
  }

  @Action('PROFILE')
  async profile(ctx: Context) {
    await ctx.answerCbQuery();

    const user = ctx.from;

    await ctx.editMessageText(
      `👤 Profile

Name: ${user?.first_name}
Username: @${user?.username ?? 'Not set'}
ID: ${user?.id}`,
      {
        reply_markup: profileKeyboard().reply_markup,
      },
    );
  }

  @Action('HOME')
  async home(ctx: Context) {
    await ctx.answerCbQuery();

    const firstName = ctx.from?.first_name ?? 'User';

    await ctx.editMessageText(
      COMMON_MESSAGES.WELCOME(firstName),
      {
        reply_markup: homeKeyboard().reply_markup,
      },
    );
  }

  @Action('HELP')
  async helpButton(ctx: Context) {
    await ctx.answerCbQuery();

    await ctx.editMessageText(
      HELP_MESSAGES.COMMANDS,
      {
        reply_markup: helpKeyboard().reply_markup,
      },
    );
  }

    @Command('register')
    async register(ctx: Context) {
      const userId = ctx.from!.id;

      const state = this.registrationService.getState(userId);

      if (state.step !== RegistrationStep.NONE) {
        await ctx.reply(
          REGISTRATION_MESSAGES.ALREADY_REGISTERED,
        );
        return;
      }

      this.registrationService.start(userId);

      await ctx.reply(REGISTRATION_MESSAGES.ASK_NAME);
    }
      @Command('status')
    async status(ctx: Context) {
      const userId = ctx.from!.id;

      const state =
        this.registrationService.status(userId);

      await ctx.reply(
        REGISTRATION_MESSAGES.STATUS(
          state.step,
        ),
      );
    }
  @Command('cancel')
    async cancel(ctx: Context) {
      const userId = ctx.from!.id;

      this.registrationService.cancel(userId);

      await ctx.reply(
        REGISTRATION_MESSAGES.CANCELLED,
      );
    }

  @On('text')
  async onMessage(ctx: Context) {
    if (!ctx.message || !('text' in ctx.message)) return;

    const text = ctx.message.text;

    if (text.startsWith('/')) return;

    const userId = ctx.from!.id;

    const state = this.registrationService.getState(userId);

    switch (state.step) {
      case RegistrationStep.WAITING_NAME:
        this.registrationService.handleName(
          userId,
          text,
        );

        await ctx.reply(REGISTRATION_MESSAGES.ASK_AGE);
        break;

      case RegistrationStep.WAITING_AGE: {
        const age = Number(text);

        if (isNaN(age)) {
          await ctx.reply(ERROR_MESSAGES.INVALID_AGE);
          return;
        }

        if (age < 10 || age > 100) {
          await ctx.reply(ERROR_MESSAGES.INVALID_AGE_RANGE);
          return;
        }

        const result = this.registrationService.handleAge(
          userId,
          age,
        );

        await ctx.reply(
          REGISTRATION_MESSAGES.COMPLETED(
            result.name!,
            result.age,
          ),
        );

        break;
      }

      default:
        await ctx.reply(
          COMMON_MESSAGES.UNKNOWN_MESSAGE(text),
        );
    }
  }
}