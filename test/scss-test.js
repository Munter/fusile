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
  .clone();

expect.addAssertion('<string> to have file content <string>', function (expect, subject, cmp) {
  return when.all([
    whenFs.readFile(subject, 'utf8'),
    whenFs.readFile(cmp, 'utf8')
  ]).then(function (results) {
    results = results.map(function (result) {
      return result.replace(/\\2f /g, '/').replace().replace(/: [^ ]*?fusile/g, ': fusile');
    });

    return expect(results[0], 'to satisfy', results[1]);
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
    return expect(path.join(mnt, 'scss/massive-with-error.css'), 'to have file content', path.join(compiled, 'scss/massive-with-error.css'));
  });
});
