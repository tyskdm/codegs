
var process = {};

var logger = require('Logger');
process.stdout = { write: function (data) {
    logger.log(data);
    }
};

process.platform = 'GoogleAppsScript';
process.pid = 0;

process.env = {};
process.env.NODE_DEBUG = false;

Error.captureStackTrace = function (THIS, stackStartFunction) {
    console.log('Error.captureStackTrace called');
};

module.exports = process;
