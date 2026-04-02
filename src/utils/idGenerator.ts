import crypto from 'crypto';

export interface IdGenerator {
  next(): string;
}

export class CryptoIdGenerator implements IdGenerator {
  public next(): string {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    return crypto.randomBytes(16).toString('hex');
  }
}

