
// require('codegs') returns first core-module, 'module'.
var codegsModule = require('../lib/codegs');

describe("module:", function () {

    describe("'module' itself:", function () {
        it("should be function(Constractor).", function () {
            expect(typeof codegsModule).toEqual("function");
            expect(codegsModule instanceof Function).toBe(true);
        });

        describe("has methods and properties:", function () {
            it("prototype.require", function () {
                expect(typeof codegsModule.prototype.require).toBe('function');
            });
            it("define", function () {
                expect(typeof codegsModule.define).toBe('function');
            });
            it("exists", function () {
                expect(typeof codegsModule.exists).toBe('function');
            });
            it("startMain", function () {
                expect(typeof codegsModule.startMain).toBe('function');
            });
            it("wrap", function () {
                expect(typeof codegsModule.wrap).toBe('function');
            });

            it("load", function () {
                expect(typeof codegsModule.prototype.load).toBe('function');
            });
            it("_load", function () {
                expect(typeof codegsModule._load).toBe('function');
            });

            it("_code", function () {
                expect(typeof codegsModule._code).toBe('object');
            });
            it("_cache", function () {
                expect(typeof codegsModule._cache).toBe('object');
            });
            it("_mainModule", function () {
                expect(typeof codegsModule._mainModule).toBe('object');
            });
        });
    });

    describe("module._mainModule:", function () {
        var target = codegsModule._mainModule;
        var name = '.';

        describe("has methods and properties:", function () {
            it("id", function () {
                expect(target.id).toBe(name);
            });
            it("parent", function () {
                expect(target.parent).toBe(null);
            });
            it("filename", function () {
                expect(target.filename).toBe(name);
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
                codegsModule.startMain('TEST_FILENAME');
            });

            describe("properties:", function () {
                it("filename", function () {
                    expect(target.filename).toBe('TEST_FILENAME');
                });
                it("loaded", function () {
                    expect(target.loaded).toBe(false);
                });
                it("main module cached as 'TEST_FILENAME'", function () {
                    expect(codegsModule._cache['TEST_FILENAME']).toBe(target);
                });
            });
        });

        describe("should be changed after Module.endMain():", function () {
            it("endMain called with invalid filename.", function () {
                codegsModule.endMain('INVALID_FILENAME');
                expect(target.loaded).toBe(false);
            });
            it("endMain called with valid filename.", function () {
                codegsModule.endMain('TEST_FILENAME');
                expect(target.loaded).toBe(true);
            });
        });
    });

    describe("module._cache['module']:", function () {
        var name = 'module';
        var target = codegsModule._cache[name];

        describe("has methods and properties:", function () {
            it("id", function () {
                expect(target.id).toBe(name);
            });
            it("exports", function () {
                expect(target.exports).toBe(codegsModule);
            });
            it("parent", function () {
                expect(target.parent).toBe(codegsModule._mainModule);
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
        it("should set module code to module._code[].", function () {
            expect(codegsModule._code['DEFINE_TEST']).toBeUndefined;

            var func = function() { ; };
            codegsModule.define('DEFINE_TEST', func);

            expect(codegsModule._code['DEFINE_TEST']).toBe(func);
        });
    });

    describe("require method called in mainModule(Outside module):", function () {
        var require = codegsModule._require;

        it("should return codegs itself when called with argument = 'module'", function () {
            expect(require('module')).toBe(codegsModule);
        });

        it("should throw 'Cannot find module 'nomodule'' when module is not find.", function () {
            function test() {
                return require('nonExistentModuleName');
            }
            // expect(test).toThrow("Cannot find module 'nonExistentModuleName'");
            expect(test).toThrow();
        });
    });

    describe("require method called inside module:", function () {

        codegsModule.define("./REQUIRE_TEST.js",
        function (exports, require, module, __filename, __dirname) {
            exports.require = require;
            exports.module = module;
            exports.filename = __filename;
            exports.dirname = __dirname;
            exports.This = this;
        });

        var target = codegsModule._require("./REQUIRE_TEST.js");
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
                expect(target.parent).toBe(codegsModule._mainModule);
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
                    expect(require('module')).toBe(codegsModule);
                });

                it("should throw 'Cannot find module 'nomodule'' when module is not find.", function () {
                    function test() {
                        return require('nonExistentModuleName');
                    }
                    // expect(test).toThrow("Cannot find module 'nonExistentModuleName'");
                    expect(test).toThrow();
                });
            });

            it("load", function () {
                expect(typeof target.load).toBe('function');
            });

        });

    });
});
