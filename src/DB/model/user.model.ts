import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IUser } from 'src/common/interfaces/user.interface';

export type HUserDocument = HydratedDocument<IUser>;
@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strict: true,
  strictQuery: true,
})
export class User implements IUser {
    @Prop({
    type: Number,
    required: true,
    unique: true,
    index: true,
  })
  telegramId!: number;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  firstName!: string;

  @Prop({
    type: String,
    default: null,
    trim: true,
  })
  username?: string;

  @Prop({
    type: String,
    default: 'en',
  })
  languageCode!: string;

  @Prop({
    type: Date,
    default: null,
  })
  deletedAt?: Date;

  @Prop({
    type: Date,
    default: null,
  })
  restoredAt?: Date;
}

export const userMongooseSchema = SchemaFactory.createForClass(User);
export const UserModel = MongooseModule.forFeatureAsync([
  {
    name: User.name,

    useFactory: () => {
     userMongooseSchema.pre(['find', 'findOne'], function () {
    if (this.getQuery().paranoid === false) {
      return;
    }

    this.setQuery({
      ...this.getQuery(),
      deletedAt: null,
    });
  });

  userMongooseSchema.pre(
    ['updateOne', 'findOneAndUpdate'],
    function () {
      const update = this.getUpdate() as HydratedDocument<IUser>;

      if (update.deletedAt) {
        this.setQuery({
          ...this.getQuery(),
          deletedAt: null,
        });

        this.setUpdate({
          ...this.getUpdate(),
          $unset: { restoredAt: 1 },
        });
      }

      if (update.restoredAt) {
        this.setQuery({
          ...this.getQuery(),
          paranoid: false,
          deletedAt: { $ne: null },
        });
      }
    },
  );

  userMongooseSchema.pre(
    ['deleteOne', 'findOneAndDelete'],
    function () {
      if (this.getQuery().force === true) {
        return;
      }

      this.setQuery({
        ...this.getQuery(),
        deletedAt: { $ne: null },
      });
    },
  );


    return userMongooseSchema;
    },
  },
]);
