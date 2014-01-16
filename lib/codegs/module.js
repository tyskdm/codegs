/**
 * module.js
 */
function require(path) {

    require = (function () {

        function Module(id, parent) {
            this.id = id;
            this.exports = {};
            this.parent = parent;
            if (parent && parent.children) {
                parent.children.push(this);
            }

            this.filename = null;
            this.loaded = false;
            this.children = [];
        };

        Module._files = {};
        Module._cache = {};
        Module._mainModule = new Module('.', null);

        Module.prototype.require = function (path) {
            return Module._load(path, this);
        };

        Module.define = function (filename, func) {
            Module._files[filename] = func;
        };

        Module.exists = function (filename) {
            return Module._files[filename] ? true : false;
        };

        Module.startMain = function (filename) {
            Module._mainModule.filename = filename;
            Module._cache[filename] = Module._mainModule;
        };

        Module.endMain = function (filename) {
            if (Module._mainModule.filename === filename) {
                Module._mainModule.loaded = true;
            }
        };

        Module._load = function(path, parent) {

            var cachedModule = Module._cache[path];
            if (cachedModule) {
                return cachedModule.exports;
            }

            var module = new Module(path, parent);
            Module._cache[path] = module;

            var hadException = true;
            try {
                module.load(path);
                hadException = false;
            } finally {
                if (hadException) {
                    delete Module._cache[path];
                }
            }

            return module.exports;
        };

        Module.prototype.load = function(path) {

            this.filename = path;
            var self = this;
            var code = Module._files[path];

            if ( ! code) {
                var err = new Error("Cannot find module '" + path + "'");
                err.code = 'MODULE_NOT_FOUND';
                throw err;
            }

            function require(path) {
                return self.require(path);
            }
            require.main = Module._mainModule;
            require.cache = Module._cache;

            var filename = path;
            var dirname = '.';

            var args = [self.exports, require, self, filename, dirname];
            code.apply(self.exports, args);

            this.loaded = true;
        };

        Module.wrap = function (content, filename, isMain) {
            var wrapper = [
                {   header: "require('module').define('" + filename + "',\n"
                          + "function (exports, require, module, __filename, __dirname) {\n",
                    footer: "\n});\n" },

                {   header: "require('module').startMain('" + filename + "');\n",
                    footer: "require('module').endMain('" + filename + "');\n" }
            ];

            var index = isMain ? 1 : 0;

            return wrapper[index].header + content + wrapper[index].footer;
        }

        Module.define('module', function(exports, require, module, __filename, __dirname) {
            module.exports = Module;
        });

        Module._require = function (path) {
            return Module.prototype.require.call(Module._mainModule, path);
        };

        return Module._require;
    })();

    return require(path);
}

if (process && process.argv && process.argv[0] === 'node') {
    module.exports = require('module');
}
