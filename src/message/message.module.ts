import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../logger/logger.module';
import { AesModule } from './aes/aes.module';
import { KeyRepository } from './key.repository';
import { MessageController } from './message.controller';
import { MessageRepository } from './message.repository';
import { MessageService } from './message.service';
import { MessageTasksService } from './message-tasks.service';

@Module({
  imports: [
    LoggerModule,
    TypeOrmModule.forFeature([
      MessageRepository,
      KeyRepository
    ]),
    AesModule
  ],
  providers: [
    MessageService,
    MessageTasksService
  ],
  controllers: [
    MessageController
  ]
})
export class MessageModule {}
