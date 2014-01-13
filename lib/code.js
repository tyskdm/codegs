/**
 * code.js
 */
function require(path) {

    require = (function () {

        this.global = this;

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

        Module.prototype.require = function (path) {
            return Module._load(path, this);
        };

        Module.define = function (filename, func) {
            Module._code[filename] = func;
        };

        Module.exists = function (filename) {
            return Module._code[filename] ? true : false;
        };

        Module.wrap = function (content, filename, isMain) {
            var moduleWrapper = {
                    header: "require('module').define('" + filename + "',\n"
                          + "function (export, require, module, __filename, __dirname) {\n",
                    footer: "\n});\n"
                };

            ;       // TODO: clarify the difference between id and filename.
        }

        Module._code = {};
        Module._cache = {};

        var name = '.';
        var module = new Module(name, null);    // should id = '.' ??
        module.filename = name;
        module.loaded = true;
        Module._cache[name] = module;
        Module._mainModule = module;

        name = 'module';
        module = new Module(name, Module._mainModule);
        module.filename = name;
        module.exports = Module;
        module.loaded = true;
        Module._cache[name] = module;

        Module._load = function(path, parent) {

            if (parent === global) {
                parent = Module._mainModule;
            }

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
            var code = Module._code[path];
            var self = this;

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

        return Module.prototype.require;
    })();

    return require(path);
}
