import type { NotificationError } from '../errors';

export class Logger {
  private readonly prefix = '[electron-notify-manager]';
  private enabled: boolean;

  public constructor(debug = false) {
    this.enabled = debug;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public info(message: string, ...args: readonly unknown[]): void {
    if (!this.enabled) return;
    // eslint-disable-next-line no-console
    console.log(this.prefix, message, ...args);
  }

  public warn(message: string, ...args: readonly unknown[]): void {
    if (!this.enabled) return;
    // eslint-disable-next-line no-console
    console.warn(this.prefix, message, ...args);
  }

  public debug(message: string, ...args: readonly unknown[]): void {
    if (!this.enabled) return;
    // eslint-disable-next-line no-console
    console.debug(this.prefix, message, ...args);
  }

  public error(message: string, error?: Error | NotificationError): void {
    if (!this.enabled) return;
    // eslint-disable-next-line no-console
    console.error(this.prefix, message, error);
  }
}

