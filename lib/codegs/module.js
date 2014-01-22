/**
 * module.js
 */
function require(path) {

    require = (function () {

        var global = global || this;

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
        }

        Module._files = {};
        Module._cache = {};
        Module._mainModule = new Module('.', null);

        Module.prototype.require = function (path) {
            return Module._load(path, this);
        };

        Module.define = function (filename, func) {
            Module._files[filename] = func;
        };

        Module.runMain = function (filename) {
            Module._mainModule.filename = filename;
            Module._cache[filename] = Module._mainModule;
        };

        Module.endMain = function (filename) {
            if (Module._mainModule.filename === filename) {
                Module._mainModule.loaded = true;
            }
        };

        Module._load = function(path, parent) {

            // Code.gs Specification: require(undefined) should return with nop.
            if (path === undefined) return null;

            // Code.gs Specification: require(GlobalObject) should return the object.
            // (but if same-named core module exists, the object will be blocked.)
            var obj = Module._NativeModule.getObject(path);
            if (obj) return obj;

            var filename = Module._resolveFilename(path, parent);

            var cachedModule = Module._cache[filename];
            if (cachedModule) {
                return cachedModule.exports;
            }

            var module = new Module(filename, parent);
            Module._cache[filename] = module;

            var hadException = true;
            try {
                module.load(filename);
                hadException = false;
            } finally {
                if (hadException) {
                    delete Module._cache[filename];
                }
            }

            return module.exports;
        };

        Module._resolveFilename = function (request, parent) {

            if (Module._NativeModule.exists(request)) {
                return Module._NativeModule.getFilename(request);
            }

            var filename;
            var start = request.substring(0, 2);

            if (start === './' || start === '..') {
                filename = Module._getDirname(parent.filename);
                filename = Module._joinPath(filename, request);
                filename = Module._findFile(filename);

            } else if (request.charAt(0) === '/') {
                filename = Module._findFile(request);

            } else {
                filename = Module._getDirname(parent.filename);
                filename = Module._findModule(filename, request);
            }

            if (!filename) {
                var err = new Error("Cannot find module '" + request + "'");
                err.code = 'MODULE_NOT_FOUND';
                throw err;
            }
            return filename;
        };

        Module._getDirname = function (filename) {

            if (filename === null) return null;

            var n = filename.lastIndexOf('/');
            if (n < 0) {
                return null;
            }
            if (n === 0) {
                return '/';
            }
            return filename.substring(0, n);
        };

        Module._joinPath = function (basedir, request) {

            if ((request.charAt(0) === '/') || (basedir === null)) {
                return request;
            }

            var req_parts = request.split('/');

            var base_parts = basedir.split('/'),
                isAbsolute = basedir.charAt(0) === '/';

            if (isAbsolute) base_parts.shift();
            if (basedir.substr(-1) === '/') base_parts.pop();

            for (var i = 0; i < req_parts.length; i++) {
                switch (req_parts[i]) {
                case '.':
                    break;
                case '..':
                    if (base_parts.length === 0) {
                        throw new Error;
                    }
                    base_parts.pop();
                    break;
                default:
                    base_parts.push(req_parts[i]);
                }
            }

            return (isAbsolute ? '/' : '') + base_parts.join('/');
        };

        Module._findFile = function (filename) {
            var option = [ '', '.js', '/package.json', '/index.js' ];

            for (var i = 0; i < option.length; i++) {
                if (Module._files[filename + option[i]]) {
                    return filename + option[i];
                }
            }
            return null;
        };

        Module._findModule = function (dirname, request) {

            if (dirname === null) return null;

            var option = [ '/node_modules/' ];
            var filename, dir,
                dir_parts = (dirname === '/') ? [''] : dirname.split('/');

            for (var i = dir_parts.length; i > 0; i--) {
                dir = dir_parts.join('/');
                for (var j = 0; j < option.length; j++) {
                    filename = Module._findFile(dir + option[j] + request);
                    if (filename !== null) {
                        return filename;
                    }
                }
                dir_parts.pop();
            }

            return null;
        };

        Module._NativeModule = {

            filePaths: ['core/', 'node_core/'],

            exists: function (request) {
                var paths = this.filePaths;
                for (var i = 0; i < paths.length; i++) {
                    if (Module._files[paths[i] + request] !== undefined) {
                        return true;
                    }
                }
                return false;
            },

            getFilename: function (request) {
                var paths = this.filePaths;
                for (var i = 0; i < paths.length; i++) {
                    if (Module._files[paths[i] + request] !== undefined) {
                        return (paths[i] + request);
                    }
                }
                return null;
            },

            getObject: function (request) {
                if (this.exists(request)) {
                    return null;
                }
                if (global[request] !== undefined) {
                    return global[request];
                }
                return null;
            }
        };

        Module.prototype.load = function(filename) {
            this.filename = filename;

            var code = Module._files[filename];
            var self = this;
            var dirname = Module._getDirname(filename);

            function require(path) {
                return self.require(path);
            }
            require.main = Module._mainModule;
            require.cache = Module._cache;

            var args = [self.exports, require, self, filename, dirname];
            code.apply(self.exports, args);

            this.loaded = true;
        };

        Module.wrap = function (content, filename, isMain) {
            var wrapper = [
                {   header: "require('module').define('" + filename + "',\n"
                          + "function (exports, require, module, __filename, __dirname) {\n",
                    footer: "\n});\n" },

                {   header: "require('module').runMain('" + filename + "');\n",
                    footer: "require('module').endMain('" + filename + "');\n" }
            ];

            var index = isMain ? 1 : 0;

            return wrapper[index].header + content + wrapper[index].footer;
        };

        Module.define('core/module', function(exports, require, module, __filename, __dirname) {
            module.exports = Module;
        });

        Module._require = function (path) {
            return Module.prototype.require.call(Module._mainModule, path);
        };

        return Module._require;
    })();

    return require(path);
}

if ((typeof process !== 'undefined') && process.argv && process.argv[0] === 'node') {
    module.exports = require('module');
}
