import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as config from 'config';
import { randomBytes } from 'crypto';
import * as forge from 'node-forge';
import { ApiLogger } from '../logger/api-logger';
import { AesService } from './aes/aes.service';
import { AddMessageDto } from './dto/add-message.dto';
import { GetMessageDto } from './dto/get-message.dto';
import { Key } from './key.entity';
import { KeyRepository } from './key.repository';
import { MessageRepository } from './message.repository';
import { EncryptionConfig } from './models/encryption-config.model';
import { MessageMetadata } from './models/message-metadata.model';
import { MessageResult } from './models/message-result.model';
import { TasksConfig } from './models/tasks-config.model';

const { rsaKeyLength, urlKeyLength } = config.get<EncryptionConfig>('encryption');
const { messageLifetimeSeconds } = config.get<TasksConfig>('tasks');

@Injectable()
export class MessageService {

  public constructor(
    private logger: ApiLogger,
    @InjectRepository(MessageRepository) private msgRepo: MessageRepository,
    @InjectRepository(KeyRepository) private keyRepo: KeyRepository,
    private aes: AesService
  ) {
    logger.setContext('MessageService');
  }

  public async getKey(): Promise<Key> {
    const { privateKey, publicKey } = forge.pki.rsa.generateKeyPair(rsaKeyLength);

    const privateKeyPem = forge.pki.privateKeyToPem(privateKey);
    const publicKeyPem = forge.pki.publicKeyToPem(publicKey);
    
    const key = await this.keyRepo.saveKey(privateKeyPem);
    key.key = publicKeyPem;
    return key;
  }

  public async addMessage(addMessageDto: AddMessageDto): Promise<MessageMetadata> {
    const { keyId } = addMessageDto;

    const key = await this.keyRepo.getKey(keyId);
    if (!key) {
      throw new BadRequestException('No such private key');
    }
    
    const { message, password } = this.decryptPartial(addMessageDto, [ 'message', 'password' ], key.key);

    const urlPassword = randomBytes(urlKeyLength).toString('base64');

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
    const { publicKey, keyId } = getMessageDto;

    const key = await this.keyRepo.getKey(keyId);
    if (!key) {
      throw new BadRequestException('No such private key');
    }

    const { messageId, password, urlPassword } = this.decryptPartial(getMessageDto, [ 'messageId', 'password', 'urlPassword' ], key.key);

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
      throw new BadRequestException('Could not decrypt the message. Maybe an incorrect password.');
    }

    try {
      const rsaEncrypted = forge.util.encode64(rsa.encrypt(clearText));

      return { message: rsaEncrypted };
    } catch (error) {
      throw new BadRequestException('Could not encrypt the clear text message with the supplied public key.');
    }
  }

  private decryptPartial<T>(obj: T, properties: string[], privateKeyPem: string): Partial<T> {
    const newObj = {};
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

    for (const [ key, val ] of Object.entries(obj).filter(([ key ]) => properties.includes(key))) {
      const decryptedVal = privateKey.decrypt(forge.util.decode64(val));
      newObj[key] = decryptedVal;
    }

    return newObj;
  }

}
