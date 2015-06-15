require('..//tester')(module.id, function (loader, define, assert, done) {
  return loader(['a'], function(a) {
    assert.equal(a.default.name, 'a');
    assert.equal(a.default.b.name, 'b');
    assert.equal(a.default.b.c.name, 'c');
    done();
  });
});
