/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

type EachLineCallback = (line: string, linenum: number) => void;

export class LineReader {
  data: string;
  lineFeedString: string;
  currentIndex: number;

  constructor(data: string) {
    this.data = data;
    this.lineFeedString = this.detectLineFeedString(data);
    this.currentIndex = 0;
  }

  detectLineFeedString(data: string): string {
    const index = data.indexOf("\n");
    if (index < 0) {
      return null;
    }
    if (data[index - 1] === "\r") {
      return "\r\n";
    }
    return "\n";
  }

  eachLine(fnEachLine: EachLineCallback, fnFinished: () => void): void {
    this.processNextLine(fnEachLine, fnFinished, 0);
  }

  processNextLine(fnEachLine: EachLineCallback, fnFinished: () => void, linenum: number): Promise<void> {
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

  getNextLine(): string {
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
