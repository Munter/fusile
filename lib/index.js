'use strict';

var fuse = require('fuse-bindings');
var fs = require('fs');
var path = require('path');
var when = require('when');
var node = require('when/node');
var events = require('events');
var mkdirp = require('mkdirp');
var cssError = require('csserror');
var jsError = require('./jserror');
var htmlError = require('./htmlerror');

var whenFs = node.liftAll(fs);

var tolk = require('tolk');

var targetExtension = {};
var sourceExtension = {};

Object.keys(tolk.extensions).forEach(function (sourceExt) {
  var adapters = tolk.extensions[sourceExt];
  var targetExt = '.' + adapters[0].output;

  targetExtension[sourceExt] = targetExt;


  if (!sourceExtension[targetExt]) {
    sourceExtension[targetExt] = [];
  }

  sourceExtension[targetExt].push(sourceExt);
});

var minimatch = require('minimatch');
var Gaze = require('gaze');

var errno = require('errno');

function errmsg(err, method) {
  var str = method + ' Error: ';

  // if it's a libuv error then get the description from errno
  if (errno.errno[err.errno]) {
    str += errno.errno[err.errno].description;
  } else {
    str += err.message;
  }

  // if it's a `fs` error then it'll have a 'path' property
  if (err.path) {
    str += ' [' + err.path + ']';
  }
  // console.error(str);

  return -err.errno;
}

var EPERM = -1;

