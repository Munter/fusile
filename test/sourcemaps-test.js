'use strict';

var fusile = require('../lib/');
var fuse = require('fuse-bindings');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var async = require('async');

var expect = require('unexpected').clone();
expect.installPlugin(require('unexpected-sinon'));

var sinon = require('sinon');

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

describe('Sourcemap', function () {
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
          accord: {
            sourcemap: true
          }
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
    it('should compile babel/basic.jsx', function (done) {
      var actual = path.join(mnt, 'babel/basic.jsx');
      var expected = path.join(compiled, 'babel/basic.js');

      async.parallel([
        fs.readFile.bind(undefined, actual, 'utf-8'),
        fs.readFile.bind(undefined, expected, 'utf-8')
      ], function (err, results) {
        expect(err, 'to be undefined');
        expect(results[0], 'to be', results[1]);

        done();
      });
    });

    it('should compile coco/basic.co', function (done) {
      var actual = path.join(mnt, 'coco/basic.co');
      var expected = path.join(compiled, 'coco/basic.js');

      async.parallel([
        fs.readFile.bind(undefined, actual, 'utf-8'),
        fs.readFile.bind(undefined, expected, 'utf-8')
      ], function (err, results) {
        expect(err, 'to be undefined');
        expect(results[0], 'to be', results[1]);

        done();
      });
    });

    it('should compile coffee/basic.coffee', function (done) {
      var actual = path.join(mnt, 'coffee/basic.coffee');
      var expected = path.join(compiled, 'coffee/basic.js');

      async.parallel([
        fs.readFile.bind(undefined, actual, 'utf-8'),
        fs.readFile.bind(undefined, expected, 'utf-8')
      ], function (err, results) {
        expect(err, 'to be undefined');
        expect(results[0], 'to be', results[1]);

        done();
      });
    });

    it('should compile dogescript/basic.djs', function (done) {
      var actual = path.join(mnt, 'dogescript/basic.djs');
      var expected = path.join(compiled, 'dogescript/basic.js');

      async.parallel([
        fs.readFile.bind(undefined, actual, 'utf-8'),
        fs.readFile.bind(undefined, expected, 'utf-8')
      ], function (err, results) {
        expect(err, 'to be undefined');
        expect(results[0], 'to be', results[1]);

        done();
      });
    });

    it('should compile escape-html/basic.html', function (done) {
      var actual = path.join(mnt, 'escape-html/basic.html');
      var expected = path.join(compiled, 'escape-html/basic.html');

      async.parallel([
        fs.readFile.bind(undefined, actual, 'utf-8'),
        fs.readFile.bind(undefined, expected, 'utf-8')
      ], function (err, results) {
        expect(err, 'to be undefined');
        expect(results[0], 'to be', results[1]);

        done();
      });
    });

    it('should compile less/basic.less', function (done) {
      var actual = path.join(mnt, 'less/basic.less');
      var expected = path.join(compiled, 'less/basic.css');

      async.parallel([
        fs.readFile.bind(undefined, actual, 'utf-8'),
        fs.readFile.bind(undefined, expected, 'utf-8')
      ], function (err, results) {
        expect(err, 'to be undefined');
        expect(results[0], 'to be', results[1]);

        done();
      });
    });

    it('should compile livescript/basic.ls', function (done) {
      var actual = path.join(mnt, 'livescript/basic.ls');
      var expected = path.join(compiled, 'livescript/basic.js');

      async.parallel([
        fs.readFile.bind(undefined, actual, 'utf-8'),
        fs.readFile.bind(undefined, expected, 'utf-8')
      ], function (err, results) {
        expect(err, 'to be undefined');
        expect(results[0], 'to be', results[1]);

        done();
      });
    });

    it('should compile markdown/basic.md', function (done) {
      var actual = path.join(mnt, 'markdown/basic.md');
      var expected = path.join(compiled, 'markdown/basic.html');

      async.parallel([
        fs.readFile.bind(undefined, actual, 'utf-8'),
        fs.readFile.bind(undefined, expected, 'utf-8')
      ], function (err, results) {
        expect(err, 'to be undefined');
        expect(results[0], 'to be', results[1]);

        done();
      });
    });

    it('should compile myth/basic.myth', function (done) {
      var actual = path.join(mnt, 'myth/basic.myth');
      var expected = path.join(compiled, 'myth/basic.css');

      async.parallel([
        fs.readFile.bind(undefined, actual, 'utf-8'),
        fs.readFile.bind(undefined, expected, 'utf-8')
      ], function (err, results) {
        expect(err, 'to be undefined');
        expect(results[0], 'to be', results[1].replace(/\n$/, ''));

        done();
      });
    });

    it('should compile scss/basic.scss', function (done) {
      var actual = path.join(mnt, 'scss/basic.scss');
      var expected = path.join(compiled, 'scss/basic.css');

      async.parallel([
        fs.readFile.bind(undefined, actual, 'utf-8'),
        fs.readFile.bind(undefined, expected, 'utf-8')
      ], function (err, results) {
        expect(err, 'to be undefined');
        expect(results[0], 'to be', results[1]);

        done();
      });
    });

    it('should compile stylus/basic.styl', function (done) {
      var actual = path.join(mnt, 'stylus/basic.styl');
      var expected = path.join(compiled, 'stylus/basic.css');

      async.parallel([
        fs.readFile.bind(undefined, actual, 'utf-8'),
        fs.readFile.bind(undefined, expected, 'utf-8')
      ], function (err, results) {
        expect(err, 'to be undefined');
        expect(results[0], 'to be', results[1]);

        done();
      });
    });
  });
});
