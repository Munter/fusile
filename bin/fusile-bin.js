#!/usr/bin/env node
'use strict';

process.env.UV_THREADPOOL_SIZE = 64;

var argv = require('minimist')(process.argv.slice(2));
var path = require('path');
var rimraf = require('rimraf');
var fuse = require('fuse-bindings');
var fusile = require('../lib/index');
var mkdirp = require('mkdirp');

if (argv._.length < 2 || argv.h) {
  console.error('Usage: $0 <sourceDir> <targetDir> [-v] [-w path/to/watchTarget.scss]');
  process.exit(1);
}

var sourceDir = path.resolve(process.cwd(), argv._[0]);
var mountPoint = path.resolve(process.cwd(), argv._[1]);

var watches = [].concat(argv.watch || [], argv.w || []);

mkdirp(mountPoint, function () {
  var instance = fusile(sourceDir, mountPoint, {
    watches: watches,
    verbose: argv.v,
    browsers: ['last 2 versions']
  });

  instance.on('error', console.error.bind(console));

  var kill = function () {
    try {
      process.removeListener('SIGINT', kill);
      process.removeListener('SIGTERM', kill);
    } catch(e) {}

    fuse.unmount(mountPoint, function () {
      rimraf(mountPoint, function () {
        console.error('\nUnmounted: ' + mountPoint);

        process.exit(0);
      });
    });
  };

  // Start reading from stdin
  process.stdin.resume();

  console.log('File system started at ' + mountPoint);
  if (watches.length) {
    console.log('Watching patterns: ' + watches);
  }
  console.log('To stop it, press Ctrl+C');

  process.on('SIGINT', kill);
  process.on('SIGTERM', kill);
  instance.on('destroy', kill);
});
