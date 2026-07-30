import { Markup } from 'telegraf';

export const helpKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('⬅️ Back', 'HOME')],
  ]);