import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as config from 'config';
import { PBKDF2 } from 'crypto-js';
import { decrypt, encrypt } from 'crypto-js/aes';
import Base64 from 'crypto-js/enc-base64';
import { parse as parseHex } from 'crypto-js/enc-hex';
import Utf8 from 'crypto-js/enc-utf8';
import WordArray from 'crypto-js/lib-typedarrays';
import Pkcs7 from 'crypto-js/pad-pkcs7';
import * as NodeRSA from 'node-rsa';
import { ApiLogger } from '../logger/api-logger';
import { AddMessageDto } from './dto/add-message.dto';
import { GetMessageDto } from './dto/get-message.dto';
import { Key } from './key.entity';
import { KeyRepository } from './key.repository';
import { MessageRepository } from './message.repository';
import { EncryptionConfig } from './models/encryption-config.model';
import { MessageMetadata } from './models/message-metadata.model';
import { MessageResult } from './models/message-result.model';
import { TransitMsg } from './models/transit-msg.model';

@Injectable()
export class MessageService {

  private readonly encConfig = config.get<EncryptionConfig>('encription');

  public constructor(
    private logger: ApiLogger,
    @InjectRepository(MessageRepository) private msgRepo: MessageRepository,
    @InjectRepository(KeyRepository) private keyRepo: KeyRepository
  ) {}

  public async getKey(): Promise<Key> {
    const rsa = new NodeRSA({ b: 2048 });
    const privateKey = rsa.exportKey('private');
    const publicKey = rsa.exportKey('public');
    
    const key = await this.keyRepo.saveKey(privateKey);
    key.key = publicKey;
    return key;
  }

  public async addMessage(addMessageDto: AddMessageDto): Promise<MessageMetadata> {
    const { keyId, message: messageEnc, password: passwordEnc } = addMessageDto;

    const key = await this.keyRepo.getKey(keyId);
    if (!key) {
      throw new BadRequestException();
    }

    const rsa = new NodeRSA({ b: this.encConfig.rsaKeyLength });
    rsa.importKey(key.key, 'private');

    const message = rsa.decrypt(messageEnc, 'base64');
    const password = rsa.decrypt(passwordEnc, 'base64');

    const urlPassword = WordArray.random(this.encConfig.urlKeyLength).toString(Base64);

    const transitMsg = this.encryptAES(message, urlPassword + password);

    const entity = await this.msgRepo.addMessage(transitMsg);

    return { id: entity.id, urlPassword };
  }

  public async getMessage(getMessageDto: GetMessageDto): Promise<MessageResult> {
    const { publicKey, keyId, messageId: messageIdEnc, password: passwordEnc, urlPassword: urlPasswordEnc } = getMessageDto;

    const key = await this.keyRepo.getKey(keyId);
    if (!key) {
      throw new BadRequestException();
    }

    const rsa = new NodeRSA({ b: this.encConfig.rsaKeyLength });
    rsa.importKey(key.key, 'private');
    rsa.importKey(publicKey, 'public');

    const messageId = rsa.decrypt(messageIdEnc, 'base64');
    const password = rsa.decrypt(passwordEnc, 'base64');
    const urlPassword = rsa.decrypt(urlPasswordEnc, 'base64');

    const message = await this.msgRepo.getMessage(messageId);
    if (!message) {
      throw new BadRequestException();
    }

    await this.msgRepo.deleteMessage(messageId); // Delete message always, even if the passphrase is incorrect.

    const clearText = this.decryptAES(message.message, urlPassword + password);
    const rsaEncrypted = rsa.encrypt(clearText, 'base64');

    return { message: rsaEncrypted };
  }

  private encryptAES(message: string, password: string): string {
    const salt = WordArray.random(128 / 8);
    const key = this.deriveKeyFromPassword(password, salt);
    const iv = WordArray.random(128 / 8);
    
    const encrypted = encrypt(message, key, { 
      iv: iv, 
      padding: Pkcs7,
      mode: CryptoJS.mode.CBC
    });
    
    return this.getTransitMsgStr(salt, iv, encrypted);
  }
  
  private decryptAES(transitMsg: string, password: string): string {
    const { salt, iv, encrypted } = this.parseTransitMsg(transitMsg);
    const key = this.deriveKeyFromPassword(password, salt);
  
    const decrypted = decrypt(encrypted, key, { 
      iv: iv, 
      padding: Pkcs7,
      mode: CryptoJS.mode.CBC
    });

    return decrypted.toString(Utf8);
  }

  private deriveKeyFromPassword(password: string, salt: WordArray): WordArray {
    return PBKDF2(password, salt, {
      keySize: this.encConfig.aesKeyLength / 32,
      iterations: this.encConfig.aesIterations
    });
  }

  private getTransitMsgStr(salt: WordArray, iv: WordArray, encrypted: CryptoJS.lib.CipherParams): string {
    return salt.toString() + iv.toString() + encrypted.toString();
  }

  private parseTransitMsg(transitMsg: string): TransitMsg {
    const salt = parseHex(transitMsg.substr(0, 32));
    const iv = parseHex(transitMsg.substr(32, 32));
    const encrypted = transitMsg.substr(64);

    return { salt, iv, encrypted };
  }

}
