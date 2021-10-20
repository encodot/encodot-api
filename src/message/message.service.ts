import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as config from 'config';
import * as forge from 'node-forge';
import { ApiLogger } from '../logger/api-logger';
import { AesService } from './aes/aes.service';
import { Base64Service } from './base64/base64.service';
import { AddMessageDto } from './dto/add-message.dto';
import { GetMessageDto } from './dto/get-message.dto';
import { GetTransactionKeyDto } from './dto/get-transaction-key.dto';
import { KeyStoreService } from './key-store.service';
import { MessageRepository } from './message.repository';
import { EncryptionConfig } from './models/encryption-config.model';
import { Key } from './models/key.model';
import { MessageMetadata } from './models/message-metadata.model';
import { MessageResult } from './models/message-result.model';
import { TasksConfig } from './models/tasks-config.model';

const { urlKeyLength } = config.get<EncryptionConfig>('encryption');
const { messageLifetimeSeconds } = config.get<TasksConfig>('tasks');

@Injectable()
export class MessageService {

  public constructor(
    private logger: ApiLogger,
    @InjectRepository(MessageRepository) private msgRepo: MessageRepository,
    private aes: AesService,
    private b64: Base64Service,
    private keyStoreSv: KeyStoreService
  ) {
    logger.setContext('MessageService');
  }

  public async getTransactionKey(dto: GetTransactionKeyDto): Promise<Key> {
    this.logger.log('Get transaction key');
    const [ id, key ] = this.keyStoreSv.genKey();

    const publicKey = forge.pki.publicKeyFromPem(dto.publicKey);
    const keyCipher = forge.util.encode64(publicKey.encrypt(key));

    return { id, key: keyCipher };
  }

  public async addMessage(dto: AddMessageDto): Promise<MessageMetadata> {
    this.logger.log('Add message');
    const key = this.keyStoreSv.getKey(dto.keyId);
    const { message, password } = this.aes.decryptObj(dto, key, [ 'message', 'password' ]);

    const urlPassword = this.b64.encodeUrl(forge.random.getBytesSync(urlKeyLength));

    let transitMsg: string;
    try {
      transitMsg = this.aes.encrypt(message, urlPassword + password);
    } catch (error) {
      this.logger.error('Could not encrypt the message', error);
      throw new BadRequestException();
    }

    try {
      const entity = await this.msgRepo.addMessage(transitMsg);
      return this.aes.encryptObj({ id: entity.id, urlPassword }, key, [ 'id', 'urlPassword' ]);
    } catch (error) {
      this.logger.error('Could not save the transit message', error);
      throw new BadRequestException(); 
    }
  }

  public async getMessage(dto: GetMessageDto): Promise<MessageResult> {
    this.logger.log('Get message', null, { messageId: dto.messageId });
    const key = this.keyStoreSv.getKey(dto.keyId);
    const { messageId, password, urlPassword } = this.aes.decryptObj(dto, key, [ 'messageId', 'password', 'urlPassword' ]);

    const message = await this.msgRepo.getMessage(messageId);
    if (!message) {
      this.logger.error('Decryption failed', null, null, { messageId });
      throw new BadRequestException();
    }

    // await this.msgRepo.deleteMessage(messageId); // Delete message always, even if the passphrase is incorrect.

    let clearText: string;
    try {
      clearText = this.aes.decrypt(message.message, urlPassword + password);
    } catch (error) {
      this.logger.error('Decryption failed', error, null, { messageId });
      throw new BadRequestException();
    }

    return this.aes.encryptObj({ message: clearText }, key, [ 'message' ]);
  }

}
