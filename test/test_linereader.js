let LineReader = require("../src/options/linereader");

module.exports.testLineReaderLf = (test)=>{
  let reader = new LineReader("aaa\nbbb\nccc");

  let lines = [];
  reader.eachLine((line)=>{
    lines.push(line);
    console.log(line);
    return new Promise((resolve)=>{
      setTimeout(()=>{
        resolve();
      }, 100);
    });
  }, ()=>{
    test.deepEqual(["aaa", "bbb", "ccc"], lines);
    test.done();
  });
};

module.exports.testLineReaderCrLf = (test)=>{
  let reader = new LineReader("aaa\r\nbbb\r\nccc");

  let lines = [];
  reader.eachLine((line)=>{
    lines.push(line);
    console.log(line);
    return new Promise((resolve)=>{
      setTimeout(()=>{
        resolve();
      }, 100);
    });
  }, ()=>{
    test.deepEqual(["aaa", "bbb", "ccc"], lines);
    test.done();
  });
};
