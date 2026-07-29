import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserModel } from 'src/DB/model';
import { UserRepository } from 'src/common/repository';

@Module({
  imports: [
    UserModel
  ],
  exports: [],
  controllers: [UserController],
  providers: [UserService , UserRepository],
})
export class UserModule {}
