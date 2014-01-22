
describe("Module:", function () {

    var Module = require('../../lib/codegs/module.js');

    describe("'Module' itself:", function () {

        it("should be main module of codegs package.", function () {
            expect(Module).toBe(require('../../lib/codegs'));
        });

        it("should be function(Constractor).", function () {
            expect(typeof Module).toBe("function");
        });

        it("should create new object.", function () {
            var id = "id",
                parent = { children: [] };

            var module = new Module(id, parent);

            expect(module).toEqual({
                id:         id,
                exports:    {},
                parent:     parent,
                filename:   null,
                loaded:     false,
                children:   [],
                require:    Module.prototype.require,
                load:       Module.prototype.load
            });
            expect(parent.children[0]).toBe(module);
        });

        describe("has Methods and Properties:", function () {

            it("Method prototype.require", function () {
                expect(typeof Module.prototype.require).toBe('function');
            });
            it("Method define", function () {
                expect(typeof Module.define).toBe('function');
            });
            it("Method runMain", function () {
                expect(typeof Module.runMain).toBe('function');
            });
            it("Method endMain", function () {
                expect(typeof Module.endMain).toBe('function');
            });
            it("Method wrap", function () {
                expect(typeof Module.wrap).toBe('function');
            });
            it("Method load", function () {
                expect(typeof Module.prototype.load).toBe('function');
            });
            it("Method _load", function () {
                expect(typeof Module._load).toBe('function');
            });
            it("Method _resolveFilename", function () {
                expect(typeof Module._resolveFilename).toBe('function');
            });
            it("Method _getDirname", function () {
                expect(typeof Module._getDirname).toBe('function');
            });
            it("Method _joinPath", function () {
                expect(typeof Module._joinPath).toBe('function');
            });
            it("Method _findFile", function () {
                expect(typeof Module._findFile).toBe('function');
            });
            it("Method _findModule", function () {
                expect(typeof Module._findModule).toBe('function');
            });

            it("Property _files", function () {
                expect(typeof Module._files).toBe('object');
            });
            it("Property _cache", function () {
                expect(typeof Module._cache).toBe('object');
            });
            it("Property _mainModule", function () {
                expect(typeof Module._mainModule).toBe('object');
            });
            it("Property _NativeModule", function () {
                expect(typeof Module._NativeModule).toBe('object');
            });
        });
    });

    describe("Property _mainModule:", function () {
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
                expect(target.children[0].id).toBe('core/module');
            });
            it("require", function () {
                expect(typeof target.require).toBe('function');
            });
        });
        xdescribe("has Methods and Properties:", function () {

            it("", function () {
                expect(target).toEqual({
                    id:         '.',
                    exports:    {},
                    parent:     null,
                    filename:   null,
                    loaded:     false,
                    children:   [ Module._cache['core/module'] ],
                    require:    Module.prototype.require,
                    load:       Module.prototype.load
                });
            });
        });

        describe("should be changed after Module.runMain():", function () {
            beforeEach(function () {
                Module.runMain('TEST_FILENAME');
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

    describe("method define:", function () {
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
            expect(Module._getDirname('core/module')).toBe('core');
            expect(Module._getDirname('core/sub/module')).toBe('core/sub');
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
        it("take root folder as base directory.", function () {
            expect(Module._joinPath('/', 'lib/module')).toBe('/lib/module');
            expect(Module._joinPath('/', './lib/module')).toBe('/lib/module');
            expect(Module._joinPath('/', './')).toBe('/');

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
        /**
         *  TODO: folder/ のように明示的にフォルダを指定された場合の処理が抜けている。node.jsの仕様は？
         *
         */
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
            // expect(Module._findFile('/pattarn-d/filename/')).toBe(pattarnD + '/index.js');
        });

        it("should return null when file not found.", function () {
            expect(Module._findFile(pattarnE)).toBe(null);
        });
    });

    describe("method _findModule:", function () {
        var pathA = "/path/to/file", fileA = "file-A";
        Module.define( "/path/to/file/node_modules/file-A", function () {});
        Module.define( "/path/to/node_modules/file-A", function () {});
        Module.define( "/path/node_modules/file-A", function () {});
        Module.define( "/node_modules/file-A", function () {});

        var pathB = "/path/to/file", fileB = "file-B";
        Module.define( "/path/to/node_modules/file-B", function () {});
        Module.define( "/path/node_modules/file-B", function () {});
        Module.define( "/node_modules/file-B", function () {});

        var pathC = "/path/to/file", fileC = "file-C";
        Module.define( "/path/node_modules/file-C", function () {});
        Module.define( "/node_modules/file-C", function () {});

        var pathD = "/path/to/file", fileD = "file-D";
        Module.define( "/node_modules/file-D", function () {});

        var pathE = "/path/to/file", fileE = "file-E";

        var pathF = "file", fileF = "file-F";

        var pathG = "path/to/file", fileG = "file-G";
        Module.define( "path/node_modules/file-G", function () {});
        Module.define( "node_modules/file-G", function () {});


        it("should return '/path/to/file/node_modules/file-A'", function () {
            expect(Module._findModule(pathA, fileA)).toBe('/path/to/file/node_modules/file-A');
        });

        it("should return '/path/to/node_modules/file-B'", function () {
            expect(Module._findModule(pathB, fileB)).toBe('/path/to/node_modules/file-B');
        });

        it("should return '/path/node_modules/file-C'", function () {
            expect(Module._findModule(pathC, fileC)).toBe('/path/node_modules/file-C');
        });

        it("should return '/node_modules/file-D'", function () {
            expect(Module._findModule(pathD, fileD)).toBe('/node_modules/file-D');
        });

        it("should return null when file not found.", function () {
            expect(Module._findModule(pathE, fileE)).toBe(null);
        });

        it("should return null when called from outside filepath.", function () {
            expect(Module._findModule(pathF, fileF)).toBe(null);
        });

        it("should return 'path/node_modules/file-G'", function () {
            expect(Module._findModule(pathG, fileG)).toBe('path/node_modules/file-G');
        });
    });

    describe("Property _NativeModule:", function () {

        describe("'_NativeModule' itself:", function () {
            describe("has methods and properties.", function () {
                it("Property filePaths", function () {
                    expect(typeof Module._NativeModule.filePaths).toBe('object');
                });
                it("method exists", function () {
                    expect(typeof Module._NativeModule.exists).toBe('function');
                });
                it("method getFilename", function () {
                    expect(typeof Module._NativeModule.getFilename).toBe('function');
                });
                it("method getObject", function () {
                    expect(typeof Module._NativeModule.getObject).toBe('function');
                });
            });
        });

        describe("method exists:", function () {
            it("", function () {
                ;
            });
        });

        describe("method getFilename:", function () {
            it("", function () {
                ;
            });
        });

        describe("method getObject:", function () {
            it("", function () {
                ;
            });
        });
    });

    describe("method _resolveFilename:", function () {
        var PATH_DATA = [
            // 明示的にフォルダを指定してみる？
            //
            // test-pattern list. Item = [ parent, request, toBe ]
            // parent.filename is one of 2 types. '/path/to/file', 'node_core/file'.
            // require is one of 6 types. 'module', './path', '../path', '/path', 'node_core', 'node_package'
            // So, total matrix to be 2 x 5 = 10 patterns.
            [ { filename: '/path/to/file.js'},          'module(1)',           'core/module(1)'],
            [ { filename: '/path/to/file.js'},          './subfile.js(2)',     '/path/to/subfile.js(2)'],
            [ { filename: '/path/to/file.js'},          '../lib/mylib(3)',     '/path/lib/mylib(3)'],
            [ { filename: '/path/to/file.js'},          '/common/lib(4)',      '/common/lib(4)'],
            [ { filename: '/path/to/file.js'},          'assert(5)',           'node_core/assert(5)'],
            [ { filename: '/path/to/file.js'},          'package(6)',          '/path/node_modules/package(6)'],

            [ { filename: 'node_core/assert.js'},       'module(7)',           'core/module(7)'],
            [ { filename: 'node_core/assert.js'},       './sub/file(8)',       'node_core/sub/file(8)'],
            [ { filename: 'node_core/sub/file.js'},     '../util(9)',          'node_core/util(9)'],
            [ { filename: 'node_core/assert.js'},       '/package.json(10)',   '/package.json(10)'],
            [ { filename: 'node_core/assert.js'},       'util(11)',            'node_core/util(11)'],
            [ { filename: 'node_core/assert.js'},       'package(12)',         'node_core/node_modules/package(12)']
        ];

        for (var i = 0; i < PATH_DATA.length; i++) {
            Module.define(PATH_DATA[i][2], function () {});
        }

        it("should return PATH_DATA[i]", function () {
            for (var i = 0; i < PATH_DATA.length; i++) {
                expect(Module._resolveFilename(PATH_DATA[i][1], PATH_DATA[i][0])).toBe(PATH_DATA[i][2]);
            }
        });
    });

    describe("method require - called in mainModule(Outside module):", function () {
        // Currentry, no test item.
    });

    describe("method require - called inside module:", function () {

        var PARENT_FILENAME = './REQUIRE_FUNCTION.js';
        //var PARENT_FILENAME = '/REQUIRE_FUNCTION.js';
        Module.define(PARENT_FILENAME,
        function (exports, require, module, __filename, __dirname) {
            exports.require = require;
            exports.module = module;
        });

        var TARGET_FILENAME = './REQUIRED_MODULE.js';
        //var TARGET_FILENAME = '/REQUIRED_MODULE.js';
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

        describe("has has Methods and Properties:", function () {
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
