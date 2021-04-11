import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiLogger } from '../logger/api-logger';
import { AesService } from './aes/aes.service';
import { KeyRepository } from './key.repository';
import { MessageRepository } from './message.repository';
import * as config from 'config';
import { TasksConfig } from './models/tasks-config.model';

const { keyLifetimeSeconds, messageLifetimeSeconds } = config.get<TasksConfig>('tasks');

@Injectable()
export class MessageTasksService {

  public constructor(
    private logger: ApiLogger,
    @InjectRepository(MessageRepository) private msgRepo: MessageRepository,
    @InjectRepository(KeyRepository) private keyRepo: KeyRepository,
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

  @Cron('*/5 * * * *') // Every 5 minutes.
  public async deleteExpiredKeys(): Promise<void> {
    this.logger.debug('Remove expired keys');
    const deletedKeys = await this.keyRepo.deleteExpired(keyLifetimeSeconds);
    this.logger.log(`Deleted ${deletedKeys} keys`);
  }

}
