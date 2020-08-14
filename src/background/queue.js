/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// A Queue with expiring feature
export default class ExpiringQueue {
  constructor(ttl) {
    this.ttl = ttl;
    this.pdfIdQueue = new Set();
    this.pdfData = new Map();
  }

  push(id, data) {
    this.pdfData.set(id, data);
    this.pdfIdQueue.add(id);

    setTimeout(() => {
      this.pdfIdQueue.delete(id);
      this.pdfData.delete(id);
    }, this.ttl);
  }

  shiftId() {
    let frontId = null;
    if (this.pdfIdQueue.size >= 1) {
      frontId = this.pdfIdQueue.values().next().value;
      this.pdfIdQueue.delete(frontId);
    }
    return frontId;
  }

  get(id) {
    return this.pdfData.get(id) ?? null;
  }
}
