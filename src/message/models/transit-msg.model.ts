export interface TransitMsg {
  salt: CryptoJS.lib.WordArray;
  iv: CryptoJS.lib.WordArray;
  encrypted: string;
}
