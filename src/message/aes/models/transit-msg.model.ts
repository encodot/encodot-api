export interface TransitMsg {
  hmac: Buffer;
  salt: Buffer;
  iv: Buffer;
  encrypted: Buffer;
}
