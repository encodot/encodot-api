import { Injectable } from '@nestjs/common';
import * as forge from 'node-forge';
import { Base64Service } from '../base64/base64.service';

interface TransitMsg {
  salt: string;
  iv: string;
  tag: string;
  encrypted: string;
}

@Injectable()
export class AesService {

  private readonly typePrefixes = new Map([
    [ 'string', 's' ],
    [ 'number', 'n' ],
    [ 'boolean', 'b' ]
  ]);

  public constructor(
    private b64: Base64Service
  ) {}

  public encrypt(message: string, password: string): string {
    const salt = forge.random.getBytesSync(16);
    const iv = forge.random.getBytesSync(16);

    // The key length is dependent on the algorithm.
    // In this case for aes256, it is 32 bytes.
    const key = this.deriveKeyFromPassword(forge.util.encodeUtf8(password), salt);

    const cipher = forge.cipher.createCipher('AES-GCM', key);

    cipher.start({ iv });
    cipher.update(forge.util.createBuffer(forge.util.encodeUtf8(message)));
    cipher.finish();

    const encrypted = cipher.output.getBytes();
    const tag = cipher.mode.tag.getBytes();
    return this.getTransitMsgStr(salt, iv, tag, encrypted);
  }

  public decrypt(transitMsg: string, password: string): string {
    const { salt, iv, tag, encrypted } = this.parseTransitMsg(transitMsg);
    const key = this.deriveKeyFromPassword(forge.util.encodeUtf8(password), salt);

    const decipher = forge.cipher.createDecipher('AES-GCM', key);

    decipher.start({
      iv,
      tag: forge.util.createBuffer(tag, 'raw')
    });
    decipher.update(forge.util.createBuffer(encrypted, 'raw'));
    const pass = decipher.finish();

    if (!pass) {
      throw new Error('Decryption failed');
    }

    return forge.util.decodeUtf8(decipher.output.getBytes());
  }

  public encryptTyped(val: string | number | boolean, password: string): string {
    if (val == null) {
      return val as string;
    }

    const prefix = this.typePrefixes.get(typeof(val));
    if (prefix == null) { // Matches undefined due to ==
      throw new Error(`Unsupported type ${typeof(val)}`);
    }

    return prefix + this.encrypt(val.toString(), password);
  }

  public decryptTyped(typedTransitMsg: string, password: string): string | number | boolean {
    if (typedTransitMsg == null) {
      return typedTransitMsg;
    }

    const typePrefix = typedTransitMsg[0];
    const transitMsg = typedTransitMsg.slice(1);

    const type = [...this.typePrefixes.entries()].find(([key, val]) => val === typePrefix)?.[0];

    if (type == null) {
      throw new Error('No properly formated typed transit message');
    }

    const valStr = this.decrypt(transitMsg, password);

    if (type === 'number') {
      return +valStr;
    } else if (type === 'boolean') {
      return valStr === 'true';
    }

    return valStr;
  }

  public encryptObj<T>(obj: T, password: string, properties: (keyof T)[]): T {
    const entries: [keyof T, string][] = (Object.entries(obj) as [keyof T, any])
      .map(([ key, val ]) => {
        const newVal = properties.includes(key)
          ? this.encryptTyped(val, password)
          : val;

        return [ key, newVal ];
      });

    return Object.fromEntries(entries) as unknown as T;
  }

  public decryptObj<T>(obj: T, password: string, properties: (keyof T)[]): T {
    const entries: [keyof T, string][] = (Object.entries(obj) as [keyof T, any])
      .map(([ key, val ]) => {
        const newVal = properties.includes(key)
          ? this.decryptTyped(val, password)
          : val;

        return [ key, newVal ];
      });

    return Object.fromEntries(entries) as unknown as T;
  }

  private deriveKeyFromPassword(password: string, salt: string): string {
    const md = forge.md.sha256.create();
    return forge.pkcs5.pbkdf2(password, salt, 15000, 32, md);
  }

  private getTransitMsgStr(salt: string, iv: string, tag: string, encrypted: string): string {
    return this.b64.encodeUrl(salt + iv + tag + encrypted);
  }

  private parseTransitMsg(transitMsg: string): TransitMsg {
    const byteStr = this.b64.decodeUrl(transitMsg);
    const salt = byteStr.slice(0, 16);
    const iv = byteStr.slice(16, 32);
    const tag = byteStr.slice(32, 48);
    const encrypted = byteStr.slice(48);

    return { salt, iv, tag, encrypted };
  }

}
