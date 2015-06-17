'use strict';

var jsError = require('./jserror');

module.exports = function getErrorHtml(error) {
  return '<script>' + jsError(error) + '</script>';
};
