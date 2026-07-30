import { Markup } from 'telegraf';

export const taskKeyboard = (
  taskId: string,
  completed: boolean,
) => {
        return Markup.inlineKeyboard([
            [
            Markup.button.callback(
                completed ? '↩ Undo' : '✅ Complete',
                `COMPLETE_${taskId}`,
            ),

            Markup.button.callback(
                '🗑 Delete',
                `DELETE_${taskId}`,
            ),
            Markup.button.callback(
                '✏️ Edit',
                `EDIT_${taskId}`,
                ),
            ],
        ]);
};