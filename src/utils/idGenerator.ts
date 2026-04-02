import { randomUUID } from 'crypto';

export function generateId(): string {
  return randomUUID();
}

export function generateShortId(): string {
  return randomUUID().slice(0, 8);
}

