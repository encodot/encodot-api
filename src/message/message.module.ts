import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../logger/logger.module';
import { AesModule } from './aes/aes.module';
import { Base64Module } from './base64/base64.module';
import { KeyStoreService } from './key-store.service';
import { MessageTasksService } from './message-tasks.service';
import { MessageController } from './message.controller';
import { MessageRepository } from './message.repository';
import { MessageService } from './message.service';

@Module({
  imports: [
    LoggerModule,
    TypeOrmModule.forFeature([
      MessageRepository
    ]),
    AesModule,
    Base64Module
  ],
  providers: [
    MessageService,
    MessageTasksService,
    KeyStoreService
  ],
  controllers: [
    MessageController
  ]
})
export class MessageModule {}
