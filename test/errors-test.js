'use strict';

var fusile = require('../lib/');
var fuse = require('fuse-bindings');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');

var expect = require('unexpected')
  .clone()
  .installPlugin(require('unexpected-sinon'));

var sinon = require('sinon');

var when = require('when');
var node = require('when/node');
var whenFs = node.liftAll(fs);
var exec = node.lift(require('child_process').exec);

var src = 'fixtures/source';
var compiled = 'fixtures/compiled';
var mnt = 'test/ERROR';

expect.addAssertion('string', 'to have file content', function (expect, subject, cmp) {
  return when.all([
    whenFs.readFile(subject, 'utf8'),
    whenFs.readFile(cmp, 'utf8')
  ]).then(function (results) {
    results = results.map(function (result) {
      return result.replace(/\\00002f/g, '/').replace().replace(/: [^ ]*?fusile/g, ': fusile');
    });

    return expect(results[0], 'to satisfy', results[1]);
  });
});

describe('when files have syntax errors', function () {
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

        setTimeout(done, 1800);
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

  beforeEach(function () {
    this.emitSpy = sinon.spy(this.fusile, 'emit');
  });
  afterEach(function () {
    this.fusile.emit.restore();
  });

  describe('with CSS', function () {
    it('should return an error stylesheet', function () {
      return expect(path.join(mnt, 'errors/error.css'), 'to have file content', path.join(compiled, 'errors/error.css'));
    });

    it('should delete any cache entry', function () {
      var self = this;

      self.fusile.tolkCache['/errors/error.css'] = { fail: false };

      return whenFs.readFile(path.join(mnt, 'errors/error.css'))
        .delay(1)
        .then(function () {
          return expect(self.fusile.tolkCache, 'not to have property', '/errors/error.css');
        });
    });

    it('should serve valid css when syntax error was fixed', function () {
      var self = this;

      return expect(path.join(mnt, 'errors/error.css'), 'to have file content', path.join(compiled, 'errors/error.css'))
        .then(function () {
          return whenFs.writeFile(path.join(src, 'errors/error.scss'), 'body { color: red; }');
        })
        .delay(100)
        .then(function () {
          return whenFs.readFile(path.join(mnt, 'errors/error.css'), 'utf8');
        })
        .then(function (result) {
          return expect(result, 'to be', 'body {\n  color: red; }\n');
        })
        .then(function () {
          return expect(self.fusile.tolkCache, 'to satisfy', {
            '/errors/error.css': {
              compileTime: expect.it('to be a number'),
              tolkPromise: expect.it('to be fulfilled')
            }
          });
        })
        .delay(1000)
        .then(function () {
          return whenFs.writeFile(path.join(src, 'errors/error.scss'), 'body {');
        })
        .then(function () {
          return expect(path.join(mnt, 'errors/error.css'), 'to have file content', path.join(compiled, 'errors/error.css'));
        })
        .delay(1)
        .then(function () {
          return expect(self.fusile.tolkCache, 'not to have property', '/errors/error.css');
        })
        .finally(function () {
          return exec('git checkout fixtures/source/errors/error.scss');
        });
    });
  });

});
