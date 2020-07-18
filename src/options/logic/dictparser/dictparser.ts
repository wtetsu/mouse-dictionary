/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

export type DictEntry = { head: string; desc: string };

export interface DictParser {
  addLine(line: string): DictEntry;
  flush(): Record<string, string>;
}
