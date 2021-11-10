import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { AesService } from '@shared/aes';
import * as config from 'config';
import { ApiLogger } from '../logger/api-logger';
import { MessageRepository } from './message.repository';
import { TasksConfig } from './models/tasks-config.model';

const { messageLifetimeSeconds } = config.get<TasksConfig>('tasks');

@Injectable()
export class MessageTasksService {

  public constructor(
    private logger: ApiLogger,
    @InjectRepository(MessageRepository) private msgRepo: MessageRepository,
    private aes: AesService
  ) {
    logger.setContext('MessageTasksService');
  }

  @Cron('*/5 * * * *') // Every 5 minutes.
  public async deleteExpiredMessages(): Promise<void> {
    this.logger.debug('Remove expired messages');
    const deletedMessages = await this.msgRepo.deleteExpired(messageLifetimeSeconds);
    this.logger.log(`Deleted ${deletedMessages} messages`);
  }

}
