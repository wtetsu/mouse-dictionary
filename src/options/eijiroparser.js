/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

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

    let result = null;
    if (hd.head === this.currentHead) {
      this.lines.push(hd.desc);
    } else {
      if (this.currentHead && this.lines.length >= 1) {
        result = {};
        result.head = this.currentHead;
        result.desc = this.lines.join("\n");
      }

      this.currentHead = hd.head;
      this.lines = [];
      this.lines.push(hd.desc);
    }
    return result;
  }

  parseLine(line) {
    if (!line.startsWith("■")) {
      return null;
    }

    const delimiter = " : ";
    const didx = line.indexOf(delimiter);

    let head, desc;
    if (didx >= 1) {
      head = line.substring(1, didx);
      desc = line.substring(didx + delimiter.length);
      let didx2 = head.indexOf("  {");
      if (didx2 >= 1) {
        head = line.substring(1, didx2 + 1);
        desc = line.substring(didx2 + 3);
      }
    }
    let hd = head && desc ? { head, desc } : null;
    return hd;
  }

  flush() {
    const data = {};
    if (this.currentHead && this.lines.length >= 1) {
      data[this.currentHead] = this.lines.join("\n");
    }
    this.currentHead = null;
    this.lines = [];
    return data;
  }
}
