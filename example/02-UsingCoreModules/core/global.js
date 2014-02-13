
if (typeof global !== 'object') {
    (function () {
        this.global = this;
    })();

    global.process = require('process');

    global.Buffer = require('buffer');

    global.console = require('console');

    // Error.captureStackTrace = function (THIS, stackStartFunction) {};
}

module.exports = global;
