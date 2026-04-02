import { ErrorCode, NotificationError } from '../errors';

export class PositionManager {
  private readonly items: Map<string, number>;

  public constructor() {
    this.items = new Map<string, number>();
  }

  public add(id: string): number {
    const index = this.items.size;
    this.items.set(id, index);
    return index;
  }

  public remove(id: string): void {
    if (!this.items.has(id)) return;
    this.items.delete(id);
    this.reflow();
  }

  public getIndex(id: string): number {
    const idx = this.items.get(id);
    if (idx === undefined) {
      throw new NotificationError(`Notification not found: ${id}`, ErrorCode.NOTIFICATION_NOT_FOUND);
    }
    return idx;
  }

  public reflow(): Map<string, number> {
    const entries = Array.from(this.items.entries()).sort((a, b) => a[1] - b[1]);
    this.items.clear();
    for (let i = 0; i < entries.length; i++) {
      this.items.set(entries[i][0], i);
    }
    return new Map<string, number>(this.items);
  }

  public clear(): void {
    this.items.clear();
  }

  public get count(): number {
    return this.items.size;
  }
}

