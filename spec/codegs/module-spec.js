
describe("Module:", function () {

    var Module = require('../../lib/codegs/module.js');

    describe("'Module' itself:", function () {

        xit("should be main module of codegs package.", function () {
            expect(Module).toBe(require('../../lib/codegs'));
        });

        it("should be function(Constractor).", function () {
            expect(typeof Module).toEqual("function");
        });

        describe("methods and properties:", function () {
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
            it("endMain", function () {
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
            it("_resolveFilename", function () {
                expect(typeof Module._resolveFilename).toBe('function');
            });
            it("_getDirname", function () {
                expect(typeof Module._getDirname).toBe('function');
            });
            it("_joinPath", function () {
                expect(typeof Module._joinPath).toBe('function');
            });
            it("_findFile", function () {
                expect(typeof Module._findFile).toBe('function');
            });
            it("_findModule", function () {
                expect(typeof Module._findModule).toBe('function');
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

        describe("methods and properties:", function () {
            it("id", function () {
                expect(target.id).toBe('.');
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

    describe("module.define method:", function () {
        it("should set module code to module._files[].", function () {
            expect(Module._files['DEFINE_TEST']).toBeUndefined;

            var func = function() { ; };
            Module.define('DEFINE_TEST', func);

            expect(Module._files['DEFINE_TEST']).toBe(func);
        });
    });

    describe("method _getDirname:", function () {
        it("should return dirname in full-filename.", function () {
            expect(Module._getDirname('/path/to/file.js')).toBe('/path/to');
            expect(Module._getDirname('/path/to/file/package.json')).toBe('/path/to/file');
            expect(Module._getDirname('/package.json')).toBe('/');
        });
        it("should return null when '/' is not included.", function () {
            expect(Module._getDirname('module')).toBe(null);
        });
    });

    describe("method _joinPath:", function () {
        it("should return full-filename.", function () {
            expect(Module._joinPath('project/src', '../lib/assert.js')).toBe('project/lib/assert.js');
            expect(Module._joinPath('/project/src', '../lib/assert.js')).toBe('/project/lib/assert.js');
            expect(Module._joinPath('/project/src/', '../lib/assert.js')).toBe('/project/lib/assert.js');
        });
        it("overwrite basedir with requested path starts with slash.", function () {
            expect(Module._joinPath('a/b/c', '/d/file.js')).toBe('/d/file.js');
            expect(Module._joinPath('/a/b/c', '/d/file.js')).toBe('/d/file.js');
            expect(Module._joinPath('/a/b/c/', '/d/file.js')).toBe('/d/file.js');
        });
        it("process up/down relative-path.", function () {
            expect(Module._joinPath('a/b/c', '../../d/./e/../../../f/file.js')).toBe('f/file.js');
            expect(Module._joinPath('/a/b/c', '../../d/./e/../../../f/file.js')).toBe('/f/file.js');
            expect(Module._joinPath('/a/b/c/', '../../d/./e/../../../f/file.js')).toBe('/f/file.js');
        });
        it("keep trail slash.", function () {
            expect(Module._joinPath('a/b', '../lib/module/')).toBe('a/lib/module/');
            expect(Module._joinPath('/a/b', '../lib/module/')).toBe('/a/lib/module/');
            expect(Module._joinPath('/a/b/', '../lib/module/')).toBe('/a/lib/module/');
        });
        it("also take slash as root folder.", function () {
            expect(Module._joinPath('/', 'lib/module')).toBe('/lib/module');
            expect(Module._joinPath('/', './lib/module')).toBe('/lib/module');

            function test () {
                Module._joinPath('/', '../file.js');
            }
            expect(test).toThrow();
        });
        it("should throw in error cases.", function () {
            function test1 () {
                Module._joinPath('a/b', '../../../file.js');
            }
            function test2 () {
                Module._joinPath('/a/b', '../../../file.js');
            }
            function test3 () {
                Module._joinPath('/a/b/', '../../../file.js');
            }
            expect(test1).toThrow();
            expect(test2).toThrow();
            expect(test3).toThrow();
        });
    });

    describe("method _findFile:", function () {
        var pattarnA = "/pattarn-a/filename";
        Module.define( "/pattarn-a/filename", function () {});
        Module.define( "/pattarn-a/filename.js", function () {});
        Module.define( "/pattarn-a/filename/package.json", function () {});
        Module.define( "/pattarn-a/filename/index.js", function () {});

        var pattarnB = "/pattarn-b/filename";
        Module.define( "/pattarn-b/filename.js", function () {});
        Module.define( "/pattarn-b/filename/package.json", function () {});
        Module.define( "/pattarn-b/filename/index.js", function () {});

        var pattarnC = "/pattarn-c/filename";
        Module.define( "/pattarn-c/filename/package.json", function () {});
        Module.define( "/pattarn-c/filename/index.js", function () {});

        var pattarnD = "/pattarn-d/filename";
        Module.define( "/pattarn-d/filename/index.js", function () {});

        var pattarnE = "/pattarn-e/filename";

        it("should return /pattarn-a/filename", function () {
            expect(Module._findFile(pattarnA)).toBe(pattarnA + '');
        });

        it("should return /pattarn-b/filename.js", function () {
            expect(Module._findFile(pattarnB)).toBe(pattarnB + '.js');
        });

        it("should return /pattarn-c/filename/package.json", function () {
            expect(Module._findFile(pattarnC)).toBe(pattarnC + '/package.json');
        });

        it("should return /pattarn-d/filename", function () {
            expect(Module._findFile(pattarnD)).toBe(pattarnD + '/index.js');
        });

        it("should return null when file not found.", function () {
            expect(Module._findFile(pattarnE)).toBe(null);
        });
    });

    describe("module.exists method", function () {
        it("should return false when not exist.", function () {
            var NAME = 'nonExistentFileName';
            expect(Module.exists(NAME)).toBe(false);
        });
        it("should return true when exist.", function () {
            var NAME1 = 'module',
                NAME2 = './EXISTS_TEST.js';
            expect(Module.exists(NAME1)).toBe(true);

            var func = function() { ; };
            Module.define(NAME2, func);
            expect(Module.exists(NAME2)).toBe(true);
        });
    })

    describe("require method called in mainModule(Outside module):", function () {
        // Currentry, no test item.
    });

    describe("require method called inside module:", function () {

        var PARENT_FILENAME = './REQUIRE_FUNCTION.js';
        Module.define(PARENT_FILENAME,
        function (exports, require, module, __filename, __dirname) {
            exports.require = require;
            exports.module = module;
        });

        var TARGET_FILENAME = './REQUIRED_MODULE.js';
        Module.define(TARGET_FILENAME,
        function (exports, require, module, __filename, __dirname) {
            exports.require = require;
            exports.module = module;
            exports.filename = __filename;
            exports.dirname = __dirname;
            exports.This = this;
        });

        var parent = Module._require(PARENT_FILENAME);
        var target = parent.require(TARGET_FILENAME).module;

        describe("has methods and properties:", function () {
            it("id", function () {
                expect(target.id).toBe(TARGET_FILENAME);
            });
            it("exports === this", function () {
                expect(target.exports).toBe(target.exports.This);
            });
            it("parent", function () {
                expect(target.parent).toBe(parent.module);
            });
            it("filename", function () {
                expect(target.filename).toBe(TARGET_FILENAME);
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
                    expect(target.require('module')).toBe(Module);
                });

                it("should throw 'Cannot find module 'nomodule'' when module is not find.", function () {
                    var NAME = 'nonExistentModuleName';
                    function test() {
                        return require(NAME);
                    }
                    expect(test).toThrow("Cannot find module '" + NAME + "'");
                });

                it("should return null when called with argument = undefined", function () {
                    expect(target.require(undefined)).toBeNull();
                    expect(target.require()).toBeNull();
                });
            });
        });
    });
});
