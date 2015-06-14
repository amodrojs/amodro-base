/*jshint strict: false */
/*global it, define: true */
var assert = require('assert'),
    path = require('path'),
    logDebug = process.env.LOGDEBUG === '1',
    amodro = require('../' +
             (logDebug ? 'amodro-test-node-debug' : 'amodro-test-node')),
    createLoader = amodro.createLoader,
    define = amodro.define;

module.exports = function(testPath, fn) {
  var testSuffix;

testSuffix = testPath.replace(__dirname, '').substring(1);

  //describe(testSuffix, function() {
    it(testSuffix, function(done) {
      var result;

      try {
        result = fn(createLoader({
          baseUrl: path.join(__dirname, path.dirname(testSuffix))
        }), define, assert, done);
      } catch (e) {
        return done(e);
      }

      if (result && result.then) {
        result.catch(function(err) {
          done(err);
        });
      }
    });
  //});
};
