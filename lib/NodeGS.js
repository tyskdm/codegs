/**
 *  NodeGS のモジュール管理ライブラリを提供する。
 */

/**
 * require
 * @namespace
 * node環境の場合は Module scope、
 * GAS環境の場合は Global scope に置かれる。
 */
function require(firstModulePath) {

    var moduleFactories = {};
    var chache = {};

    function GsModule(id, parent, filename) {
        this.id = id;
        this.exports = {};
        this.parent = parent;
        this.filename = filename;
        this.loaded = false;
        this.children = [];
        this.paths = [];
    }

    // create root module
    var root = new GsModule('.', null, "/");    // set filename as project directory.
    root.paths.unshift('/node_modules');
    chache[root.id] = root;

    // create nodeGS module
    var nodeGsName = 'NodeGS';
    var module = new GsModule(nodeGsName, root, nodeGsName);
    chache[module.id] = module;

    // setup nodeGS module
    var exports = module.exports;

    /**
     * define module with factory function.
     * @param {string} moduleName           module namepath.
     * @param {function()} factoryFunction  module constractor.
     */
    exports.define = function (modulePath, factoryFunction) {

        if (moduleFactories[modulePath]) {
            throw new Error(nodeGsName  + '.define: Define(' + modulePath + ') MultiPlexed.');
        } else {
            moduleFactories[modulePath] = {
                func: factoryFunction,
                constructing: false
            };
        }
    };

    exports.require = function (modulePath, option) {
        if (modulePath === nodeGsName) {
            return chache[modulePath];
        }

        return {};
    };

    exports.resolve = function (path) {
        return path;
    };

    exports.inject = function (require, config) {
        ;
    };

    exports.config = function () {
        ;
    };

    exports.setup = function (args) {
        ;
    };

    // overwrite require function itself.
    require = exports.require;

    return require(firstModulePath);
}


/*
 *  export nodeGS module in case of node.js environment.
 */
if (module && module.exports && exports && __filename && __dirname) {
    module.exports = require(moduleName);
    module.exports.global = global;
} else {
    require(moduleName).global = this;
}
