'use strict';

var Path = require('path');
var expect = require('unexpected').clone();
expect.installPlugin(require('unexpected-promise'));

var readCompiled = require('../lib/readCompiled');

function getPath(path) {
  return Path.join(process.cwd(), 'fixtures/source', path);
}

describe('readCompiled', function () {
  it('should read a file directly if there is no adapter', function () {
    return expect(readCompiled(getPath('unchanged.txt')), 'to be resolved with', 'I am the same\n');
  });

  it('should throw when reading a file that does not exist', function () {
    return expect(readCompiled(getPath('does-not-exist.txt')), 'when rejected', 'to exhaustively satisfy', {
      code: 'ENOENT',
      errno: 34,
      path: /fixtures\/source\/does-not-exist\.txt$/,
      message: /^ENOENT, open '.+?fixtures\/source\/does-not-exist\.txt'$/
    });
  });

  it('should compile a file if there is an adapter', function () {
    return expect(readCompiled(getPath('babel/simplest.jsx')), 'to be resolved with', '"use strict";\n\nvar foo = "bar";\n//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL211bnRlci9naXQvZnVzaWxlL2ZpeHR1cmVzL3NvdXJjZS9iYWJlbC9zaW1wbGVzdC5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMiLCJmaWxlIjoiL2hvbWUvbXVudGVyL2dpdC9mdXNpbGUvZml4dHVyZXMvc291cmNlL2JhYmVsL3NpbXBsZXN0LmpzeCJ9\n');
  });

  it('should throw when compiling a file that does not exist', function () {
    return expect(readCompiled(getPath('does-not-exist.scss')), 'when rejected', 'to exhaustively satisfy', {
      code: 'ENOENT',
      errno: 34,
      path: /fixtures\/source\/does-not-exist\.scss$/,
      message: /^ENOENT, open '.+?fixtures\/source\/does-not-exist\.scss'$/
    });
  });

  it('should throw when compiling a file with syntax errors', function () {
    return expect(readCompiled(getPath('scss/syntaxerror.scss')), 'when rejected', 'to exhaustively satisfy', {
      status: 1,
      file: /fixtures\/source\/scss\/syntaxerror\.scss$/,
      line: 2,
      column: 3,
      message: 'property "color" must be followed by a \':\'',
      code: 1
    });
  });

  it('should autoprefix uncompiled CSS output', function () {
    return expect(readCompiled(getPath('basic.css')), 'to be resolved with', 'body {\n  -webkit-transform: rotate(-1deg);\n          transform: rotate(-1deg);\n}\n');
  });

  it('should autoprefix compiled CSS output', function () {
    return expect(readCompiled(getPath('scss/autoprefix.scss')), 'to be resolved with', 'body {\n  -webkit-transform: rotate(-1deg);\n          transform: rotate(-1deg); }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL211bnRlci9naXQvZnVzaWxlL2ZpeHR1cmVzL3NvdXJjZS9zY3NzL2F1dG9wcmVmaXguc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQTtFQUNFLGtDQUFXO1VBQVgsMEJBQVcsRUFBQSIsImZpbGUiOiJ0by5jc3MifQ== */');
  });
});
