'use strict';

var expect = require('unexpected').clone();
expect.installPlugin(require('unexpected-promise'));

var autoprefix = require('../lib/autoprefix');

var compiler = autoprefix.config({
  browsers: ['last 500 versions']
});

describe('autoprefix', function () {
  it('should not prefix things where prefixes are not needed', function () {
    return compiler('body {\n  color: hotpink;\n}\n').then(function (result) {
      expect(result, 'to be', 'body {\n  color: hotpink;\n}\n');
    });
  });

  it('should prefix css', function () {
    return compiler('body {\n  transform: rotate(-1deg);\n}\n').then(function (result) {
      expect(result, 'to be', 'body {\n  -webkit-transform: rotate(-1deg);\n     -moz-transform: rotate(-1deg);\n      -ms-transform: rotate(-1deg);\n       -o-transform: rotate(-1deg);\n          transform: rotate(-1deg);\n}\n');
    });
  });

  it('should fail on invalid css', function () {
    return compiler('body {\n  transform rotate(-1deg);\n}\n').catch(function (result) {
      expect(result, 'to have message', '<css input>:2:3: Unknown word');
    });
  });
});
