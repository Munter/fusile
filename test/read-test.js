'use strict';

var fusile = require('../lib/');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var glob = require('glob');
var async = require('async');
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

  it('should read a file', function (done) {
    fs.readFile(mnt + '/unchanged.txt', { encoding: 'utf-8' }, function (err, data) {
      expect(err, 'to be null');
      expect(data, 'to be a string');
      expect(data.toString(), 'to be', 'I am the same\n');

      done();
    });
  });

  it('should serve files with identical content to the source', function (done) {
    glob('**/expected/basic.*', {
      cwd: src
    }, function (err, files) {
      expect(err, 'to be null');

      async.eachSeries(files, function (file, callback) {
        async.parallel([
          function (cb) {
            fs.readFile(path.join(src, file), 'utf-8', cb);
          },
          function (cb) {
            fs.readFile(path.join(mnt, file), 'utf-8', cb);
          }
        ], function (err, results) {
          expect(err, 'to be undefined');
          expect(results[0], 'to be', results[1]);

          callback(err);
        });
      }, function (err) {
        expect(err, 'to be undefined');
        done();
      });
    });
  });

  it('should serve precompiled files that match the source expectation', function (done) {
    glob('**/expected/basic.*', {
      cwd: src
    }, function (err, files) {
      expect(err, 'to be null');

      async.eachSeries(files, function (file, callback) {
        async.parallel([
          function (cb) {
            var pattern = file.replace('/expected', '').replace(/\.[^\.]+$/, '*');
            glob(pattern, {
              cwd: mnt
            }, function (err, files) {
              fs.readFile(path.join(mnt, files.pop()), 'utf-8', cb);
            });
          },
          function (cb) {
            fs.readFile(path.join(src, file), 'utf-8', cb);
          }
        ], function (err, results) {
          expect(err, 'to be undefined');
          expect(results[0], 'to be', results[1]);

          callback(err);
        });
      }, function (err) {
        expect(err, 'to be undefined');
        done();
      });
    });
  });
});
