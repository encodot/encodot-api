import { BadRequestException, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class KeyStoreService {

  private keys = new Map<number, string>();

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
    const key = randomBytes(64).toString('base64');

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

