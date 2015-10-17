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
  .installPlugin(require('unexpected-sinon'));

expect.addAssertion('<string> to have file content <string>', function (expect, subject, cmp) {
  return when.all([
    whenFs.readFile(subject, 'utf8'),
    whenFs.readFile(cmp, 'utf8')
  ]).then(function (results) {
    return expect(results[0], 'to equal', results[1]);
  });
});

var src = 'fixtures/source';
var compiled = 'fixtures/compiled';
var mnt = 'test/SOURCEMAPS';

var kill = function () {
  process.removeListener('SIGINT', kill);
  process.removeListener('SIGTERM', kill);

  fuse.unmount(mnt, function () {
    process.exit(1);
  });
};

describe.skip('Sourcemap', function () {
  before(function (done) {
    var self = this;

    fuse.unmount(mnt, function () {
      mkdirp(mnt, function (err) {
        if (err) {
          console.error(err);
          process.exit(-1);
        }

        self.fusile = fusile(src, mnt, {
          // verbose: true
        });

        self.fusile.on('mount', function () {
          process.on('SIGINT', kill);
          process.on('SIGTERM', kill);
          done();
        });
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

  describe('when reading uncompiled files', function () {
    it('should compile babel/basic.jsx', function () {
      return expect(path.join(mnt, 'babel/basic.jsx'), 'to have file content', path.join(compiled, 'babel/basic.js'));
    });

    it('should compile coco/basic.co', function () {
      return expect(path.join(mnt, 'coco/basic.co'), 'to have file content', path.join(compiled, 'coco/basic.js'));
    });

    it('should compile coffee/basic.coffee', function () {
      return expect(path.join(mnt, 'coffee/basic.coffee'), 'to have file content', path.join(compiled, 'coffee/basic.js'));
    });

    it('should compile dogescript/basic.djs', function () {
      return expect(path.join(mnt, 'dogescript/basic.djs'), 'to have file content', path.join(compiled, 'dogescript/basic.js'));
    });

    it('should compile less/basic.less', function () {
      return expect(path.join(mnt, 'less/basic.less'), 'to have file content', path.join(compiled, 'less/basic.css'));
    });

    it('should compile livescript/basic.ls', function () {
      return expect(path.join(mnt, 'livescript/basic.js'), 'to have file content', path.join(compiled, 'livescript/basic.js'));
    });

    it('should compile markdown/basic.md', function () {
      return expect(path.join(mnt, 'markdown/basic.md'), 'to have file content', path.join(compiled, 'markdown/basic.html'));
    });

    it('should compile myth/basic.myth', function () {
      return expect(path.join(mnt, 'myth/basic.myth'), 'to have file content', path.join(compiled, 'myth/basic.css'));
    });

    it('should compile scss/basic.scss', function () {
      return expect(path.join(mnt, 'scss/basic.scss'), 'to have file content', path.join(compiled, 'scss/basic.css'));
    });

    it('should compile stylus/basic.styl', function () {
      return expect(path.join(mnt, 'stylus/basic.styl'), 'to have file content', path.join(compiled, 'stylus/basic.css'));
    });
  });
});
