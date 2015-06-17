'use strict';

var fusile = require('../lib/');
var fuse = require('fuse-bindings');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');

var expect = require('unexpected')
  .clone()
  .installPlugin(require('unexpected-promise'))
  .installPlugin(require('unexpected-sinon'));

var sinon = require('sinon');

var src = 'fixtures/source';
var mnt = 'test/CACHE';

describe('when caching', function () {
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

  it('should not have a cache hit on first read of non-compiled file', function (done) {
    var self = this;

    this.fusile.tolkCache = {};

    fs.readFile(path.join(mnt, '/unchanged.txt'), { encoding: 'utf-8' }, function (err) {
      expect(err, 'to be null');
      expect(self.emitSpy, 'was not called');

      fs.readFile(path.join(mnt, '/unchanged.txt'), { encoding: 'utf-8' }, function (err) {
        expect(err, 'to be null');
        expect(self.emitSpy, 'was not called');

        done();
      });
    });
  });

  describe('compiled file with no partials, stylus/cache.styl', function () {
    it('should not have a cache hit on first read', function (done) {
      this.fusile.tolkCache = {};
      var self = this;

      fs.readFile(path.join(mnt, 'stylus/cache.css'), { encoding: 'utf-8' }, function (err) {
        expect(err, 'to be null');
        expect(self.emitSpy, 'was called once');
        expect(self.emitSpy, 'was always called with exactly', 'info', 'cache miss', '/stylus/cache.css');

        done();
      });
    });

    it('should have a cache hit on second read', function (done) {
      var self = this;

      fs.readFile(path.join(mnt, 'stylus/cache.css'), { encoding: 'utf-8' }, function (err) {
        expect(err, 'to be null');
        expect(self.emitSpy, 'was called once');
        expect(self.emitSpy, 'was always called with exactly', 'info', 'cache hit', '/stylus/cache.css');

        done();
      });
    });

    it('should have a cache miss on third read when source file was updated', function (done) {
      var self = this;

      setTimeout(function () {
        fs.utimes(path.join(src, 'stylus/cache.styl'), new Date(), new Date(), function () {

          fs.readFile(path.join(mnt, 'stylus/cache.css'), { encoding: 'utf-8' }, function (err) {
            expect(err, 'to be null');
            expect(self.emitSpy, 'was called once');
            expect(self.emitSpy, 'was always called with exactly', 'info', 'cache miss', '/stylus/cache.css');

            done();
          });

        });
      }, 1800);
    });

  });

  describe('compiled file with no partials, scss/cache.scss', function () {

    it('should not have a cache hit on first read', function (done) {
      var self = this;

      this.fusile.tolkCache = {};

      fs.readFile(path.join(mnt, 'scss/cache.css'), { encoding: 'utf-8' }, function (err) {
        expect(err, 'to be null');
        expect(self.emitSpy, 'was always called with exactly', 'info', 'cache miss', '/scss/cache.css');

        done();
      });
    });

    it('should have a cache hit on second read', function (done) {
      var self = this;

      fs.readFile(path.join(mnt, 'scss/cache.css'), { encoding: 'utf-8' }, function (err) {
        expect(err, 'to be null');
        expect(self.emitSpy, 'was always called with exactly', 'info', 'cache hit', '/scss/cache.css');

        done();
      });
    });

    it('should have a cache miss on third read when source file was updated', function (done) {
      var self = this;

      setTimeout(function () {
        fs.utimes(path.join(src, 'scss/cache.scss'), new Date(), new Date(), function () {
            fs.readFile(path.join(mnt, 'scss/cache.css'), { encoding: 'utf-8' }, function (err) {
              expect(err, 'to be null');
              expect(self.emitSpy, 'was always called with exactly', 'info', 'cache miss', '/scss/cache.css');

              done();
            });

        });
      }, 1000);
    });

    it('should have a cache miss on fourth read when partial file was updated', function (done) {
      var self = this;

      setTimeout(function () {
        fs.utimes(path.join(src, 'scss/_cache_partial.scss'), new Date(), new Date(), function () {
          fs.readFile(path.join(mnt, 'scss/cache.css'), { encoding: 'utf-8' }, function (err) {
            expect(err, 'to be null');
            expect(self.emitSpy, 'was called once');
            expect(self.emitSpy, 'was always called with exactly', 'info', 'cache miss', '/scss/cache.css');

            done();
          });
        });
      }, 1000);
    });

  });

  describe('compiled file with no partials, less/cache.less', function () {

    it('should not have a cache hit on first read', function (done) {
      var self = this;

      this.fusile.tolkCache = {};

      fs.readFile(path.join(mnt, 'less/cache.css'), { encoding: 'utf-8' }, function (err) {
        expect(err, 'to be null');
        expect(self.emitSpy, 'was always called with exactly', 'info', 'cache miss', '/less/cache.css');

        done();
      });
    });

    it('should have a cache hit on second read', function (done) {
      var self = this;

      fs.readFile(path.join(mnt, 'less/cache.css'), { encoding: 'utf-8' }, function (err) {
        expect(err, 'to be null');

        expect(self.emitSpy, 'was called');
        expect(self.emitSpy, 'was always called with exactly', 'info', 'cache hit', '/less/cache.css');

        done();
      });
    });

    it('should have a cache miss on third read when source file was updated', function (done) {
      var self = this;

      setTimeout(function () {
        fs.utimes(path.join(src, 'less/cache.less'), new Date(), new Date(), function () {
          fs.readFile(path.join(mnt, 'less/cache.css'), { encoding: 'utf-8' }, function (err) {
            expect(err, 'to be null');
            expect(self.emitSpy, 'was always called with exactly', 'info', 'cache miss', '/less/cache.css');

            done();
          });

        });
      }, 1000);
    });

    it('should have a cache miss on fourth read when partial file was updated', function (done) {
      var self = this;

      setTimeout(function () {
        fs.utimes(path.join(src, 'less/_cache_partial.less'), new Date(), new Date(), function () {
          fs.readFile(path.join(mnt, 'less/cache.css'), { encoding: 'utf-8' }, function (err) {
            expect(err, 'to be null');
            expect(self.emitSpy, 'was called once');
            expect(self.emitSpy, 'was always called with exactly', 'info', 'cache miss', '/less/cache.css');

            done();
          });
        });
      }, 1000);
    });

  });

});
