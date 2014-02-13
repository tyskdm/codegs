
var process = {};

var logger = require('Logger');
process.stdout = { write: logger.log };

process.platform = 'GoogleAppsScript';
process.pid = 0;

process.env = {};
process.env.NODE_DEBUG = false;

module.exports = process;
