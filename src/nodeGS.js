/**
 *  nodeGS のモジュール管理ライブラリを提供する。
 */

/**
 * require:
 * node環境の場合は一時的なローカル関数、
 * GAS環境の場合はGlobal scopeに置かれる。
 */
function require(modulepath) {

    var nodeGS = {};
    var definedNamespaces_ = [];

    /**
     * define namespace with constructor.
     * @param {string} nsString       namespace name.
     * @param {function()} nsFunction   namespace constructor.
     */
    function define(modulepath, constructor) {
    // function define(nsString, nsFunction) {

      if (definedNamespaces_[nsString]) {
        throw new Error('namespce.define: Define MultiPlexed.');
      } else {
        definedNamespaces_[nsString] = {
            func: nsFunction,
            constructing: false
        };
      }
    };

    function require(modulepath, option) {
        if (modulepath === 'nodeGS') {
            return nodeGS;
        }

        return {};
    }

    function inject(require, config) {
        ;
    }

    function config() {
        ;
    }

    nodeGS = {
        define: define,
        require: require,
        inject: inject,
        config: config
    };

    require = nodeGS.require;
    return require(modulepath);
}


/*
 *  export nodeGS module in case of node.js environment.
 */
if (module && module.exports && exports && __filename && __dirname) {
    module.exports = require('nodeGS');
    module.exports.global = global;
} else {
    require('nodeGS').global = this;
}
