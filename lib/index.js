'use strict';

var fuse = require('fuse-bindings');
var fs = require('fs');
var path = require('path');
var when = require('when');
var node = require('when/node');
var events = require('events');
var mkdirp = require('mkdirp');

var tolk = require('tolk');

var sourceFileMap = {};
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
  var handlers = {};
  var self = new events.EventEmitter();

  // Defaults
  options = options || {};
  options.watches = options.watches || [];
  options.accord = options.accord || {
    sourcemap: true
  };

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

  self.cache = {};

  function bustCache(pathname) {
    pathname = pathname.replace(source, '');
    self.cache[pathname] = null;
    fs.utimes(path.join(mnt, pathname), new Date(), new Date());
  }

  function getCached(pathName, stat) {
    var cacheEntry = self.cache[pathName];

    if (!cacheEntry) {
      return when.reject();
    }

    var mainIsFresh = stat.mtime.getTime() > cacheEntry.mtime ? when.reject() : when.resolve();

    var partialsAreFresh = when.all((cacheEntry.imports || []).map(function (partial) {
      return node.lift(fs.stat)(partial).then(function (stat) {
        if (stat.mtime.getTime() > cacheEntry.mtime) {
          return when.reject();
        }
      });
    }));

    return when.join(mainIsFresh, partialsAreFresh)
      .then(function () {
        chatty('Cache hit', pathName);
        self.emit('info', 'cache hit', pathName);

        return when.resolve(cacheEntry.stat);
      }, function () {
        self.emit('info', 'cache miss', pathName);
        self.cache[pathName] = null;

        return when.reject(stat);
      });
  }

  function statCompiled(pathName, stat, cb) {
    getCached(pathName, stat)
      .done(
        node.liftCallback(cb),
        tolk.read(pathName).done(function (compiled) {
          console.log(compiled);
          stat.size = compiled.result.length;

          self.cache[pathName] = {
            mtime: Date.now(),
            stat: stat,
            buffer: new Buffer(compiled.result),
            imports: compiled.imports
          };

          return when.resolve(compiled.result);
        },
        function (err) {
          console.error(err);
          chatty('error', err);
          return when.reject(err);
        }))
      .then(function () {
        return cb(null, stat);
      });
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

  handlers.getattr = function (pathname, cb) {
    chatty('getattr', pathname);
    fs.stat(path.join(source, pathname), function (err, st) {
      if (err) {
        return cb(errmsg(err, 'getattr'));
      }


      return cb(err, st);
      statCompiled(pathname, st, function (err, st) {
        if (err) {
          return cb(errmsg(err, 'getattr'));
        }

        cb(0, st);
      });
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
        sourceFileMap[targetFileName] = fileName;

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
    var sourcePath = path.join(source, pathname);
    flags = toFlag(flags);

    if (flags === 'r') {
      fs.open(sourcePath, flags, function (err, fd) {
        if (err) {
          return cb(errmsg(err, 'open'));
        }

        cb(0, fd);
      });

      if (options.watches.some(function (pattern) { return minimatch(pathname, pattern); })) {

        self.gaze.add(sourcePath, function (err) {
          if (err) {
            chatty('Error, Adding a file watch failed on:', sourcePath);
          } else {
            chatty('Watching', sourcePath);
          }
        });
      }
    } else {
      console.error('open Error: Tried to open ' + pathname + ' with flags: ' + flags);
      return cb(EPERM);
    }

  };

  handlers.read = function (pathname, handle, buf, len, offset, cb) {
    chatty('read', pathname);
    var cacheEntry = self.cache[pathname];

    if (cacheEntry) {
      var length = Math.min(cacheEntry.buffer.length, len);

      cacheEntry.buffer.copy(buf, offset, offset, length - offset);

      cb(length);
    } else {
      fs.read(handle, buf, 0, len, offset, function (err, bytes) {
        if (err) {
          return cb(errmsg(err, 'read'));
        }
        cb(bytes);
      });
    }
  };

  handlers.release = function (pathname, handle, cb) {
    chatty('release', pathname);
    fs.close(handle, function (err) {
      if (err) {
        return cb(errmsg(err, 'release'));
      }
      cb(0);
    });
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

  fuse.unmount(mnt, function () {
    mkdirp(mnt, function (err) {
      if (err) {
        return console.error(err);
      }
      fuse.mount(mnt, handlers, function () {
        self.emit('mount');
      });
    });
  });

  return self;
};
