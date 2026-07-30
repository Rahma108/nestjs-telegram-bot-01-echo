import { Markup } from 'telegraf';

export const profileKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('⬅️ Back', 'HOME')],
  ]);