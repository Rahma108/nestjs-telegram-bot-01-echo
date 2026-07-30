import { Markup } from 'telegraf';

export const trashKeyboard = (taskId: string) =>
    Markup.inlineKeyboard([
        [
        Markup.button.callback(
            '♻️ Restore',
            `RESTORE_${taskId}`,
        ),
        Markup.button.callback(
            '🗑 Delete Forever',
            `ASK_DELETE_FOREVER_${taskId}`
            )
        ],
]);