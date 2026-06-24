import { Module } from '@nestjs/common';

import { UsersRepository } from './repository/users.repository';
import { USERS_REPOSITORY } from './repository/users-repository.interface';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: USERS_REPOSITORY,
      useClass: UsersRepository,
    },
  ],
  exports: [USERS_REPOSITORY],
})
export class UsersModule {}
