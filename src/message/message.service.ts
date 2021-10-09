import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as config from 'config';
import { randomBytes } from 'crypto';
import * as forge from 'node-forge';
import { ApiLogger } from '../logger/api-logger';
import { AesService } from './aes/aes.service';
import { AddMessageDto } from './dto/add-message.dto';
import { GetMessageDto } from './dto/get-message.dto';
import { GetTransactionKeyDto } from './dto/get-transaction-key.dto';
import { KeyStoreService } from './key-store.service';
import { KeyService } from './key.service';
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
    private keySv: KeyService,
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

  public async addMessage(addMessageDto: AddMessageDto): Promise<MessageMetadata> {    
    const { message, password } = this.keySv.decryptPartial(addMessageDto, [ 'message', 'password' ]);

    const urlPassword = randomBytes(urlKeyLength).toString('hex');

    let transitMsg: string;
    try {
      transitMsg = await this.aes.encrypt(message, urlPassword + password);
    } catch (error) {
      throw new BadRequestException('Could not encrypt the message');
    }

    try {
      const entity = await this.msgRepo.addMessage(transitMsg);

      return { id: entity.id, urlPassword };
    } catch (error) {
      throw new BadRequestException('Could not save the transit message'); 
    }
  }

  public async getMessage(getMessageDto: GetMessageDto): Promise<MessageResult> {
    const { publicKey } = getMessageDto;
    const { messageId, password, urlPassword } = this.keySv.decryptPartial(getMessageDto, [ 'messageId', 'password', 'urlPassword' ]);

    const message = await this.msgRepo.getMessage(messageId);
    if (!message) {
      throw new BadRequestException(`No such message. Hint: Messages get automatically deleted after ${messageLifetimeSeconds} seconds!`);
    }

    // await this.msgRepo.deleteMessage(messageId); // Delete message always, even if the passphrase is incorrect.

    const rsa = forge.pki.publicKeyFromPem(publicKey);

    let clearText: string;
    try {
      clearText = await this.aes.decrypt(message.message, urlPassword + password);
    } catch (error) {
      throw new BadRequestException(`Could not decrypt the message. Maybe an incorrect password: ${error.message}`);
    }

    try {
      const rsaEncrypted = forge.util.encode64(rsa.encrypt(forge.util.encodeUtf8(clearText)));

      return { message: rsaEncrypted };
    } catch (error) {
      this.logger.error('Could not encrypt the clear text message with the supplied public key', error.toString());
      throw new BadRequestException('Could not encrypt the clear text message with the supplied public key.');
    }
  }

}
