'use strict';

var f4js = require('fuse4js');
var fs = require('fs');
var path = require('path');
var proc = require('child_process');
var events = require('events');
var mkdirp = require('mkdirp');

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

module.exports = function (source, mnt) {
  var handlers = {};
  var self = new events.EventEmitter();

  self.directory = source;
  self.mountpoint = mnt;

  source = path.resolve(source);

  handlers.init = function (cb) {
    // Do setup work here
    console.log('File system started at ' + self.mountPoint);
    console.log('To stop it, type this in another shell: fusermount -u ' + self.mountPoint);
    cb();
  };

  handlers.getattr = function (pathname, cb) {
    fs.stat(path.join(source, pathname), function (err, st) {
      if (err) {
        return cb(errmsg(err, 'getattr'));
      }
      cb(0, st);
    });
  };

  handlers.readdir = function (pathname, cb) {
    fs.readdir(path.join(source, pathname), function (err, files) {
      if (err) {
        return cb(errmsg(err, 'readdir'));
      }
      cb(0, files);
    });
  };

  var toFlag = function (flags) {
    flags = flags & 3;
    if (flags === 0) {
      return 'r';
    }
    if (flags === 1) {
      return 'w';
    }
    return 'r+';
  };

  handlers.open = function (pathname, flags, cb) {
    pathname = path.join(source, pathname);
    flags = toFlag(flags);

    if (flags === 'r') {
      fs.open(pathname, flags, function (err, fd) {
        if (err) {
          return cb(errmsg(err, 'open'));
        }

        cb(0, fd);
      });
    } else {
      console.error('open Error: Tried to open ' + pathname + ' with flags: ' + flags);
      return cb(EPERM);
    }

  };

  handlers.read = function (pathname, offset, len, buf, handle, cb) {
    console.log('READ', pathname, offset, len);
    // fs.readFile(pathname, function (err, data) {
    //   if (err) {
    //     return cb(errmsg(err, 'read'));
    //   }
    //   var sourceBuffer = new Buffer(data);

    //   sourceBuffer.copy(buf, offset, offset, len);

    //   cb(0);
    // });

    fs.read(handle, buf, 0, len, offset, function (err, bytes) {
      if (err) {
        return cb(errmsg(err, 'read'));
      }
      cb(0, bytes);
    });
  };

  handlers.release = function (pathname, handle, cb) {
    fs.close(handle, function (err) {
      if (err) {
        return cb(errmsg(err, 'release'));
      }
      cb(0);
    });
  };

  handlers.truncate = function (pathname, size, cb) {
    cb(EPERM);
  };

  handlers.write = function (pathname, offset, len, buf, handle, cb) {
    cb(EPERM);
  };

  handlers.unlink = function (pathname, cb) {
    cb(EPERM);
  };

  handlers.rename = function (src, dst, cb) {
    cb(EPERM);
  };

  handlers.mkdir = function (pathname, mode, cb) {
    cb(EPERM);
  };

  handlers.rmdir = function (pathname, cb) {
    cb(EPERM);
  };

  handlers.chown = function () {
    console.error('chown is not implemented');
  };

  handlers.chmod = function (pathname, mode, cb) {
    cb(EPERM);
  };

  handlers.create = function (pathname, mode, cb) {
    cb(EPERM);
  };

  handlers.getxattr = function (pathname, cb) {
    cb(-errno(err));
  };

  handlers.setxattr = function (pathname, name, value, size, a, b, cb) {
    cb(EPERM);
  };

  handlers.statfs = function (cb) {
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
    cb();
  };

  proc.exec('umount ' + JSON.stringify(mnt), function () {
    mkdirp(mnt, function (err) {
      if (err) {
        return console.error(err);
      }
      f4js.start(mnt, handlers, false, []);
      self.emit('mount');
    });
  });

  return self;
};
