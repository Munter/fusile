'use strict';

var fusile = require('../lib/');
var fuse = require('fuse-bindings');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var async = require('async');
var when = require('when');
var whenFs = require('when/node').liftAll(fs);

var expect = require('unexpected')
  .clone()
  .installPlugin(require('unexpected-promise'))
  .installPlugin(require('unexpected-sinon'));

expect.addAssertion('string', 'to have file content', function (expect, subject, cmp) {
  return when.all([
    whenFs.readFile(subject, 'utf8'),
    whenFs.readFile(cmp, 'utf8')
  ]).then(function (results) {
    return expect(results[0], 'to equal', results[1]);
  });
});

var src = 'fixtures/source';
var compiled = 'fixtures/compiled';
var mnt = 'test/AUTOPREFIXER';

describe('Autoprefixer', function () {
  before(function (done) {
    fuse.unmount(mnt, function () {
      mkdirp(mnt, function (err) {
        if (err) {
          console.error(err);
          process.exit(-1);
        }

        fusile(src, mnt, {
          browsers: ['last 500 versions'],
          accord: {}
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

  it('should prefix autoprefixer/unprefixed.css', function () {
    return expect(path.join(mnt, 'autoprefixer/unprefixed-css.css'), 'to have file content', path.join(compiled, 'autoprefixer/unprefixed-css.css'));
  });

  it('should prefix autoprefixer/unprefixed.scss', function () {
    return expect(path.join(mnt, 'autoprefixer/unprefixed-scss.css'), 'to have file content', path.join(compiled, 'autoprefixer/unprefixed-scss.css'));
  });

  it('should prefix autoprefixer/unprefixed.less', function () {
    return expect(path.join(mnt, 'autoprefixer/unprefixed-less.css'), 'to have file content', path.join(compiled, 'autoprefixer/unprefixed-less.css'));
  });

  it('should prefix autoprefixer/unprefixed.myth', function () {
    return expect(path.join(mnt, 'autoprefixer/unprefixed-myth.css'), 'to have file content', path.join(compiled, 'autoprefixer/unprefixed-myth.css'));
  });

  it('should prefix autoprefixer/unprefixed.styl', function () {
    return expect(path.join(mnt, 'autoprefixer/unprefixed-styl.css'), 'to have file content', path.join(compiled, 'autoprefixer/unprefixed-styl.css'));
  });
});
