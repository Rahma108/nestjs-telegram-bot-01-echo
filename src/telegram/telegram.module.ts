import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigService } from '@nestjs/config';
import { RegistrationModule } from './registration/registration.module';
import { TasksModule } from 'src/task/tasks/tasks.module';
import { UserModule } from 'src/user/user.module';
@Module({
  imports: [
    TelegrafModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('BOT_TOKEN')!,
      }),
    }),
    RegistrationModule,
      TasksModule,
    UserModule
  ],

  controllers: [TelegramController],
  providers: [TelegramService ],
})
export class TelegramModule {}
