let string = require("../src/string");

module.exports.testString = (test)=>{
  test.deepEqual(string.parseString("word"), ['word']);
  test.deepEqual(string.parseString("WordoneWordtwoWordthree"), ['WordoneWordtwoWordthree', 'Wordone', 'wordone', 'Wordtwo', 'wordtwo', 'Wordthree', 'wordthree']);
  test.deepEqual(string.parseString("wordone-wordtwo-wordthree"), ['wordone-wordtwo-wordthree', 'wordone', 'wordtwo', 'wordthree']);
  test.deepEqual(string.parseString("WORDONE_WORDTWO_WORDTHREE"), ['WORDONE_WORDTWO_WORDTHREE', 'WORDONE', 'wordone', 'WORDTWO', 'wordtwo', 'WORDTHREE', 'wordthree']);
  test.deepEqual(string.transformWord("running"), ["running", "run"]);
  test.done();
};

module.exports.testTransformWord = (test)=>{
  test.deepEqual(md.string.transformWord("Word"), ["Word", "word"]);
  test.deepEqual(md.string.transformWord("studied"), ['studied', 'study', 'studi', 'studie']);
  test.deepEqual(md.string.transformWord("studies"), ['studies', 'study', 'studie']);
  test.deepEqual(md.string.transformWord("player"), ['player', 'play']);
  test.deepEqual(md.string.transformWord("supplier"), ['supplier', 'supply', 'suppli']);
  test.deepEqual(md.string.transformWord("happiest"), ['happiest', 'happy', 'happi']);
  test.deepEqual(md.string.transformWord("runs"), ['runs', 'run']);
  test.deepEqual(md.string.transformWord("running"), ['running', 'run']);
  test.deepEqual(md.string.transformWord("playing"), ['playing', 'play']);

  test.done();
};
