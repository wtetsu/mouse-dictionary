/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import { DictParser, DictEntry } from "./dictparser";

export class JsonDictParser implements DictParser {
  lines: string[];
  constructor() {
    this.lines = [];
  }

  addLine(line: string): DictEntry {
    this.lines.push(line);
    return null;
  }

  flush(): Record<string, string> {
    const json = this.lines.join("");
    const dictdata = JSON.parse(json);
    this.lines = [];
    return dictdata;
  }
}
