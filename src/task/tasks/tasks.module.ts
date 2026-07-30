import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskModel } from 'src/DB/model';
import { TaskRepository } from 'src/common/repository/task.repository';

@Module({
  imports: [
      TaskModel
    ],
    providers: [
    TasksService,
    TaskRepository,
  ],
  exports: [
    TasksService,
    TaskRepository,
  ],

})
export class TasksModule {}
