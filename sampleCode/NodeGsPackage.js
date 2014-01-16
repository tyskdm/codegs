require('module').define('/any/user/module', function () {
    ;       // module code
});

require('module').define('/any/user/module', function () {
    ;       // module code
});

require('module').define('anyUserModule', function () {
    ;       // module code
});

require('module').startMain('./nodegs.js');

    ;       // main code

require('module').endMain();

function require(path) {
// この関数の中を、圧縮して難読化したい。

    require = (function () {

        // start Code.gs package

        require('module').define('./assert.js', function () {
            ;       // module code
        });

        require('module').define('./util.js', function () {
            ;       // module code
        });

        require('module').define('./process.js', function () {
            ;       // module code
        });

        require('module').startMain('./nodegs.js');

            // Node.js Global Objects
            if (typeof global === undefined) {
                this.global = this;
            }
            global.process = require('./process.js');
            global.console = require('./console.js');
            (function () {
                var timer = require('./timers.js');
                global.setTimeout = timer.setTimeout;
                global.clearTimeout = timer.clearTimeout;
                global.setInterval = timer.setInterval;
                global.clearInterval = timer.clearInterval;
            })();

            require('module')._resolveFilename = require('./resolve.js');

        require('module').endMain();

        function require(path) {

            require = (function () {
                function Module(id, parent) {};
                Module.prototype.require = function (path) {};
                return Module.prototype.require;
            })();

            return require(path);
        }
        if (node.js) {
            module.exports = Module;
        }

        // end of Code.gs package

    })();

    return require(path);
}
