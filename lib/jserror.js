'use strict';

var cssError = require('csserror');
var chalk = require('chalk');

module.exports = function getErrorScript(errorMessage) {
    var cleanErrorMessage = chalk.stripColor(errorMessage).replace(/"/g, '\\"');

    return [
        '/**********************************************************',
        errorMessage.split('\n').map(function (str) {
            return ' * ' + str;
        }).join('\n'),
        ' *********************************************************/',
        ';(function () {',
        '    var errorStyleSheet = "<style>' + cssError(cleanErrorMessage, true).replace(/"/g, '\\"') + '</style>"',
        '    document.write(errorStyleSheet);',
        '}());',
        ''
    ].join('\n');
};
