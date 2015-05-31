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
    return readCompiled(getPath('unchanged.txt')).then(function (result) {
      return expect(result, 'to be', 'I am the same\n');
    });
  });

  it('should throw when reading a file that does not exist', function () {
    return readCompiled(getPath('does-not-exist.txt')).catch(function (err) {
      return expect(err, 'to have message', 'ENOENT, open \'/home/munter/git/fusile/fixtures/source/does-not-exist.txt\'');
    });
  });

  it('should compile a file if there is an adapter', function () {
    return readCompiled(getPath('babel/simplest.jsx')).then(function (result) {
      return expect(result, 'to be', '"use strict";\n\nvar foo = "bar";\n//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL211bnRlci9naXQvZnVzaWxlL2ZpeHR1cmVzL3NvdXJjZS9iYWJlbC9zaW1wbGVzdC5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMiLCJmaWxlIjoiL2hvbWUvbXVudGVyL2dpdC9mdXNpbGUvZml4dHVyZXMvc291cmNlL2JhYmVsL3NpbXBsZXN0LmpzeCJ9\n');
    });
  });

  it('should autoprefix uncompiled CSS output', function () {
    return readCompiled(getPath('basic.css')).then(function (result) {
      return expect(result, 'to be', 'body {\n  -webkit-transform: rotate(-1deg);\n          transform: rotate(-1deg);\n}\n');
    });
  });

  it('should autoprefix compiled CSS output', function () {
    return readCompiled(getPath('scss/autoprefix.scss')).then(function (result) {
      return expect(result, 'to be', 'body {\n  -webkit-transform: rotate(-1deg);\n          transform: rotate(-1deg); }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL211bnRlci9naXQvZnVzaWxlL2ZpeHR1cmVzL3NvdXJjZS9zY3NzL2F1dG9wcmVmaXguc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQTtFQUNFLGtDQUFXO1VBQVgsMEJBQVcsRUFBQSIsImZpbGUiOiJ0by5jc3MifQ== */');
    });
  });
});
