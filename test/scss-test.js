'use strict';

var fusile = require('../lib/');
var fuse = require('fuse-bindings');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');

var when = require('when');
var node = require('when/node');

var whenFs = node.liftAll(fs);

var expect = require('unexpected')
  .clone()
  .installPlugin(require('unexpected-promise'));

expect.addAssertion('string', 'to have file content', function (expect, subject, cmp) {
  return when.all([
    whenFs.readFile(subject, 'utf8'),
    whenFs.readFile(cmp, 'utf8')
  ]).then(function (results) {
    return expect(results[0], 'to equal', results[1]);
  });
});

var src = 'fixtures/source';
var compiled = 'fixtures/compiled';
var mnt = 'test/SCSS';

describe('scss specifics', function () {
  before(function (done) {
    var self = this;
    fuse.unmount(mnt, function () {
      mkdirp(mnt, function (err) {
        if (err) {
          console.error(err);
          process.exit(-1);
        }

        self.fusile = fusile(src, mnt, {
          // verbose: true,
          sourceMap: false
        });

        setTimeout(done, 300);
      });
    });
  });

  after(function (done) {
    setTimeout(function () {
      fuse.unmount(mnt, function () {
        rimraf(mnt, done);
      });
    }, 500);
  });


  it('should compile nested partials correctly', function () {
    return expect(path.join(mnt, 'scss/nestedpartials.css'), 'to have file content', path.join(compiled, 'scss/nestedpartials.css'));
  });

  it('should cut the file reading after the error message has been sent if the file content is bigger than the error message', function () {
    return whenFs.readFile(path.join(mnt, 'scss/massive-with-error.css'), 'utf8')
      .then(function (result) {
        expect(result, 'to match', /^body \* {display: none !important;} body:before {line-height: 1\.5; display: block; z-index: 99999999; white-space: pre; font-family: "Courier New", monospace; font-size: 20px; color: black; margin: 10px; padding: 10px; border: 4px dashed red; margin-bottom: 10px; content: "Transpiler error: .*?\/fixtures\/source\/scss\/massive-with-error\.scss:5:6\\00000ainvalid property name";}$/);
      });
  });
});
