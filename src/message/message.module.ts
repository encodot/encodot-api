import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../logger/logger.module';
import { AesModule } from './aes/aes.module';
import { MessageController } from './message.controller';
import { MessageRepository } from './message.repository';
import { MessageService } from './message.service';
import { MessageTasksService } from './message-tasks.service';
import { KeyService } from './key.service';

@Module({
  imports: [
    LoggerModule,
    TypeOrmModule.forFeature([
      MessageRepository
    ]),
    AesModule
  ],
  providers: [
    MessageService,
    MessageTasksService,
    KeyService
  ],
  controllers: [
    MessageController
  ]
})
export class MessageModule {}
