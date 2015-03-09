'use strict';

var fusile = require('../lib/');
var unmount = require('../lib/unmount');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var async = require('async');
var expect = require('unexpected');

var src = 'fixtures/source';
var compiled = 'fixtures/compiled';
var mnt = 'test/AUTOPREFIXER';

describe('Autoprefixer', function () {
  before(function (done) {
    unmount(mnt, function () {
      mkdirp(mnt, function (err) {
        if (err) {
          console.error(err);
          process.exit(-1);
        }

        fusile(src, mnt, {
          browsers: ['last 500 versions']
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

  describe('when reading an unprefixed files', function () {
    it('should run', function () {
      expect(true, 'to be true');
    });
    it('should prefix autoprefixer/unprefixed.css', function (done) {
      var actual = path.join(mnt, 'autoprefixer/unprefixed.css');
      var expected = path.join(compiled, 'autoprefixer/unprefixed.css');

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
