/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

export class LineReader {
  data: string;
  lineFeedString: string | undefined;
  currentIndex: number;
  currentLine: string | undefined;

  constructor(data: string) {
    this.data = data;
    this.lineFeedString = this.detectLineFeedString(data);
    this.currentIndex = 0;
    this.currentLine = undefined;
  }

  detectLineFeedString(data: string): string | undefined {
    const index = data.indexOf("\n");
    if (index < 0) {
      return undefined;
    }
    if (data[index - 1] === "\r") {
      return "\r\n";
    }
    return "\n";
  }

  next(): boolean {
    if (this.currentIndex === -1) {
      this.currentLine = undefined;
      return false;
    }
    if (this.lineFeedString === undefined) {
      this.currentIndex = -1;
      this.currentLine = this.data;
      return true;
    }
    const nextLfIndex = this.data.indexOf(this.lineFeedString, this.currentIndex);
    if (nextLfIndex >= 0) {
      this.currentLine = this.data.substring(this.currentIndex, nextLfIndex);
      this.currentIndex = nextLfIndex + this.lineFeedString.length;
      if (this.currentIndex === this.data.length) {
        this.currentIndex = -1;
      }
      return true;
    }
    this.currentLine = this.data.substring(this.currentIndex);
    this.currentIndex = -1;
    return true;
  }

  getLine(): string {
    if (this.currentLine === undefined) {
      throw new Error("Invalid state");
    }
    return this.currentLine;
  }
}
