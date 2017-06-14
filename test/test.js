module.exports.testSomething = (test)=>{
  test.expect(1);
  test.ok(true, "this assertion should pass");
  test.done();
};

module.exports.testSomethingElse = (test)=>{
  test.ok(false, "this assertion should fail");
  test.done();
};
