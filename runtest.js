#!/usr/bin/env node
'use strict';

var fuse = require('fuse-bindings');
var fusile = require('./lib');
var mkdirp = require('mkdirp');

var testTarget = '__TEST_MOUNT_POINT';

mkdirp(testTarget);

fusile('fixtures/source', testTarget, {
  watches: ['**/*.*'],
  verbose: true
});

///////

// var fs = require('fs');
// var path = require('path');

// var origFile = path.join(process.cwd(), 'test/fixtures/source', 'unchanged.txt');
// var fuseFile = path.join(process.cwd(), testTarget, 'unchanged.txt');
// var shortFuseFile = path.join(testTarget, 'unchanged.txt');

// setTimeout(function () {
//   fs.watch(shortFuseFile, function (event, pathname) {
//     console.log('watcher', event, pathname);
//   });

//   setInterval(function () {
//     console.log('Touching', origFile);
//     fs.utimes(origFile, new Date(), new Date());
//   }, 1000);

//   setTimeout(function () {
//     fs.readFile(fuseFile, 'utf-8', function (err, data) {
//       console.log('readFile', err, data);
//     });
//   }, 2000);
// }, 100);

///////

// Start reading from stdin
process.stdin.resume();

process.on('SIGINT', function () {
  fuse.unmount(testTarget, function () {
    console.error('Unmounted: ' + testTarget);

    process.exit(0);
  });
});
