import { DEFAULTS } from '../constants';
import type { NotificationItem } from '../types/notification.types';

export class NotificationQueue {
  private readonly queue: Map<string, NotificationItem>;
  private readonly maxVisible: number;

  public constructor(maxVisible: number = DEFAULTS.MAX_VISIBLE) {
    this.queue = new Map<string, NotificationItem>();
    this.maxVisible = maxVisible;
  }

  public add(item: NotificationItem): void {
    this.queue.set(item.id, item);
  }

  public remove(id: string): NotificationItem | undefined {
    const item = this.queue.get(id);
    this.queue.delete(id);
    return item;
  }

  public getAll(): NotificationItem[] {
    return Array.from(this.queue.values());
  }

  public getVisible(): NotificationItem[] {
    return this.getAll().slice(0, this.maxVisible);
  }

  public getPending(): NotificationItem[] {
    return this.getAll().slice(this.maxVisible);
  }

  public has(id: string): boolean {
    return this.queue.has(id);
  }

  public clear(): void {
    this.queue.clear();
  }

  public get size(): number {
    return this.queue.size;
  }

  public get visibleCount(): number {
    return Math.min(this.size, this.maxVisible);
  }
}

