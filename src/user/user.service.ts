import { Injectable } from '@nestjs/common';
import { IUser } from 'src/common/interfaces';
import { UserRepository } from 'src/common/repository';

@Injectable()
export class UserService {
  constructor( private readonly userRepository: UserRepository,){
}
// findByTelegramId
    async findByTelegramId(telegramId: number) {
      return this.userRepository.findOne({
        filter:{
          telegramId
        }
      });

    }

    // create 
    async create(data: Partial<IUser>) {
      return this.userRepository.createOne({
        data
      })
    }
      async update(
      telegramId: number,
      data: Partial<IUser>,
    ) {
      return this.userRepository.findOneAndUpdate({
      filter: {
        telegramId,
      },
      update: data,
    });
    }
}
