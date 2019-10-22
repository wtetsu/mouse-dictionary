/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

const HEADWORD_FIRST = "■";
const DELIMITER1 = " : ";
const DELIMITER2 = "  {";
const NEW_LINE = "\n";

export default class EijiroParser {
  constructor() {
    this.lines = [];
    this.currentHead = null;
  }

  addLine(line) {
    const hd = this.parseLine(line);
    if (hd === null) {
      return null;
    }

    if (hd.head === this.currentHead) {
      this.lines.push(hd.desc);
      return null;
    }

    const head = this.currentHead;
    const desc = this.lines.join(NEW_LINE);

    this.currentHead = hd.head;
    this.lines = [hd.desc];
    return head && desc ? { head, desc } : null;
  }

  parseLine(line) {
    if (!line.startsWith(HEADWORD_FIRST)) {
      return null;
    }

    const dindex1 = line.indexOf(DELIMITER1);
    if (dindex1 <= 0) {
      return null;
    }

    const firstHalf = line.substring(1, dindex1);
    const dindex2 = firstHalf.indexOf(DELIMITER2);
    const result = {};
    if (dindex2 >= 1) {
      result.head = line.substring(1, dindex2 + 1);
      result.desc = line.substring(dindex2 + 3);
    } else {
      result.head = firstHalf;
      result.desc = line.substring(dindex1 + DELIMITER1.length);
    }
    return result;
  }

  flush() {
    const data = {};
    if (this.currentHead && this.lines.length >= 1) {
      data[this.currentHead] = this.lines.join(NEW_LINE);
    }
    this.currentHead = null;
    this.lines = [];
    return data;
  }
}
