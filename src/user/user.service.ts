import { Injectable } from '@nestjs/common';
import { IUser } from 'src/common/interfaces';
import { UserRepository } from 'src/common/repository';

@Injectable()
export class UserService {
  constructor( private readonly userRepository: UserRepository,){
}
// findByTelegramId
 async findByTelegramId(telegramId: number) {

  const user = await this.userRepository.findOne({
    filter: {
      telegramId,
    },
  });


  return user;
}

  async createOrUpdate(data: Partial<IUser>) {
      const user = await this.userRepository.findOneAndUpdate({
      filter: {
        telegramId: data.telegramId,
      },
      update: {
        telegramId: data.telegramId,
        firstName: data.firstName,
        username: data.username,
        languageCode: data.languageCode,
      },
      options: {
        upsert: true,
      },
    });

    return user;
    
  }
}
