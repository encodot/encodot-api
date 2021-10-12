import { BadRequestException, Injectable } from '@nestjs/common';
import * as forge from 'node-forge';
import { Base64Service } from './base64/base64.service';

@Injectable()
export class KeyStoreService {

  private keys = new Map<number, string>();

  public constructor(
    private b64: Base64Service
  ) {}

  private getNextId(): number {
    while (true) {
      const id = Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER);
      if (!this.keys.has(id)) {
        return id;
      }
    }
  }

  public genKey(): [ number, string ] {
    const id = this.getNextId();
    const key = this.b64.encodeUrl(forge.random.getBytesSync(64));

    this.keys.set(id, key);
    return [ id, key ];
  }

  public getKey(id: number): string {
    if (!this.keys.has(id)) {
      throw new BadRequestException('No such key!');
    }

    return this.keys.get(id);
  }

}

