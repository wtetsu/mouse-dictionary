/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

export default class JsonDictParser {
  constructor() {
    this.lines = [];
  }

  addLine(line) {
    this.lines.push(line);
    return null;
  }

  flush() {
    const json = this.lines.join("");
    const dictdata = JSON.parse(json);
    this.lines = [];
    return dictdata;
  }
}
