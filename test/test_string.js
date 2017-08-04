let string = require('../src/string');

module.exports.testString = (test)=>{
  // TODO
  test.deepEqual(string.parseString('word'), []);
  test.deepEqual(string.parseString('WordoneWordtwoWordthree'), ['Wordone', 'wordone', 'Wordtwo', 'wordtwo', 'Wordthree', 'wordthree']);
  test.deepEqual(string.parseString('wordone-wordtwo-wordthree'), ['wordone', 'wordtwo', 'wordthree']);
  test.deepEqual(string.parseString('WORDONE_WORDTWO_WORDTHREE'), ['WORDONE', 'wordone', 'WORDTWO', 'wordtwo', 'WORDTHREE', 'wordthree']);
  test.deepEqual(string.transformWord('running'), ['run']);
  test.done();
};

module.exports.testTransformWord = (test)=>{
  test.deepEqual(string.transformWord('Word'), ['word']);
  test.deepEqual(string.transformWord('studied'), ['study', 'studi', 'studie']);
  test.deepEqual(string.transformWord('studies'), ['study', 'studie']);
  test.deepEqual(string.transformWord('player'), ['play']);
  test.deepEqual(string.transformWord('supplier'), ['supply', 'suppli']);
  test.deepEqual(string.transformWord('happiest'), ['happy', 'happi']);
  test.deepEqual(string.transformWord('runs'), ['run']);
  test.deepEqual(string.transformWord('running'), ['run']);
  test.deepEqual(string.transformWord('playing'), ['play']);
  test.done();
};

module.exports.testLinkWords = (test)=>{
  test.deepEqual(string.linkWords([]), []);
  test.deepEqual(string.linkWords(['word0']), ['word0']);
  test.deepEqual(string.linkWords(['word0', 'word1']), ['word0 word1', 'word0']);
  test.deepEqual(string.linkWords(['word0', 'word1', 'word2']), ['word0 word1 word2', 'word0 word1', 'word0']);
  test.done();
};
