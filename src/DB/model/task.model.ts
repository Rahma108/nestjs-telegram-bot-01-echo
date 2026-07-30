import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ITask } from 'src/common/interfaces';
import { User } from './user.model';

export type HTaskDocument = HydratedDocument<ITask>;
@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strict: true,
  strictQuery: true,
})
export class Task implements ITask {
  

          @Prop({
          type: Types.ObjectId,
          ref: User.name,
          required: true,
          index: true,
        })
        userId!: Types.ObjectId;
        @Prop({
            type:String ,
            required: true,
            trim: true,
        })
        title!: string;

        @Prop({
            type:Boolean ,
            default: false,
        })
        completed!: boolean;

        @Prop({
        type: Date,
        default: null,
      })
      dueDate?: Date;

        @Prop({
          enum: ['LOW', 'MEDIUM', 'HIGH'],
          default: 'MEDIUM',
        })
        priority?: string;
        @Prop({type : Date})
            deletedAt?:Date ;
            @Prop({type : Date})
            restoredAt?:Date;

}

export const TaskMongooseSchema = SchemaFactory.createForClass(Task);
   TaskMongooseSchema.index({
  userId: 1,
  completed: 1,
});
export const TaskModel = MongooseModule.forFeatureAsync([
  {
    name: Task.name,

    useFactory: () => {
          TaskMongooseSchema.pre(['find', 'findOne'], function () {
      const query = this.getQuery() as any;

      if (query.paranoid === false) {
        delete query.paranoid;

        this.setQuery(query);
        return;
      }

      this.setQuery({
        ...query,
        deletedAt: null,
      });
    });
  

      TaskMongooseSchema.pre(["deleteOne", "findOneAndDelete"], function () {

        if (this.getQuery().force == true ) {
  

          this.setQuery({
            ...this.getQuery(),
          });
        }else{
          this.setQuery({
            ...this.getQuery(),
            deletedAt: { $exists: true }
          });
        }

    });

    return TaskMongooseSchema;
    },
  },
]);
