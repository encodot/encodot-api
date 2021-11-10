import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AesModule } from '@shared/aes';
import { Base64Module } from '@shared/base64';
import { LoggerModule } from '../logger/logger.module';
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
