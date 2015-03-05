# fusile

A web asset precompiling file system proxy.

Mounts a fuse file system on a target directory, auto loads available compilers, compiles assets on request, caches compiled assets if source file is unmodified, watches original file for changes on demand.

## Installation

Prerequisites: [Fuse](https://github.com/bcle/fuse4js#requirements)

```
npm install -g fusile
```

## Usage

**General usage:** `fusile <sourceDir> <mountPoint>`

Fusile is a compiling file system proxy. In order to get it to compile your assets you need to install one or more of these precompilers: `LiveScript`, `babel`, `coco`, `coffee-script`, `dogescript`, `less`, `marked`, `myth`, `node-sass`, `stylus`, `swig`

When any of the above precompilers are available in the context of fusile (in your project root or globally installed), fusile will automatically load it and start compiling files with the corresponding file extension when you read the files from the mountpoint.


## File watching

**General usage:** `fusile <sourceDir> <mountPoint> --watch "**/*.jsx" --watch "**/*.less" -w "**/*.stylus" -w "**/*.scss"`

You can add file watches to files in the Fusile mountpoint. Because Fusile can't yet pick up your file watchin events you will need to specify glob patterns like above, which will set up file watchers on the matching patterns.

File watchers will be set up per individual file, and only at the time when you open a file for reading. This should ensure a miniumum amount of inode watches, and a minimum amount of recompiles.

Note that watcher glob patterns are quoted to avoid shell expansion of the glob patterns at execution time.

## License
MIT
