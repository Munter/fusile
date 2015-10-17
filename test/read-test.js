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
    return expect(results[0], 'to equal', results[1]);
  });
});

var src = 'fixtures/source';
var compiled = 'fixtures/compiled';
var mnt = 'test/READ';

describe('In a mounted filesystem', function () {
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

  it('should read a directory', function () {
    return expect(whenFs.readdir(mnt), 'to be fulfilled with', [
      'autoprefixer',
      'babel',
      'basic.css',
      'coco',
      'coffee',
      'csso',
      'dogescript',
      'ejs',
      'errors',
      'escape-html',
      'extensions',
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
  });

  it('should translate extensions when reading a directory', function () {
    return expect(whenFs.readdir(mnt + '/extensions'), 'to be fulfilled with', [
      'babel.js',
      'coco.js',
      'coffee.js',
      'dogescript.js',
      'less.css',
      'livescript.js',
      'markdown.html',
      'mcss.css',
      'md.html',
      'mdown.html',
      'myth.css',
      'scss.css',
      'stylus.css',
      'swig.html'
    ]);
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
    describe('using the source file extension', function () {

      it('should not compile babel/basic.jsx', function () {
        return expect(path.join(mnt, 'babel/basic.jsx'), 'to have file content', path.join(src, 'babel/basic.jsx'));
      });

      it('should not compile coco/basic.co', function () {
        return expect(path.join(mnt, 'coco/basic.co'), 'to have file content', path.join(src, 'coco/basic.co'));
      });

      it('should not compile coffee/basic.coffee', function () {
        return expect(path.join(mnt, 'coffee/basic.coffee'), 'to have file content', path.join(src, 'coffee/basic.coffee'));
      });

      it('should not compile dogescript/basic.djs', function () {
        return expect(path.join(mnt, 'dogescript/basic.djs'), 'to have file content', path.join(src, 'dogescript/basic.djs'));
      });

      it('should not compile less/basic.less', function () {
        return expect(path.join(mnt, 'less/basic.less'), 'to have file content', path.join(src, 'less/basic.less'));
      });

      it('should not compile livescript/basic.ls', function () {
        return expect(path.join(mnt, 'livescript/basic.ls'), 'to have file content', path.join(src, 'livescript/basic.ls'));
      });

      it('should not compile markdown/basic.md', function () {
        return expect(path.join(mnt, 'markdown/basic.md'), 'to have file content', path.join(src, 'markdown/basic.md'));
      });

      it('should not compile myth/basic.myth', function () {
        return expect(path.join(mnt, 'myth/basic.myth'), 'to have file content', path.join(src, 'myth/basic.myth'));
      });

      it('should not compile scss/basic.scss', function () {
        return expect(path.join(mnt, 'scss/basic.scss'), 'to have file content', path.join(src, 'scss/basic.scss'));
      });

      it('should not compile stylus/basic.styl', function () {
        return expect(path.join(mnt, 'stylus/basic.styl'), 'to have file content', path.join(src, 'stylus/basic.styl'));
      });

    });

    describe('using the target file extension', function () {

      it('should compile babel/basic.jsx', function () {
        return expect(path.join(mnt, 'babel/basic.js'), 'to have file content', path.join(compiled, 'babel/basic.js'));
      });

      it('should compile coco/basic.co', function () {
        return expect(path.join(mnt, 'coco/basic.js'), 'to have file content', path.join(compiled, 'coco/basic.js'));
      });

      it('should compile coffee/basic.coffee', function () {
        return expect(path.join(mnt, 'coffee/basic.js'), 'to have file content', path.join(compiled, 'coffee/basic.js'));
      });

      it('should compile dogescript/basic.djs', function () {
        return expect(path.join(mnt, 'dogescript/basic.js'), 'to have file content', path.join(compiled, 'dogescript/basic.js'));
      });

      it('should compile less/basic.less', function () {
        return expect(path.join(mnt, 'less/basic.css'), 'to have file content', path.join(compiled, 'less/basic.css'));
      });

      it('should compile livescript/basic.ls', function () {
        return expect(path.join(mnt, 'livescript/basic.js'), 'to have file content', path.join(compiled, 'livescript/basic.js'));
      });

      it('should compile markdown/basic.md', function () {
        return expect(path.join(mnt, 'markdown/basic.html'), 'to have file content', path.join(compiled, 'markdown/basic.html'));
      });

      it('should compile myth/basic.myth', function () {
        return expect(path.join(mnt, 'myth/basic.css'), 'to have file content', path.join(compiled, 'myth/basic.css'));
      });

      it('should compile scss/basic.scss', function () {
        return expect(path.join(mnt, 'scss/basic.css'), 'to have file content', path.join(compiled, 'scss/basic.css'));
      });

      it('should compile stylus/basic.styl', function () {
        return expect(path.join(mnt, 'stylus/basic.css'), 'to have file content', path.join(compiled, 'stylus/basic.css'));
      });

    });

  });
});
