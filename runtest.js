#!/usr/bin/env node
'use strict';

var fusile = require('./lib');
var mkdirp = require('mkdirp');

var testTarget = 'test/mountpoint';

var proc = require('child_process');
var spawn = function (cmd, args, cb) {
  var ps = proc.spawn(cmd, args);
  var done = function () {
    ps.removeListener('error', done);
    ps.removeListener('exit', done);
    if (typeof cb === 'function') {
      cb();
    }
  };
  ps.on('exit', done);
  ps.on('error', done);
};


mkdirp(testTarget);

fusile('test/fixtures', testTarget);

// Start reading from stdin
process.stdin.resume();

process.on('SIGINT', function () {
  spawn('umount', [testTarget], function () {
    spawn('fusermount', ['-u', testTarget], function () {
      process.exit(0);
    });
  });
});


