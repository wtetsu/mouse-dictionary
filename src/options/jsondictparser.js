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
    let dictdata = null;
    dictdata = JSON.parse(json);
    this.lines = [];
    return dictdata;
  }
}
