/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import { DictParser, DictEntry } from "./dictparser";

const HEADWORD_FIRST = "■";
const DELIMITER1 = " : ";
const SPECIAL_DELIMITERS = ["  {", "〔", " {"];
const NEW_LINE = "\n";

export class EijiroParser implements DictParser {
  lines: string[];
  currentHead: string;

  constructor() {
    this.lines = [];
    this.currentHead = null;
  }

  addLine(line: string): DictEntry {
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

  parseLine(line: string): DictEntry {
    if (!line.startsWith(HEADWORD_FIRST)) {
      return null;
    }

    const dindex1 = line.indexOf(DELIMITER1);
    if (dindex1 <= 0) {
      return null;
    }

    const firstHalf = line.substring(1, dindex1);

    let result: DictEntry = null;
    for (let i = 0; i < SPECIAL_DELIMITERS.length; i++) {
      const delimiter = SPECIAL_DELIMITERS[i];

      const dindex2 = firstHalf.indexOf(delimiter);
      if (dindex2 >= 1) {
        result = {
          head: line.substring(1, dindex2 + 1),
          desc: line.substring(dindex2 + delimiter.length),
        };
        break;
      }
    }
    if (result) {
      return result;
    }

    return {
      head: firstHalf,
      desc: line.substring(dindex1 + DELIMITER1.length),
    };
  }

  flush(): Record<string, string> {
    const data: Record<string, string> = {};
    if (this.currentHead && this.lines.length >= 1) {
      data[this.currentHead] = this.lines.join(NEW_LINE);
    }
    this.currentHead = null;
    this.lines = [];
    return data;
  }
}
