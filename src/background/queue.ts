/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// A Queue with expiring feature
export default class ExpiringQueue<T> {
  private readonly ttl: number;
  private readonly pdfIdQueue = new Set<string>();
  private readonly pdfData = new Map<string, T>();

  constructor(ttl: number) {
    this.ttl = ttl;
  }

  push(id: string, data: T): void {
    this.pdfData.set(id, data);
    this.pdfIdQueue.add(id);

    setTimeout(() => {
      this.pdfIdQueue.delete(id);
      this.pdfData.delete(id);
    }, this.ttl);
  }

  shiftId(): string | null {
    const frontId = this.pdfIdQueue.values().next().value;
    if (frontId === undefined) {
      return null;
    }
    this.pdfIdQueue.delete(frontId);
    return frontId;
  }

  get(id: string): T | null {
    return this.pdfData.get(id) ?? null;
  }
}
