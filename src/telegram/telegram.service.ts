import { Injectable } from '@nestjs/common';
import { Action, Command, On, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';

import {
  helpKeyboard,
  homeKeyboard,
  profileKeyboard,
  taskKeyboard,
  trashKeyboard,
} from './keyboards';

import {
  COMMON_MESSAGES,
  ERROR_MESSAGES,
  HELP_MESSAGES,
  REGISTRATION_MESSAGES,
  TASK_MESSAGES,
} from './constants';

import { RegistrationStep } from './state/user-state.interface';
import { RegistrationService } from './registration/registration.service';
import { TasksService } from 'src/task/tasks/tasks.service';
import { Types } from 'mongoose';
import { paginationKeyboard } from './keyboards/pagintion.keyboards';
import { UserService } from 'src/user/user.service';
import { ITask } from 'src/common/interfaces';
import { HTaskDocument } from 'src/DB/model';

@Update()
@Injectable()
export class TelegramService {
  constructor(
    private readonly registrationService: RegistrationService,
      private readonly tasksService: TasksService,
      private readonly userService: UserService,
  ) {}

  @Start()
    async onStart(ctx: Context) {
      await this.userService.createOrUpdate({
        telegramId: ctx.from!.id,
        firstName: ctx.from!.first_name,
        username: ctx.from!.username,
        languageCode: ctx.from!.language_code,
      });
      const user = await this.userService.findByTelegramId(ctx.from!.id);
      console.log('After /start =>', user);

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

    @Command('add')
    async add(ctx: Context) {
      const userId = ctx.from!.id;

      const state =
        this.registrationService.getState(userId);

        console.log(state);

      if (state.step !== RegistrationStep.NONE) {
        await ctx.reply(
          '⚠️ Finish the current process first.',
        );
        return;
      }

      this.registrationService.startTask(userId);

      await ctx.reply(
        TASK_MESSAGES.ASK_TITLE,
      );
    }
     // هنا أمر /tasks
  @Command('tasks')
  async tasks(ctx: Context) {
    await this.showTasks(ctx, 1);
  }

  // هنا نحط الـ function الجديدة
  private async showTasks(
  ctx: Context,
  page = 1,
) {
  const limit = 5;

  const telegramId = ctx.from?.id;

  if (!telegramId) {
    await ctx.reply('❌ User not found.');
    return;
  }

  const user = await this.userService.findByTelegramId(
    telegramId,
  );

  if (!user) {
    await ctx.reply('❌ User not found.');
    return;
  }

  const result = await this.tasksService.getTasks(
    user._id,
    page,
    limit,
  );

  if (!result.tasks.length) {
    await ctx.reply('📭 No tasks found.');
    return;
  }

  for (const task of result.tasks) {
    await ctx.reply(
      `📌 ${task.title}

${task.completed ? '✅ Completed' : '⬜ Pending'}`,
      taskKeyboard(
        task._id.toString(),
        task.completed,
      ),
    );
  }

  await ctx.reply(
    `📄 Page ${result.page}/${result.totalPages}`,
    paginationKeyboard(
      result.page,
      result.totalPages,
    ),
  );
}


  // هنا الـ Action بتاع Next / Previous
  @Action(/^TASKS_PAGE_(\d+)$/)
  async paginateTasks(ctx: Context) {

    await ctx.answerCbQuery();

    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
      return;
    }


    const page = Number(
      ctx.callbackQuery.data.replace(
        'TASKS_PAGE_',
        '',
      ),
    );


    await this.showTasks(
      ctx,
      page,
    );
  }

    @Action(/^COMPLETE_(.+)$/)
      async completeTask(ctx: Context) {
        await ctx.answerCbQuery();

        if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
          return;
        }

        const taskId = ctx.callbackQuery.data.replace(
          'COMPLETE_',
          '',
        );

        const task = await this.tasksService.toggleTask(
          new Types.ObjectId(taskId),
        );

        if (!task) {
          await ctx.reply('❌ Task not found.');
          return;
        }

        await ctx.editMessageText(
          `${task.completed ? '✅' : '⬜'} ${task.title}`,
          {
            reply_markup: taskKeyboard(
              task._id.toString(),
              task.completed,
            ).reply_markup,
          },
        );
}


     @Action(/^ASK_DELETE_FOREVER_(.+)$/)
async askDeleteForever(ctx: Context) {
  await ctx.answerCbQuery();

  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
    return;
  }

  const taskId = ctx.callbackQuery.data.replace(
    'ASK_DELETE_FOREVER_',
    '',
  );

  await ctx.editMessageText(
            `⚠️ Are you sure?

        This task will be permanently deleted.`,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: '✅ Confirm',
                      callback_data: `CONFIRM_DELETE_${taskId}`,
                    },
                    {
                      text: '❌ Cancel',
                      callback_data: `CANCEL_DELETE_${taskId}`,
                    },
                  ],
                ],
              },
            },
          );
}


     @Action(/^CONFIRM_DELETE_(.+)$/)
        async confirmDelete(ctx: Context){

          await ctx.answerCbQuery();


          if(
            !ctx.callbackQuery ||
            !('data' in ctx.callbackQuery)
          ){
            return;
          }


          const taskId =
            ctx.callbackQuery.data.replace(
              'CONFIRM_DELETE_',
              '',
            );


          await ctx.editMessageReplyMarkup({
            inline_keyboard:[
              [
                {
                  text:'✅ Yes, Delete',
                  callback_data:`DELETE_FOREVER_${taskId}`,
                },
                {
                  text:'❌ Cancel',
                  callback_data:`CANCEL_DELETE`,
                }
              ]
            ]
          });

}

      @Action(/^CANCEL_DELETE_(.+)$/)
      async cancelDelete(ctx: Context) {
        await ctx.answerCbQuery();

        await ctx.editMessageText(
          '❌ Delete cancelled.',
        );
      }
          @Action(/^DELETE_FOREVER_(.+)$/)
      async deleteForever(ctx: Context) {
        await ctx.answerCbQuery();

        if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
          return;
        }

        const taskId = ctx.callbackQuery.data.replace(
          'DELETE_FOREVER_',
          '',
        );

        console.log('Forever ID:', taskId);

        if (!Types.ObjectId.isValid(taskId)) {
          await ctx.reply('❌ Invalid task id');
          return;
        }

        await this.tasksService.deleteForever(
          new Types.ObjectId(taskId),
        );

        await ctx.deleteMessage();

        await ctx.reply('🗑 Task permanently deleted.');
      }

    @Action(/^DELETE_(.+)$/)
      async deleteTask(ctx: Context) {
        await ctx.answerCbQuery();

        if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
          return;
        }

        const taskId = ctx.callbackQuery.data.replace(
          'DELETE_',
          '',
        );

        console.log('Delete ID:', taskId);

        if (!Types.ObjectId.isValid(taskId)) {
          await ctx.reply('❌ Invalid task id');
          return;
        }

        const task = await this.tasksService.deleteTask(
          new Types.ObjectId(taskId),
        );

        if (!task) {
          await ctx.reply('❌ Task not found.');
          return;
        }

        await ctx.deleteMessage();

        await ctx.reply('🗑 Task moved to trash.');
      }
    @Action(/^RESTORE_(.+)$/)
        async restore(ctx: Context) {
          await ctx.answerCbQuery();

          if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
            return;
          }

          const taskId = ctx.callbackQuery.data.replace(
            'RESTORE_',
            '',
          );

          const task = await this.tasksService.restoreTask(
            new Types.ObjectId(taskId),
          );

          if (!task) {
            await ctx.reply('❌ Task not found.');
            return;
          }

          await ctx.deleteMessage();

          await ctx.reply('♻️ Task restored successfully.');
        }


    @Command('cancel')
      async cancel(ctx: Context) {
        const userId = ctx.from!.id;

        this.registrationService.cancel(userId);

        await ctx.reply(
          REGISTRATION_MESSAGES.CANCELLED,
        );
      }

     
   @Command('trash')
      async trash(ctx: Context) {
        const telegramId = ctx.from?.id;

        if (!telegramId) {
          await ctx.reply('❌ User not found.');
          return;
        }

        const user = await this.userService.findByTelegramId(
          telegramId,
        );

        if (!user) {
          await ctx.reply('❌ User not found.');
          return;
        }

        const tasks = await this.tasksService.getDeletedTasks(
          user._id,
        );

        if (!tasks.length) {
          await ctx.reply('🗑 Trash is empty.');
          return;
        }

          for (const task of tasks) {
            await ctx.reply(
              `🗑 ${task.title}`,
              trashKeyboard(task._id.toString()),
            );
          }
        }

        @Command('search')
      async search(ctx: Context) {
        if (!ctx.message || !('text' in ctx.message)) {
          return;
        }

        const keyword = ctx.message.text
          .replace('/search', '')
          .trim();

        if (!keyword) {
          await ctx.reply(
        '❌ Usage:\n/search html',
      );
      return;
    }

    const user = await this.userService.findByTelegramId(
      ctx.from!.id,
    );

    if (!user) {
      await ctx.reply('❌ User not found.');
      return;
    }

    const tasks =
      await this.tasksService.searchTasks(
        user._id,
        keyword,
      );

    if (!tasks.length) {
      await ctx.reply(
        '🔍 No matching tasks found.',
      );
      return;
    }

    for (const task of tasks) {
      await ctx.reply(
        `📌 ${task.title}

  ${task.completed ? '✅ Completed' : '⬜ Pending'}`,
        taskKeyboard(
          task._id.toString(),
          task.completed,
        ),
      );
    }
  }



  @Action(/^EDIT_(.+)$/)
        async edit(ctx: Context) {
          await ctx.answerCbQuery();

          if (
            !ctx.callbackQuery ||
            !('data' in ctx.callbackQuery)
          ) {
            return;
          }

          const taskId =
            ctx.callbackQuery.data.replace(
              'EDIT_',
              '',
            );

          this.registrationService.startEditTask(
            ctx.from!.id,
            taskId,
          );

          await ctx.reply(
            '✏️ Send the new task title.',
          );
}
     private async sendTasks(
        ctx: Context,
        tasks: HTaskDocument[],
      ) {
        if (!tasks.length) {
          await ctx.reply('📭 No tasks found.');
          return;
        }

        for (const task of tasks) {
          await ctx.reply(
            `📌 ${task.title}

      ${task.completed ? '✅ Completed' : '⬜ Pending'}`,
            taskKeyboard(
              task._id.toString(),
              task.completed,
            ),
          );
        }
      }
      @Command('completed')
      async completed(ctx: Context) {
        const user =
          await this.userService.findByTelegramId(
            ctx.from!.id,
          );

        if (!user) {
          await ctx.reply('❌ User not found.');
          return;
        }

        const tasks =
          await this.tasksService.getCompletedTasks(
            user._id,
          );

        await this.sendTasks(ctx, tasks);
      }

      @Command('pending')
