'use strict';

var fusile = require('../lib/');
var fs = require('fs');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var expect = require('unexpected');

var src = 'test/fixtures';
var mnt = 'test/READ';

describe('when reading files from the mounted filesystem', function () {
  before(function (done) {
    mkdirp(mnt, function (err) {
      if (err) {
        console.error(err);
        process.exit(-1);
      }

      fusile(src, mnt);

      setTimeout(done, 100);
    });

  });

  after(function (done) {
    setTimeout(function () {
      require('../lib/unmount')(mnt, function () {
        rimraf(mnt, done);
      });
    }, 100);
  });

  it('should read a directory', function (done) {
    fs.readdir(mnt, function (err, files) {
      expect(err, 'to be null');
      expect(files, 'to exhaustively satisfy', [
        '6to5',
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
        'toffee'
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

  it('should read a file', function (done) {
    fs.readFile(mnt + '/less/basic.less', { encoding: 'utf-8' }, function (err, data) {
      expect(data, 'to be a string');
      expect(data.toString(), 'to be', '@color: #428bca;\n\n.test {\n  color: @color;\n}\n');

      done();
    });
  });
});