module.exports = function (source, mnt, options) {
  var handlers = {
    options: ['direct_io'],
    displayFolder: true,
    force: true
  };
  var self = new events.EventEmitter();

  // Defaults
  options = options || {};
  options.watches = options.watches || [];
  options.sourceMap = options.sourceMap === false ? false : true;

  function chatty() {
    if (options.verbose) {
      console.error.apply(console, arguments);
    }
  }

  self.directory = source;
  self.mountPoint = mnt;

  source = path.resolve(source);

  // Fuse sends in file spaths with prepended slash. Most people won't create patterns that match that
  options.watches = options.watches.map(function (pattern) {
    return '/' + pattern.replace(/^\//, '');
  });

  self.sourceFileMap = {};
  self.tolkCache = {};

  function bustCache(pathname) {
    chatty('busting cache for path', pathname);

    pathname = pathname.replace(source, '');
    chatty('normalised path to', pathname);

    self.tolkCache[pathname] = null;

    chatty('updating file times to now')
    var now = new Date();
    fs.utimes(path.join(mnt, pathname), now, now);
  }

  self.gaze = new Gaze('');

  self.gaze.on('all', function (event, pathname) {
    chatty('gaze', event, pathname.replace(source, ''));
    if (event === 'deleted' || event === 'renamed') {
      // OSX combined with editors that do atomic file replacements
      // will not emit 'change' events: https://github.com/joyent/node/issues/2062
      // Remove the file watch and assume it will be re-added when the main file is requested again
      this.remove(path);
      // fileChanged(path);
      // delete sassFileMap[path];
      return;
    }

    if (event === 'changed') {
      bustCache(pathname);
    }
  });

  handlers.init = function (cb) {
    // Do setup work here
    // console.log('File system started at ' + self.mountPoint);
    // console.log('To stop it, type this in another shell: fusermount -u ' + self.mountPoint);
    self.emit('init');
    cb();
  };

  function shouldCompileFile(pathname) {
    var ext = path.extname(pathname);

    return !!(ext && sourceExtension[ext]);
  }

  handlers.getattr = function (pathname, cb) {
    chatty('getattr', pathname);

    var ext = path.extname(pathname);
    var statCache;

    when.promise(function resolveFileName(resolve, reject) {
      if (!shouldCompileFile) {
        return resolve(pathname);
      }

      if (self.sourceFileMap[pathname]) {
        // console.log('sourceFileMap hit', pathname);
        return resolve(self.sourceFileMap[pathname]);
      } else {
        // console.log('sourceFileMap miss', pathname);
        return reject();
      }
    })
    .catch(function discoverUnresolvedFileName() {
      // We have a target file without a known source file
      // Let's resolve what the target file is and store it in the cache
      return when.any([ext].concat(sourceExtension[ext]).map(function (extension) {
        var lookupFileName = pathname.replace(new RegExp(ext.replace('.', '\\.') + '$'), extension);
        // console.log('lookup:', lookupFileName);

        return whenFs.stat(path.join(source, lookupFileName))
          .then(function (st) {
            statCache = st;
            self.sourceFileMap[pathname] = lookupFileName;

            return when.resolve(lookupFileName);
          });
      }));
    })
    .then(function statRequestedFile(sourcePath) {
      if (statCache) {
        // The stat call was already executed, don't run it again
        return when.resolve(statCache);
      } else {
        return whenFs.stat(path.join(source, sourcePath));
      }
    })
    .then(function (st) {
      st.size = st.size * 100 + 1000000;

      return when.resolve(st);
    })
    .done(cb.bind(null, 0), function (err) {
      // Delete that cache entry since it was obviously stale
      delete self.sourceFileMap[pathname];

      cb(errmsg(err, 'getattr'));
    });
  };

  handlers.readdir = function (pathname, cb) {
    chatty('readdir', pathname);
    fs.readdir(path.join(source, pathname), function (err, files) {
      if (err) {
        return cb(errmsg(err, 'readdir'));
      }

      var rewrittenExtensionFiles = files.map(function (fileName) {
        var ext = path.extname(fileName);
        var targetFileName;

        if (ext && targetExtension[ext]) {
          // Replace source file extension with target file extension
          targetFileName = fileName.replace(new RegExp(ext.replace('.', '\\.') + '$'), targetExtension[ext]);
        } else {
          targetFileName = fileName;
        }

        // Cache mapping to reduce stat calls on reverse lookup
        self.sourceFileMap[targetFileName] = fileName;

        return targetFileName;
      });

      cb(0, rewrittenExtensionFiles);
    });
  };

  var toFlag = function (flags) {
    /*jshint bitwise:false*/
    flags = flags & 3;
    /*jshint bitwise:true*/
    if (flags === 0) {
      return 'r';
    }
    if (flags === 1) {
      return 'w';
    }
    return 'r+';
  };

  handlers.open = function (pathname, flags, cb) {
    chatty('open', pathname);
    flags = toFlag(flags);

    if (flags !== 'r') {
      console.error('open Error: Tried to open ' + pathname + ' with flags: ' + flags);
      return cb(EPERM);
    }

    var sourceFile = path.join(source, self.sourceFileMap[pathname] || pathname);

    whenFs.open(sourceFile, flags)
    .tap(function initiateWatches() {
      if (options.watches.some(function (pattern) { return minimatch(pathname, pattern); })) {

        self.gaze.add(sourceFile, function (err) {
          if (err) {
            chatty('Error, Adding a file watch failed on:', sourceFile);
          } else {
            chatty('Watching', sourceFile);
          }
        });
      }
    })
    .tap(function initiateTolk() {
      if (!shouldCompileFile(pathname)) {
        return;
      }

      if (!self.tolkCache[pathname]) {
        self.tolkCache[pathname] = {};
      }

      var cacheEntry = self.tolkCache[pathname];

      when.resolve(cacheEntry)
      .then(function checkCompileTime(cacheEntry) {
        if (!(cacheEntry.compileTime && cacheEntry.tolkPromise)) {
          return when.reject(cacheEntry);
        } else {
          return when.resolve(cacheEntry);
        }
      })
      .then(function compareLastModifiedTime(cacheEntry) {
        return cacheEntry.tolkPromise.then(function (compiled) {
          var files = [sourceFile].concat(compiled.imports || []);

          return when.all(files.map(function (statPath) {
            return whenFs.stat(statPath).then(function (stat) {
              if (stat.mtime.getTime() > cacheEntry.compileTime) {
                return when.reject(cacheEntry);
              }
            });
          }))
          .then(function (cacheEntry) {
            return when.resolve(cacheEntry);
          });
        });
      })
      .tap(function () {
        self.emit('info', 'cache hit', pathname);
      })
      .catch(function compileFile(cacheEntry) {
        self.emit('info', 'cache miss', pathname);

        cacheEntry.compileTime = Date.now();
        cacheEntry.tolkPromise = tolk.read(sourceFile, options).catch(function (err) {
          // Don't cache compile errors
          self.tolkCache[pathname].fail = true;

          var line = err.line || (err.loc && err.loc.line);
          var col = err.column || (err.loc && err.loc.column);

          var errStr = 'Transpiler error: ' + sourceFile + ':' + line;

          if (typeof col === 'number') {
            errStr += ':' + col;
          }

          errStr += '\n' + err.message;

          var ext = path.extname(pathname);
          var compiled = {};

          switch (ext) {
            case '.css':
              compiled.result = cssError(errStr);
              break;
            case '.js':
              compiled.result = jsError(errStr);
              break;
            case '.html':
              compiled.result = htmlError(errStr);
              break;
            default:
              compiled.result = errStr;
          }

          // Upgrade error
          err.message = errStr;
          err.line = line;
          err.col = col;

          self.emit('transpilererror', err);

          return when.resolve(compiled);
        });
      });
    })
    .done(cb.bind(null, 0), function rejected(err) { cb(errmsg(err, 'open')); });
  };

  handlers.read = function (pathname, handle, buf, len, offset, cb) {

    chatty('read', 'pathname', pathname, 'len', len, 'offset', offset);
    var cacheEntry = self.tolkCache[pathname];

    if (cacheEntry && cacheEntry.tolkPromise) {
      chatty('tolkPromise exists');

      cacheEntry.tolkPromise.done(function (compiled) {
        chatty('success from tolkPromise', compiled);

        var slice = compiled.result.slice(offset, offset + len);
        chatty('writing slice', slice.substr(0, 100));
        buf.write(slice);

        chatty('calling back with length', slice.length);
        cb(slice.length);
      }, function (err) {
        chatty('error from tolkPromise', err);
        return cb(errmsg(err, 'read'));
      });

    } else {
      chatty('tolkPromise doesn\'t exist, reading from handle');

      fs.read(handle, buf, 0, len, offset, function (err, bytes) {
        if (err) {
          chatty('error reading from handle', err);
          return cb(errmsg(err, 'read'));
        }
        chatty('success reading from handle');
        cb(bytes);
      });
    }
  };

  handlers.release = function (pathname, handle, cb) {
    chatty('release', pathname);

    // Delete compiler cache if it was marked as a failed compile
    if (self.tolkCache[pathname] && self.tolkCache[pathname].fail) {
      delete self.tolkCache[pathname];
    }

    whenFs.close(handle)
    .done(cb.bind(null, 0), function (err) { cb(errmsg(err, 'release')); });
  };

  handlers.truncate = function (pathname, size, cb) {
    chatty('truncate', pathname);
    cb(EPERM);
  };

  handlers.write = function (pathname, handle, buf, len, offset, cb) {
    chatty('write', pathname);
    cb(EPERM);
  };

  handlers.unlink = function (pathname, cb) {
    chatty('unlink', pathname);
    cb(EPERM);
  };

  handlers.rename = function (src, dst, cb) {
    chatty('rename', src, dst);
    cb(EPERM);
  };

  handlers.mkdir = function (pathname, mode, cb) {
    chatty('mkdir', pathname);
    cb(EPERM);
  };

  handlers.rmdir = function (pathname, cb) {
    chatty('rmdir', pathname);
    cb(EPERM);
  };

  handlers.chown = function (pathname) {
    chatty('chown', pathname);
    console.error('chown is not implemented');
  };

  handlers.chmod = function (pathname, mode, cb) {
    chatty('chmod', pathname);
    cb(EPERM);
  };

  handlers.create = function (pathname, mode, cb) {
    chatty('create', pathname);
    cb(EPERM);
  };

  handlers.getxattr = function (pathname, name, buffer, length, offset, cb) {
    chatty('getxattr', pathname);
    cb(EPERM);
  };

  handlers.setxattr = function (pathname, name, buffer, length, offset, flags, cb) {
    chatty('setxattr', pathname, name);
    cb(EPERM);
  };

  handlers.statfs = function (path, cb) {
    cb(0, {
      bsize: 1000000,
      frsize: 1000000,
      blocks: 1000000,
      bfree: 1000000,
      bavail: 1000000,
      files: 1000000,
      ffree: 1000000,
      favail: 1000000,
      fsid: 1000000,
      flag: 1000000,
      namemax: 1000000
    });
  };

  handlers.destroy = function (cb) {
    chatty('destroy');

    self.gaze.close();

    self.emit('destroy');

    cb();
  };

  mkdirp(mnt, function (err) {
    if (err) {
      return console.error(err);
    }
    fuse.mount(mnt, handlers, function () {
      self.emit('adaptersLoaded', tolk.adapters);
      self.emit('mount');
    });
  });

  return self;
};