async pending(ctx: Context) {
  const user =
    await this.userService.findByTelegramId(
      ctx.from!.id,
    );

  if (!user) {
    await ctx.reply('❌ User not found.');
    return;
  }

  const tasks =
    await this.tasksService.getPendingTasks(
      user._id,
    );

  await this.sendTasks(ctx, tasks);
}

   @Command('all')
async all(ctx: Context) {
  const user =
    await this.userService.findByTelegramId(
      ctx.from!.id,
    );

  if (!user) {
    await ctx.reply('❌ User not found.');
    return;
  }

  const tasks =
    await this.tasksService.getAllTasks(
      user._id,
    );

  await this.sendTasks(ctx, tasks);
}
   @Command('stats')
async statistics(ctx: Context) {
  const user =
    await this.userService.findByTelegramId(
      ctx.from!.id,
    );

  if (!user) {
    await ctx.reply('❌ User not found.');
    return;
  }

  const stats =
    await this.tasksService.getStatistics(
      user._id,
    );

  await ctx.reply(`
📊 Your Statistics

📝 Total Tasks : ${stats.total}

✅ Completed : ${stats.completed}

⏳ Pending : ${stats.pending}

🗑 Trash : ${stats.deleted}
`);
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
      case RegistrationStep.WAITING_TASK: {

            if (!text.trim()) {
              await ctx.reply(TASK_MESSAGES.EMPTY);
              return;
            }

          const user = await this.userService.findByTelegramId(
              userId,
            );

            if (!user) {
              await ctx.reply('❌ User not found.');
                  return;
          }
            this.registrationService.startDueDate(
              userId,
              text,
            );

            await ctx.reply(
              '📅 Enter the due date (YYYY-MM-DD)\n\nOr type "skip".',
            );
                break;
              }

              case RegistrationStep.WAITING_EDIT_TASK: {

      if (!text.trim()) {
        await ctx.reply('❌ Title cannot be empty.');
        return;
      }

      await this.tasksService.editTask(
        new Types.ObjectId(state.taskId!),
        text,
      );

      this.registrationService.cancel(userId);

      await ctx.reply(
        '✅ Task updated successfully.',
      );

      break;
    }

    case RegistrationStep.WAITING_DUE_DATE: {

  const value = text.trim();

  let dueDate: Date | null = null;


  if (value.toLowerCase() !== 'skip') {

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      await ctx.reply(
        '❌ Invalid date format.\nUse YYYY-MM-DD or type "skip".',
      );
      return;
    }

    dueDate = date;
  }


  this.registrationService.setDueDate(
    userId,
    dueDate,
  );


  await ctx.reply(
    '⭐ Choose priority:\n\n' +
    '1️⃣ Low\n' +
    '2️⃣ Medium\n' +
    '3️⃣ High',
  );


      break;
    }


    case RegistrationStep.WAITING_PRIORITY: {

        const value = text.trim().toLowerCase();

        let priority: 'LOW' | 'MEDIUM' | 'HIGH';

        switch (value) {
          case '1':
          case 'low':
            priority = 'LOW';
            break;

          case '2':
          case 'medium':
            priority = 'MEDIUM';
            break;

          case '3':
          case 'high':
            priority = 'HIGH';
            break;

          default:
            await ctx.reply(
              '❌ Invalid priority.\n\nChoose:\n1️⃣ Low\n2️⃣ Medium\n3️⃣ High',
            );
            return;
        }

        const user = await this.userService.findByTelegramId(userId);

        if (!user) {
          await ctx.reply('❌ User not found.');
          return;
        }

        this.registrationService.setPriority(
          userId,
          priority,
        );

        const state = this.registrationService.getState(userId);

        if (!state || !state.taskTitle) {
          await ctx.reply('❌ Task data not found.');
          return;
        }

        await this.tasksService.addTask(
          user._id,
          state.taskTitle,
          state.dueDate ?? undefined,
          priority,
        );

        this.registrationService.clear(userId);

        await ctx.reply(
          `✅ Task created successfully!

      📝 Title: ${state.taskTitle}
      📅 Due Date: ${state.dueDate ? state.dueDate.toISOString().split('T')[0] : 'No due date'}
      ⭐ Priority: ${priority}`,
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