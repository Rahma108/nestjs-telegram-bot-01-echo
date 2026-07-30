import { Markup } from "telegraf";
import { InlineKeyboardButton } from "telegraf/types";

export const paginationKeyboard = (
  page: number,
  totalPages: number,
) => {
 const buttons: InlineKeyboardButton.CallbackButton[] = [];

    if (page > 1) {
        buttons.push(
        Markup.button.callback(
            '⬅️ Previous',
            `TASKS_PAGE_${page - 1}`,
        ),
        );
    }

    if (page < totalPages) {
        buttons.push(
        Markup.button.callback(
            'Next ➡️',
            `TASKS_PAGE_${page + 1}`,
        ),
        );
    }

    if (buttons.length === 0) {
        return Markup.inlineKeyboard([]);
    }

    return Markup.inlineKeyboard([
        buttons,
    ]);
};