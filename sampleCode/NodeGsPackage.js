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

        require('module').define('./module.js', function () {
            ;       // module code
        });

        require('module').startMain('./nodegs.js');

            ;       // main code

            global.process = (function () {
                return {};
            })();

            module.exports = function () {};

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
