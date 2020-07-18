import { LineReader } from "../src/options/logic/linereader";

test("", (done) => {
  let reader = new LineReader("aaa\nbbb\nccc");

  let lines = [];
  reader.eachLine(
    (line) => {
      lines.push(line);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 100);
      });
    },
    () => {
      expect(["aaa", "bbb", "ccc"]).toEqual(lines);
      done();
    }
  );
});

test("", (done) => {
  let reader = new LineReader("aaa\r\nbbb\r\nccc");

  let lines = [];
  reader.eachLine(
    (line) => {
      lines.push(line);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 100);
      });
    },
    () => {
      expect(["aaa", "bbb", "ccc"]).toEqual(lines);
      done();
    }
  );
});

test("", (done) => {
  let reader = new LineReader("aaabbbccc");

  let lines = [];
  reader.eachLine(
    (line) => {
      lines.push(line);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 100);
      });
    },
    () => {
      expect(["aaabbbccc"]).toEqual(lines);
      expect(null).toEqual(reader.getNextLine());
      done();
    }
  );
});
