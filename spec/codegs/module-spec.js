
// require('codegs') returns first core-module, 'module'.
var Module = require('../../lib/codegs');

describe("Module:", function () {

    describe("'module' itself:", function () {
        it("should be function(Constractor).", function () {
            expect(typeof Module).toEqual("function");
            expect(Module instanceof Function).toBe(true);
        });

        describe("has methods and properties:", function () {
            it("prototype.require", function () {
                expect(typeof Module.prototype.require).toBe('function');
            });
            it("define", function () {
                expect(typeof Module.define).toBe('function');
            });
            it("exists", function () {
                expect(typeof Module.exists).toBe('function');
            });
            it("startMain", function () {
                expect(typeof Module.startMain).toBe('function');
            });
            it("wrap", function () {
                expect(typeof Module.wrap).toBe('function');
            });

            it("load", function () {
                expect(typeof Module.prototype.load).toBe('function');
            });
            it("_load", function () {
                expect(typeof Module._load).toBe('function');
            });

            it("_files", function () {
                expect(typeof Module._files).toBe('object');
            });
            it("_cache", function () {
                expect(typeof Module._cache).toBe('object');
            });
            it("_mainModule", function () {
                expect(typeof Module._mainModule).toBe('object');
            });
        });
    });

    describe("module._mainModule:", function () {
        var target = Module._mainModule;
        var name = '.';

        describe("has methods and properties:", function () {
            it("id", function () {
                expect(target.id).toBe(name);
            });
            it("parent", function () {
                expect(target.parent).toBe(null);
            });
            it("filename", function () {
                expect(target.filename).toBe(null);
            });
            it("loaded", function () {
                expect(target.loaded).toBe(false);
            });
            it("children", function () {
                expect(typeof target.children.length).toBe('number');
                expect(target.children[0].id).toBe('module');
            });
            it("require", function () {
                expect(typeof target.require).toBe('function');
            });
            it("load", function () {
                expect(typeof target.load).toBe('function');
            });
        });

        describe("should be changed after Module.startMain():", function () {
            beforeEach(function () {
                Module.startMain('TEST_FILENAME');
            });

            describe("properties:", function () {
                it("filename", function () {
                    expect(target.filename).toBe('TEST_FILENAME');
                });
                it("loaded", function () {
                    expect(target.loaded).toBe(false);
                });
                it("main module cached as 'TEST_FILENAME'", function () {
                    expect(Module._cache['TEST_FILENAME']).toBe(target);
                });
            });
        });

        describe("should be changed after Module.endMain():", function () {
            it("endMain called with invalid filename.", function () {
                Module.endMain('INVALID_FILENAME');
                expect(target.loaded).toBe(false);
            });
            it("endMain called with valid filename.", function () {
                Module.endMain('TEST_FILENAME');
                expect(target.loaded).toBe(true);
            });
        });
    });

    describe("module._cache['module']:", function () {
        var name = 'module';
        var target = Module._cache[name];

        describe("has methods and properties:", function () {
            it("id", function () {
                expect(target.id).toBe(name);
            });
            it("exports", function () {
                expect(target.exports).toBe(Module);
            });
            it("parent", function () {
                expect(target.parent).toBe(Module._mainModule);
            });
            it("filename", function () {
                expect(target.filename).toBe(name);
            });
            it("loaded", function () {
                expect(target.loaded).toBe(true);
            });
            it("children", function () {
                expect(typeof target.children.length).toBe('number');
                expect(target.children.length).toBe(0);
            });
            it("require", function () {
                expect(typeof target.require).toBe('function');
            });
            it("load", function () {
                expect(typeof target.load).toBe('function');
            });
        });
    });

    describe("module.define method:", function () {
        it("should set module code to module._files[].", function () {
            expect(Module._files['DEFINE_TEST']).toBeUndefined;

            var func = function() { ; };
            Module.define('DEFINE_TEST', func);

            expect(Module._files['DEFINE_TEST']).toBe(func);
        });
    });

    describe("require method called in mainModule(Outside module):", function () {
        var require = Module._require;

        it("should return codegs itself when called with argument = 'module'", function () {
            expect(require('module')).toBe(Module);
        });

        it("should throw 'Cannot find module 'nomodule'' when module is not find.", function () {
            function test() {
                return require('nonExistentModuleName');
            }
            expect(test).toThrow("Cannot find module 'nonExistentModuleName'");
        });
    });

    describe("require method called inside module:", function () {

        Module.define("./REQUIRE_TEST.js",
        function (exports, require, module, __filename, __dirname) {
            exports.require = require;
            exports.module = module;
            exports.filename = __filename;
            exports.dirname = __dirname;
            exports.This = this;
        });

        var target = Module._require("./REQUIRE_TEST.js");
        var require = target.require;
        var name = "./REQUIRE_TEST.js";

        target = require(name).module;

        describe("has methods and properties:", function () {
            it("id", function () {
                expect(target.id).toBe(name);
            });
            it("exports === this", function () {
                expect(target.exports).toBe(target.exports.This);
            });
            it("parent", function () {
                expect(target.parent).toBe(Module._mainModule);
            });
            it("filename", function () {
                expect(target.filename).toBe(name);
            });
            it("loaded", function () {
                expect(target.loaded).toBe(true);
            });
            it("children", function () {
                expect(typeof target.children.length).toBe('number');
                expect(target.children.length).toBe(0);
            });
            describe("require", function () {
                it("require", function () {
                    expect(typeof target.require).toBe('function');
                });

                it("should return codegs itself when called with argument = 'module'", function () {
                    expect(require('module')).toBe(Module);
                });

                it("should throw 'Cannot find module 'nomodule'' when module is not find.", function () {
                    function test() {
                        return require('nonExistentModuleName');
                    }
                    expect(test).toThrow("Cannot find module 'nonExistentModuleName'");
                });
            });

            it("load", function () {
                expect(typeof target.load).toBe('function');
            });

        });

    });
});
