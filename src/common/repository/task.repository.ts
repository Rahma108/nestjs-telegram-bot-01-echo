import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from './base.repository';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { ITask } from '../interfaces';
import { Task } from 'src/DB/model';
@Injectable()
export class TaskRepository extends BaseRepository<ITask> {
  constructor(@InjectModel(Task.name) protected readonly model: Model<ITask>) {
    super(model);
  }
}
