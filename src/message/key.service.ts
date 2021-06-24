import { Injectable, Scope } from '@nestjs/common';
import * as config from 'config';
import * as moment from 'moment';
import { Moment } from 'moment';
import * as forge from 'node-forge';
import { ApiLogger } from '../logger/api-logger';
import { EncryptionConfig } from './models/encryption-config.model';
import { TasksConfig } from './models/tasks-config.model';

const { rsaKeyLength } = config.get<EncryptionConfig>('encryption');
const { keyLifetimeSeconds } = config.get<TasksConfig>('tasks');

@Injectable({ scope: Scope.DEFAULT })
export class KeyService {

  private keyPair: forge.pki.rsa.KeyPair;
  private keyPairTimestamp: Moment;

  public constructor(
    private logger: ApiLogger
  ) {
    logger.setContext('KeyService');
  }

  private checkKeyPair(): void {
    const minDate = moment().utcOffset(0);
    minDate.subtract(keyLifetimeSeconds, 'seconds');

    if (!this.keyPair || !!this.keyPairTimestamp?.isBefore(minDate)) {
      this.logger.log('Generating new key pair');
      this.keyPair = forge.pki.rsa.generateKeyPair(rsaKeyLength);
      this.keyPairTimestamp = moment().utcOffset(0);
    }
  }
  
  public getPublicKey(): string {
    this.checkKeyPair();

    return forge.pki.publicKeyToPem(this.keyPair.publicKey);
  }

  public decryptPartial<T>(obj: T, properties: string[]): Partial<T> {
    const newObj = {};

    for (const [ key, val ] of Object.entries(obj).filter(([ key ]) => properties.includes(key))) {
      const decryptedVal = forge.util.decodeUtf8(this.keyPair.privateKey.decrypt(forge.util.decode64(val)));
      newObj[key] = decryptedVal;
    }

    return newObj;
  }

}
