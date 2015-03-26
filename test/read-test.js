'use strict';

var fusile = require('../lib/');
var unmount = require('../lib/unmount');
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
var mnt = 'test/READ';

describe('In a mounted filesystem', function () {
  before(function (done) {
    var self = this;
    unmount(mnt, function () {
      mkdirp(mnt, function (err) {
        if (err) {
          console.error(err);
          process.exit(-1);
        }

        self.fusile = fusile(src, mnt, {
          // verbose: true
        });

        setTimeout(done, 300);
      });
    });
  });

  after(function (done) {
    setTimeout(function () {
      unmount(mnt, function () {
        rimraf(mnt, done);
      });
    }, 500);
  });

  it('should read a directory', function (done) {
    fs.readdir(mnt, function (err, files) {
      expect(err, 'to be null');
      expect(files, 'to exhaustively satisfy', [
        'autoprefixer',
        'babel',
        'coco',
        'coffee',
        'csso',
        'dogescript',
        'ejs',
        'escape-html',
        'haml',
        'handlebars',
        'jade',
        'less',
        'livescript',
        'marc',
        'markdown',
        'minify-css',
        'minify-html',
        'minify-js',
        'mustache',
        'myth',
        'scss',
        'stylus',
        'swig',
        'toffee',
        'unchanged.txt'
      ]);

      done();
    });
  });

  it('should verify the existance of a file', function (done) {
    fs.exists(mnt + '/less/basic.less', function (exists) {
      expect(exists, 'to be true');

      done();
    });
  });

  it('should read an ordinary file', function (done) {
    fs.readFile(mnt + '/unchanged.txt', { encoding: 'utf-8' }, function (err, data) {
      expect(err, 'to be null');
      expect(data, 'to be a string');
      expect(data.toString(), 'to be', 'I am the same\n');

      done();
    });
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

  describe('when caching', function () {
    it('should not have a cache hit on first read of non-compiled file', function (done) {
      var self = this;

      // For some reason the previous test leaks into this one when spying on emit
      setTimeout(function () {
        var spy = sinon.spy(self.fusile, 'emit');

        fs.readFile(path.join(mnt, '/unchanged.txt'), { encoding: 'utf-8' }, function (err) {
          expect(err, 'to be null');
          expect(spy, 'was not called');

          fs.readFile(path.join(mnt, '/unchanged.txt'), { encoding: 'utf-8' }, function (err) {
            expect(err, 'to be null');
            expect(spy, 'was not called');

            self.fusile.emit.restore();
            done();
          });
        });
      }, 50);
    });

    describe('compiled file with no partials, stylus/cache.styl', function () {

      it('should not have a cache hit on first read', function (done) {
        var self = this;
        var spy = sinon.spy(this.fusile, 'emit');

        fs.readFile(path.join(mnt, 'stylus/cache.styl'), { encoding: 'utf-8' }, function (err) {
          expect(err, 'to be null');
          expect(spy, 'was not called');

          self.fusile.emit.restore();
          done();
        });
      });

      it('should have a cache hit on second read', function (done) {
        var self = this;
        var spy = sinon.spy(this.fusile, 'emit');

        fs.readFile(path.join(mnt, 'stylus/cache.styl'), { encoding: 'utf-8' }, function (err) {
          expect(err, 'to be null');
          expect(spy, 'was called once');
          expect(spy, 'was called with exactly', 'info', 'cache hit', '/stylus/cache.styl');

          self.fusile.emit.restore();
          done();
        });
      });

      it('should have a cache miss on third read when source file was updated', function (done) {
        var self = this;
        var spy = sinon.spy(this.fusile, 'emit');

        fs.utimes(path.join(src, 'stylus/cache.styl'), new Date(), new Date(), function () {
          fs.readFile(path.join(mnt, 'stylus/cache.styl'), { encoding: 'utf-8' }, function (err) {
            expect(err, 'to be null');
            expect(spy, 'was called once');
            expect(spy, 'was called with exactly', 'info', 'cache miss', '/stylus/cache.styl');

            self.fusile.emit.restore();
            done();
          });
        });
      });

    });

    describe('compiled file with no partials, scss/cache.scss', function () {

      it('should not have a cache hit on first read', function (done) {
        var self = this;

        setTimeout(function () {
          var spy = sinon.spy(self.fusile, 'emit');

          fs.readFile(path.join(mnt, 'scss/cache.scss'), { encoding: 'utf-8' }, function (err) {
            expect(err, 'to be null');
            expect(spy, 'was not called');

            self.fusile.emit.restore();
            done();
          });
        }, 50);
      });

      it('should have a cache hit on second read', function (done) {
        var self = this;
        var spy = sinon.spy(this.fusile, 'emit');

        fs.readFile(path.join(mnt, 'scss/cache.scss'), { encoding: 'utf-8' }, function (err) {
          expect(err, 'to be null');

          // expect(spy, 'was called once');
          // expect(spy, 'was called with exactly', 'info', 'cache hit', '/scss/cache.scss');

          expect(spy, 'was called');
          expect(spy, 'was called with', 'info', 'cache hit', '/scss/cache.scss');

          self.fusile.emit.restore();
          done();
        });
      });

      it('should have a cache miss on third read when source file was updated', function (done) {
        var self = this;
        var spy = sinon.spy(this.fusile, 'emit');

        fs.utimes(path.join(src, 'scss/cache.scss'), new Date(), new Date(), function () {
          fs.readFile(path.join(mnt, 'scss/cache.scss'), { encoding: 'utf-8' }, function (err) {
            expect(err, 'to be null');
            expect(spy, 'was called once');
            expect(spy, 'was called with exactly', 'info', 'cache miss', '/scss/cache.scss');

            self.fusile.emit.restore();
            done();
          });
        });
      });

    });

  });
});
