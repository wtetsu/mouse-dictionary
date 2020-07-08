/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

export default class LineReader {
  constructor(data) {
    this.data = data;
    this.lineFeedString = this.detectLineFeedString(data);
    this.currentIndex = 0;
  }

  detectLineFeedString(data) {
    const index = data.indexOf("\n");
    if (index < 0) {
      return null;
    }
    if (data[index - 1] === "\r") {
      return "\r\n";
    }
    return "\n";
  }

  eachLine(fnEachLine, fnFinished) {
    this.processNextLine(fnEachLine, fnFinished, 0);
  }

  processNextLine(fnEachLine, fnFinished, linenum) {
    const line = this.getNextLine();
    if (line !== null) {
      return Promise.all([fnEachLine(line, linenum)]).then(() => {
        return this.processNextLine(fnEachLine, fnFinished, linenum + 1);
      });
    } else {
      if (fnFinished) {
        fnFinished();
      }
    }
  }

  getNextLine() {
    if (this.currentIndex === -1) {
      return null;
    }
    if (this.lineFeedString === null) {
      this.currentIndex = -1;
      return this.data;
    }
    let line = null;
    const nextLfIndex = this.data.indexOf(this.lineFeedString, this.currentIndex);
    if (nextLfIndex >= 0) {
      line = this.data.substring(this.currentIndex, nextLfIndex);
      this.currentIndex = nextLfIndex + this.lineFeedString.length;
    } else {
      line = this.data.substring(this.currentIndex);
      this.currentIndex = -1;
    }
    return line;
  }
}
