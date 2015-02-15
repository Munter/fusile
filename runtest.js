#!/usr/bin/env node
'use strict';

var fusile = require('./lib');
var mkdirp = require('mkdirp');

var testTarget = '__TEST_MOUNT_POINT';

mkdirp(testTarget);

fusile('test/fixtures', testTarget);

// Start reading from stdin
process.stdin.resume();

process.on('SIGINT', function () {
  require('./lib/unmount')(testTarget, function () {
    console.error('Unmounted: ' + testTarget);

    process.exit(0);
  });
});
