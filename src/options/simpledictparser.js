export default class SimpleDictParser {
  constructor(delimiter) {
    this.delimiter = delimiter;
  }

  addLine(line) {
    let hd = null;
    const didx = line.indexOf(this.delimiter);
    if (didx >= 0) {
      let head = line.substring(0, didx);
      let desc = line.substring(didx + this.delimiter.length);
      if (head && desc) {
        hd = { head, desc };
      }
    }
    return hd;
  }

  flush() {
    return null;
  }
}
