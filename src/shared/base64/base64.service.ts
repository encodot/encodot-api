import { Injectable } from '@nestjs/common';
import * as forge from 'node-forge';

@Injectable()
export class Base64Service {

  public encode(bytes: string): string {
    return forge.util.encode64(bytes);
  }

  public decode(base64: string): string {
    return forge.util.decode64(base64);
  }

  public encodeUrl(bytes: string): string {
    const base64 = this.encode(bytes);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  public decodeUrl(urlBase64: string): string {
    let base64 = urlBase64.replace(/\-/g, '+').replace(/\_/g, '/');

    while (base64.length % 4) {
      base64 += '=';
    }

    return this.decode(base64);
  }

}
