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
var srcTmp = 'fixtures/source/tmp';
var mnt = 'test/CACHE';

describe('when caching', function () {
  before(function (done) {
    var self = this;
    fuse.unmount(mnt, function () {
      mkdirp(srcTmp, function (err) {
        if (err) {
          console.error(err);
          process.exit(-1);
        }
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

      setTimeout(function () {
      fs.readFile(path.join(mnt, 'stylus/cache.css'), { encoding: 'utf-8' }, function (err) {
        expect(err, 'to be null');
        expect(self.emitSpy, 'was always called with', 'info', 'cache miss', '/stylus/cache.css');

        done();
      });
      }, 600);
    });

    it('should have a cache hit on second read', function (done) {
      var self = this;

      fs.readFile(path.join(mnt, 'stylus/cache.css'), { encoding: 'utf-8' }, function (err) {
        expect(err, 'to be null');
        expect(self.emitSpy, 'was always called with', 'info', 'cache hit', '/stylus/cache.css');

        done();
      });
    });

    it('should have a cache miss on third read when source file was updated', function (done) {
      var self = this;

      setTimeout(function () {
        fs.utimes(path.join(src, 'stylus/cache.styl'), new Date(), new Date(), function () {

          fs.readFile(path.join(mnt, 'stylus/cache.css'), { encoding: 'utf-8' }, function (err) {
            expect(err, 'to be null');
            expect(self.emitSpy, 'was always called with', 'info', 'cache miss', '/stylus/cache.css');

            done();
          });

        });
      }, 1200);
    });

  });

  describe('compiled file with no partials, scss/cache.scss', function () {

    it('should not have a cache hit on first read', function (done) {
      var self = this;

      this.fusile.tolkCache = {};

      fs.readFile(path.join(mnt, 'scss/cache.css'), { encoding: 'utf-8' }, function (err) {
        expect(err, 'to be null');
        expect(self.emitSpy, 'was always called with', 'info', 'cache miss', '/scss/cache.css');

        done();
      });
    });

    it('should have a cache hit on second read', function (done) {
      var self = this;

      fs.readFile(path.join(mnt, 'scss/cache.css'), { encoding: 'utf-8' }, function (err) {
        expect(err, 'to be null');
        expect(self.emitSpy, 'was always called with', 'info', 'cache hit', '/scss/cache.css');

        done();
      });
    });

    it('should have a cache miss on third read when source file was updated', function (done) {
      var self = this;

      setTimeout(function () {
        fs.utimes(path.join(src, 'scss/cache.scss'), new Date(), new Date(), function () {
            fs.readFile(path.join(mnt, 'scss/cache.css'), { encoding: 'utf-8' }, function (err) {
              expect(err, 'to be null');
              expect(self.emitSpy, 'was always called with', 'info', 'cache miss', '/scss/cache.css');

              done();
            });

        });
      }, 1200);
    });

    it('should have a cache miss on fourth read when partial file was updated', function (done) {
      var self = this;

      setTimeout(function () {
        fs.utimes(path.join(src, 'scss/_cache_partial.scss'), new Date(), new Date(), function () {
          fs.readFile(path.join(mnt, 'scss/cache.css'), { encoding: 'utf-8' }, function (err) {
            expect(err, 'to be null');
            expect(self.emitSpy, 'was always called with', 'info', 'cache miss', '/scss/cache.css');

            done();
          });
        });
      }, 1200);
    });

  });

  describe('compiled file with no partials, less/cache.less', function () {

    it('should not have a cache hit on first read', function (done) {
      var self = this;

      this.fusile.tolkCache = {};

      fs.readFile(path.join(mnt, 'less/cache.css'), { encoding: 'utf-8' }, function (err) {
        expect(err, 'to be null');
        expect(self.emitSpy, 'was always called with', 'info', 'cache miss', '/less/cache.css');

        done();
      });
    });

    it('should have a cache hit on second read', function (done) {
      var self = this;

      fs.readFile(path.join(mnt, 'less/cache.css'), { encoding: 'utf-8' }, function (err) {
        expect(err, 'to be null');
        expect(self.emitSpy, 'was always called with', 'info', 'cache hit', '/less/cache.css');

        done();
      });
    });

    it('should have a cache miss on third read when source file was updated', function (done) {
      var self = this;

      setTimeout(function () {
        fs.utimes(path.join(src, 'less/cache.less'), new Date(), new Date(), function () {
          fs.readFile(path.join(mnt, 'less/cache.css'), { encoding: 'utf-8' }, function (err) {
            expect(err, 'to be null');
            expect(self.emitSpy, 'was always called with', 'info', 'cache miss', '/less/cache.css');

            done();
          });

        });
      }, 1200);
    });

    it('should have a cache miss on fourth read when partial file was updated', function (done) {
      var self = this;

      setTimeout(function () {
        fs.utimes(path.join(src, 'less/_cache_partial.less'), new Date(), new Date(), function () {
          fs.readFile(path.join(mnt, 'less/cache.css'), { encoding: 'utf-8' }, function (err) {
            expect(err, 'to be null');
            expect(self.emitSpy, 'was always called with', 'info', 'cache miss', '/less/cache.css');

            done();
          });
        });
      }, 1200);
    });

  });

  describe('compiled file with no partials, babel/simplest.jsx', function () {

    // Addresses #20 - sometimes the first read after an update would yield the old version

    it('should yield an updated version of the file on first read after update', function (done) {

      setTimeout(function () {

        // Copy src/.../simple_template_string into tmp/simple_template_string since we'll be modifying it
        fs.createReadStream(
            path.join(src, 'babel/simple_template_string.jsx')
        ).pipe(fs.createWriteStream(
            path.join(src, 'tmp/simple_template_string.jsx')
        ));

        // Write the contents of src/.../simple_template_string_update into tmp/simple_template_string
        fs.readFile(path.join(src, 'babel/simple_template_string_update.jsx'), {encoding: 'utf-8'}, function (err, updateContents) {
          expect(err, 'to be null');
          fs.writeFile(path.join(src, 'tmp/simple_template_string.jsx'), updateContents, {encoding: 'utf-8'}, function (err) {
            expect(err, 'to be null');

            // Check that the next read actually returns an updated compiled version
            fs.readFile(path.join(mnt, 'tmp/simple_template_string.jsx'), {encoding: 'utf-8'}, function (err, compiledContents) {
              expect(err, 'to be null');
              expect(compiledContents, 'to contain', 'bar_again');
              done();
            });

          });
        });

      }, 1200);

    });

  });

});
