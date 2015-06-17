'use strict';

module.exports = function getErrorScript(errorMessage) {
    var cleanErrorMessage = errorMessage.replace(/\n/g, '\\\n').replace(/"/g, '\\"');

    return [
        '/**********************************************************',
        errorMessage.split('\n').map(function (str) {
            return ' * ' + str;
        }).join('\n'),
        ' *********************************************************/',
        ';(function () {',
        '    var element = document.createElement("DIV");',
        '    element.style.position = "absolute";',
        '    element.style.top = 0;',
        '    element.style.left = 0;',
        '    element.style.right = 0;',
        '    element.style.backgroundColor = "white";',
        '    element.style.zIndex = 999999;',
        '    element.style.fontSize = "20px";',
        '    element.style.lineHeight = "20px";',
        '    element.style.border = "4px dashed red";',
        '    element.style.color = "black";',
        '    element.style.margin = "10px";',
        '    element.style.padding = "10px";',
        '    element.style.textAlign = "left";',
        '    element.style.whiteSpace = "pre";',
        '    element.style.fontFamily = "monospace";',
        '    element.innerText = "' + cleanErrorMessage + '";',
        '    document.body.appendChild(element);',
        '}());',
        ''
    ].join('\n');
};
