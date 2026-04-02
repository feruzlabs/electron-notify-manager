import { NotificationQueue } from '../../src/core/NotificationQueue';
import { createMockItem } from '../mocks/helpers';

describe('NotificationQueue', () => {
  it('should add and retrieve items', () => {
    const q = new NotificationQueue(5);
    q.add(createMockItem('a'));
    q.add(createMockItem('b'));
    expect(q.size).toBe(2);
    expect(q.getAll().map((i) => i.id)).toEqual(['a', 'b']);
  });

  it('should remove item by id', () => {
    const q = new NotificationQueue(5);
    q.add(createMockItem('a'));
    const removed = q.remove('a');
    expect(removed?.id).toBe('a');
    expect(q.size).toBe(0);
  });

  it('should return undefined for non-existent id', () => {
    const q = new NotificationQueue(5);
    expect(q.remove('missing')).toBeUndefined();
  });

  it('should respect maxVisible limit', () => {
    const q = new NotificationQueue(2);
    q.add(createMockItem('a'));
    q.add(createMockItem('b'));
    q.add(createMockItem('c'));
    expect(q.getVisible().map((i) => i.id)).toEqual(['a', 'b']);
  });
});

describe('NotificationQueue - maxVisible', () => {
  it('should enforce maxVisible limit', () => {
    const queue = new NotificationQueue(2);
    queue.add(createMockItem('id-1'));
    queue.add(createMockItem('id-2'));
    queue.add(createMockItem('id-3'));
    expect(queue.getVisible().length).toBeLessThanOrEqual(2);
  });

  it('should return all items including queued ones', () => {
    const queue = new NotificationQueue(2);
    queue.add(createMockItem('id-1'));
    queue.add(createMockItem('id-2'));
    queue.add(createMockItem('id-3'));
    expect(queue.size).toBe(3);
    expect(queue.getVisible().length).toBe(2);
  });

  it('should promote queued item when visible slot opens', () => {
    const queue = new NotificationQueue(2);
    queue.add(createMockItem('id-1'));
    queue.add(createMockItem('id-2'));
    queue.add(createMockItem('id-3'));
    queue.remove('id-1');
    expect(queue.getVisible().map((i) => i.id)).toEqual(['id-2', 'id-3']);
  });

  it('should handle remove on empty queue gracefully', () => {
    const queue = new NotificationQueue();
    expect(() => queue.remove('non-existent')).not.toThrow();
    expect(queue.remove('non-existent')).toBeUndefined();
  });

  it('should clear all items', () => {
    const queue = new NotificationQueue();
    queue.add(createMockItem('id-1'));
    queue.add(createMockItem('id-2'));
    queue.clear();
    expect(queue.size).toBe(0);
    expect(queue.getAll()).toEqual([]);
  });
});

