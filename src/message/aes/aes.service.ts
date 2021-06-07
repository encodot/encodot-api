import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHmac, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { ApiLogger } from '../../logger/api-logger';
import { TransitMsg } from './models/transit-msg.model';

@Injectable()
export class AesService {

  public constructor(
    private logger: ApiLogger
  ) {
    logger.setContext('AesService');
  }

  public async encrypt(message: string, password: string): Promise<string> {    
    const salt = randomBytes(16);
    const iv = randomBytes(16);

    // The key length is dependent on the algorithm.
    // In this case for aes256, it is 32 bytes.
    const key = await this.deriveKeyFromPassword(password, salt);
    const cipher = createCipheriv('aes-256-cbc', key, iv);

    const encrypted = Buffer.concat([
      cipher.update(message),
      cipher.final()
    ]);

    const hmac = createHmac('sha256', password).update(encrypted).digest();

    this.logger.log(`Password: ${password}`);
    this.logger.log(`Hmac: ${hmac.toString('base64')}`);
    this.logger.log(`Encrypted: ${encrypted.toString('base64')}`);

    encrypted.toString('base64');

    return this.getTransitMsgStr(hmac, salt, iv, encrypted);
  }
  
  public async decrypt(transitMsg: string, password: string): Promise<string> {
    const { /*hmac: transitHmac,*/ salt, iv, encrypted } = this.parseTransitMsg(transitMsg);
    const key = await this.deriveKeyFromPassword(password, salt);

    const hmac = createHmac('sha256', password).update(encrypted).digest();

    this.logger.log(`Password: ${password}`);
    // this.logger.log(`Transit hmac: ${transitHmac.toString('base64')}`);
    this.logger.log(`Hmac: ${hmac.toString('base64')}`);
    this.logger.log(`Encrypted: ${encrypted.toString('base64')}`);

    // if (!hmac.equals(transitHmac)) {
    //   throw new Error('Incorrect passphrase');
    // }

    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    
    return decrypted.toString('utf8');
  }

  private async deriveKeyFromPassword(password: string, salt: Buffer): Promise<Buffer> {
    return (await promisify(scrypt)(password, salt, 32)) as Buffer;
  }

  private getTransitMsgStr(hmac: Buffer, salt: Buffer, iv: Buffer, encrypted: Buffer): string {
    return Buffer.concat([ /*hmac,*/ salt, iv, encrypted ]).toString('base64');
  }

  private parseTransitMsg(transitMsg: string): TransitMsg {
    const transitBuf = Buffer.from(transitMsg, 'base64');
    // const hmac = transitBuf.slice(0, 32);
    const salt = transitBuf.slice(0, 16); // (32, 48);
    const iv = transitBuf.slice(16, 32); // (48, 64);
    const encrypted = transitBuf.slice(32); // (64);

    return { salt, iv, encrypted }; // , hmac };
  }

}