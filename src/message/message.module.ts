import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../logger/logger.module';
import { AesModule } from './aes/aes.module';
import { KeyStoreService } from './key-store.service';
import { KeyService } from './key.service';
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
    AesModule
  ],
  providers: [
    MessageService,
    MessageTasksService,
    KeyService,
    KeyStoreService
  ],
  controllers: [
    MessageController
  ]
})
export class MessageModule {}
