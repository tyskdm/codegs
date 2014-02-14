
if (typeof global === 'undefined') {
    (function () {
        this.global = this;
    })();

    global.process = require('process');

    global.Buffer = require('buffer');

    global.console = require('console');

}

module.exports = global;
