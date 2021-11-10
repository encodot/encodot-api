import { BadRequestException, Injectable } from '@nestjs/common';
import { Base64Service } from '@shared/base64';
import { randomUUID } from 'crypto';
import * as forge from 'node-forge';

@Injectable()
export class KeyStoreService {

  private keys = new Map<string, string>();

  public constructor(
    private b64: Base64Service
  ) {}

  private getNextId(): string {
    while (true) {
      const id = randomUUID();
      if (!this.keys.has(id)) {
        return id;
      }
    }
  }

  public genKey(): [ string, string ] {
    const id = this.getNextId();
    const key = this.b64.encodeUrl(forge.random.getBytesSync(64));

    this.keys.set(id, key);
    return [ id, key ];
  }

  public getKey(id: string): string {
    if (!this.keys.has(id)) {
      throw new BadRequestException('No such key!');
    }

    return this.keys.get(id);
  }

}

