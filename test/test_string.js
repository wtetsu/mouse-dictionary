let string = require("../src/string");

module.exports.testString = (test)=>{
  test.deepEqual(string.parseString("word"), ['word']);
  test.deepEqual(string.parseString("WordoneWordtwoWordthree"), ['WordoneWordtwoWordthree', 'Wordone', 'wordone', 'Wordtwo', 'wordtwo', 'Wordthree', 'wordthree']);
  test.deepEqual(string.parseString("wordone-wordtwo-wordthree"), ['wordone-wordtwo-wordthree', 'wordone', 'wordtwo', 'wordthree']);
  test.deepEqual(string.parseString("WORDONE_WORDTWO_WORDTHREE"), ['WORDONE_WORDTWO_WORDTHREE', 'WORDONE', 'wordone', 'WORDTWO', 'wordtwo', 'WORDTHREE', 'wordthree']);
  test.deepEqual(string.transformWord("running"), ["running", "run"]);
  test.done();
};
