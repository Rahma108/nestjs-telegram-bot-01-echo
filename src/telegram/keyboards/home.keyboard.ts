import { Markup } from 'telegraf';

export const homeKeyboard = () =>
    Markup.inlineKeyboard([
        [Markup.button.callback('👤 My Profile', 'PROFILE')],
        [Markup.button.callback('ℹ️ Help', 'HELP')],
        [Markup.button.callback('🏓 Ping', 'PING')],
    ]);