'use strict';

var fusile = require('../lib/');
var unmount = require('../lib/unmount');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var async = require('async');
var expect = require('unexpected');

var src = 'test/fixtures/source';
var compiled = 'test/fixtures/compiled';
var mnt = 'test/READ';

describe('In a mounted filesystem', function () {
  before(function (done) {
    unmount(mnt, function () {
      mkdirp(mnt, function (err) {
        if (err) {
          console.error(err);
          process.exit(-1);
        }

        fusile(src, mnt);

        setTimeout(done, 300);
      });
    });
  });

  after(function (done) {
    setTimeout(function () {
      unmount(mnt, function () {
        rimraf(mnt, done);
      });
    }, 300);
  });

  it('should read a directory', function (done) {
    fs.readdir(mnt, function (err, files) {
      expect(err, 'to be null');
      expect(files, 'to exhaustively satisfy', [
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

  // it('should serve files with identical content to the source', function (done) {
  //   glob('**/basic.*', {
  //     cwd: compiled
  //   }, function (err, files) {
  //     expect(err, 'to be null');

  //     async.eachSeries(files, function (file, callback) {
  //       async.parallel([
  //         function (cb) {
  //           fs.readFile(path.join(mnt, file), 'utf-8', cb);
  //         },
  //         function (cb) {
  //           fs.readFile(path.join(compiled, file), 'utf-8', cb);
  //         }
  //       ], function (err, results) {
  //         expect(err, 'to be undefined');
  //         expect(results[0], 'to be', results[1]);

  //         callback(err);
  //       });
  //     }, function (err) {
  //       expect(err, 'to be undefined');
  //       done();
  //     });
  //   });
  // });

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

    it('should compile csso/basic.css', function (done) {
      var actual = path.join(mnt, 'csso/basic.css');
      var expected = path.join(compiled, 'csso/basic.css');

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

    it('should compile ejs/basic.ejs', function (done) {
      var actual = path.join(mnt, 'ejs/basic.ejs');
      var expected = path.join(compiled, 'ejs/basic.html');

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

    it('should compile haml/basic.haml', function (done) {
      var actual = path.join(mnt, 'haml/basic.haml');
      var expected = path.join(compiled, 'haml/basic.html');

      async.parallel([
        fs.readFile.bind(undefined, actual, 'utf-8'),
        fs.readFile.bind(undefined, expected, 'utf-8')
      ], function (err, results) {
        expect(err, 'to be undefined');
        expect(results[0], 'to be', results[1]);

        done();
      });
    });

    it('should compile handlebars/basic.hbs', function (done) {
      var actual = path.join(mnt, 'handlebars/basic.hbs');
      var expected = path.join(compiled, 'handlebars/basic.html');

      async.parallel([
        fs.readFile.bind(undefined, actual, 'utf-8'),
        fs.readFile.bind(undefined, expected, 'utf-8')
      ], function (err, results) {
        expect(err, 'to be undefined');
        expect(results[0], 'to be', results[1]);

        done();
      });
    });

    it('should compile jade/basic.jade', function (done) {
      var actual = path.join(mnt, 'jade/basic.jade');
      var expected = path.join(compiled, 'jade/basic.html');

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

    it('should compile marc/basic.md', function (done) {
      var actual = path.join(mnt, 'marc/basic.md');
      var expected = path.join(compiled, 'marc/basic.html');

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

    it('should compile minify-css/basic.css', function (done) {
      var actual = path.join(mnt, 'minify-css/basic.css');
      var expected = path.join(compiled, 'minify-css/basic.css');

      async.parallel([
        fs.readFile.bind(undefined, actual, 'utf-8'),
        fs.readFile.bind(undefined, expected, 'utf-8')
      ], function (err, results) {
        expect(err, 'to be undefined');
        expect(results[0], 'to be', results[1]);

        done();
      });
    });

    it('should compile minify-html/basic.html', function (done) {
      var actual = path.join(mnt, 'minify-html/basic.html');
      var expected = path.join(compiled, 'minify-html/basic.html');

      async.parallel([
        fs.readFile.bind(undefined, actual, 'utf-8'),
        fs.readFile.bind(undefined, expected, 'utf-8')
      ], function (err, results) {
        expect(err, 'to be undefined');
        expect(results[0], 'to be', results[1]);

        done();
      });
    });

    it('should compile minify-js/basic.js', function (done) {
      var actual = path.join(mnt, 'minify-js/basic.js');
      var expected = path.join(compiled, 'minify-js/basic.js');

      async.parallel([
        fs.readFile.bind(undefined, actual, 'utf-8'),
        fs.readFile.bind(undefined, expected, 'utf-8')
      ], function (err, results) {
        expect(err, 'to be undefined');
        expect(results[0], 'to be', results[1]);

        done();
      });
    });

    it('should compile mustache/basic.mustache', function (done) {
      var actual = path.join(mnt, 'mustache/basic.mustache');
      var expected = path.join(compiled, 'mustache/basic.html');

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
        expect(results[0], 'to be', results[1]);

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

    it('should compile swig/basic.swig', function (done) {
      var actual = path.join(mnt, 'swig/basic.swig');
      var expected = path.join(compiled, 'swig/basic.html');

      async.parallel([
        fs.readFile.bind(undefined, actual, 'utf-8'),
        fs.readFile.bind(undefined, expected, 'utf-8')
      ], function (err, results) {
        expect(err, 'to be undefined');
        expect(results[0], 'to be', results[1]);

        done();
      });
    });

    it('should compile toffee/basic.toffee', function (done) {
      var actual = path.join(mnt, 'toffee/basic.toffee');
      var expected = path.join(compiled, 'toffee/basic.html');

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
