#!/usr/bin/env node
'use strict';

var argv = require('minimist')(process.argv.slice(2));
var path = require('path');
var fusile = require('../lib/index');
var mkdirp = require('mkdirp');

if (argv._.length < 2 || argv.h) {
  console.error('Usage: $0 <sourceDir> <targetDir>');
  process.exit(1);
}

var sourceDir = path.resolve(process.cwd(), argv._[0]);
var mountPoint = path.resolve(process.cwd(), argv._[1]);

mkdirp(mountPoint, function () {
  fusile(sourceDir, mountPoint, {
    watches: argv.watch,
    verbose: argv.v
  });

  // Start reading from stdin
  process.stdin.resume();

  console.log('File system started at ' + mountPoint);
  console.log('To stop it, press Ctrl+C');

  process.on('SIGINT', function () {
    require('../lib/unmount')(mountPoint, function () {
      console.error('\nUnmounted: ' + mountPoint);

      process.exit(0);
    });
  });
});
