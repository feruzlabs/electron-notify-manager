export class Logger {
  private readonly prefix = '[electron-notify-manager]';
  public constructor(private enabled: boolean = false) {}

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

  public error(message: string, error?: Error): void {
    // error() always logs regardless of enabled flag
    // eslint-disable-next-line no-console
    console.error(this.prefix, message, error);
  }

  public enable(): void {
    this.enabled = true;
  }

  public disable(): void {
    this.enabled = false;
  }

  public get isEnabled(): boolean {
    return this.enabled;
  }
}

