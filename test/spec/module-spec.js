
describe("Module:", function () {

    var Module;

    beforeEach(function () {
        Module = require('../../lib/module.js');
        Module._init();
    });

    describe("'Module' itself:", function () {

        it("should be function(Constractor).", function () {
            expect(typeof Module).toBe("function");
        });

        it("should create new object.", function () {
            var ID = "id",
                PARENT = { children: [] };

            var module = new Module(ID, PARENT);

            expect(module).toEqual({
                id:         ID,
                exports:    {},
                parent:     PARENT,
                filename:   null,
                loaded:     false,
                children:   [],
                require:    Module.prototype.require,
                load:       Module.prototype.load
            });
            expect(PARENT.children[0]).toBe(module);
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

    describe("Property _mainModule / Method runMain, endMain:", function () {

        var target;

        beforeEach(function () {
            target = Module._mainModule;
        });

        describe("Property _mainModule:", function () {

            it("has Methods and Properties.", function () {
                expect(target).toEqual({
                    id:         '.',
                    exports:    {},
                    parent:     null,
                    filename:   '/.',
                    loaded:     false,
                    children:   [],
                    require:    Module.prototype.require,
                    load:       Module.prototype.load
                });
            });
        });

        describe("Method runMain:", function () {
            var TEST_FILENAME = 'TEST_FILENAME';

            beforeEach(function () {
                Module.runMain(TEST_FILENAME);
            });

            it("should updated _mainModule.", function () {
                expect(target).toEqual({
                    id:         '.',
                    exports:    {},
                    parent:     null,
                    filename:   TEST_FILENAME,
                    loaded:     false,
                    children:   [],
                    require:    Module.prototype.require,
                    load:       Module.prototype.load
                });
            });

            it("let _mainModule cached into Module._cache.", function () {
                expect(Module._cache[TEST_FILENAME]).toBe(target);
            });
        });

        describe("Method endMain:", function () {
            beforeEach(function () {
                Module.runMain('TEST_FILENAME');
            });

            describe("should update _mainModule.", function () {
                it("NOP - called with invalid filename.", function () {
                    Module.endMain('INVALID_FILENAME');

                    expect(target).toEqual({
                        id:         '.',
                        exports:    {},
                        parent:     null,
                        filename:   'TEST_FILENAME',
                        loaded:     false,
                        children:   [],
                        require:    Module.prototype.require,
                        load:       Module.prototype.load
                    });
                });
                it("UPDATE - called with valid filename.", function () {
                    Module.endMain('TEST_FILENAME');

                    expect(target).toEqual({
                        id:         '.',
                        exports:    {},
                        parent:     null,
                        filename:   'TEST_FILENAME',
                        loaded:     true,
                        children:   [],
                        require:    Module.prototype.require,
                        load:       Module.prototype.load
                    });
                });
            });
        });
    });

    describe("Method define:", function () {
        var TEST_FILENAME = 'DEFINE_TEST';

        it("should set module code to module._files[].", function () {
            expect(Module._files[TEST_FILENAME]).toBeUndefined();

            var func = function() { };
            Module.define(TEST_FILENAME, func);

            expect(Module._files[TEST_FILENAME]).toBe(func);
        });
    });

    describe("Method _getDirname:", function () {
        it("should return dirname from full-filename.", function () {
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

    describe("Method _joinPath:", function () {
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

    describe("Method _findFile:", function () {

        it("should return /pattarn/filename", function () {
            var BASE = "/pattarn/filename";
            Module.define( "/pattarn/filename", function () {});
            Module.define( "/pattarn/filename.js", function () {});
            Module.define( "/pattarn/filename/package.json", function () {});
            Module.define( "/pattarn/filename/index.js", function () {});

            expect(Module._findFile(BASE)).toBe(BASE + '');
        });

        it("should return /pattarn/filename.js", function () {
            var BASE = "/pattarn/filename";
            Module.define( "/pattarn/filename.js", function () {});
            Module.define( "/pattarn/filename/package.json", function () {});
            Module.define( "/pattarn/filename/index.js", function () {});

            expect(Module._findFile(BASE)).toBe(BASE + '.js');
        });

        it("should return /pattarn/filename/package.json", function () {
            // this pattern, findFile try resolve 'main' module
            var BASE = "/pattarn/filename";
            Module.define( "/pattarn/filename/package.json", { main: './main.js' });
            Module.define( "/pattarn/filename/index.js", function () {});
            Module.define( "/pattarn/filename/main.js", function () {});

            expect(Module._findFile(BASE)).toBe(BASE + '/main.js');
        });

        it("should return /pattarn-d/filename", function () {
            var BASE = "/pattarn-d/filename";
            Module.define( "/pattarn-d/filename/index.js", function () {});

            expect(Module._findFile(BASE)).toBe(BASE + '/index.js');
        });

        it("should return null when file not found.", function () {
            var BASE = "/pattarn-e/filename";

            expect(Module._findFile(BASE)).toBe(null);
        });

        it("should care package.json in core directories.", function () {
            // this pattern, findFile try resolve 'main' module
            var BASE = "pattarn/filename";
            Module.define( "pattarn/filename/package.json", { main: './main.js' });
            Module.define( "pattarn/filename/main.js", function () {});

            expect(Module._findFile(BASE)).toBe(BASE + '/main.js');
        });
        it("should care nested package.json in core directories.", function () {
            // this pattern, findFile try resolve 'main' module
            var BASE = "pattarn/filename";
            Module.define( "pattarn/filename/package.json", { main: './sub' });
            Module.define( "pattarn/filename/sub/package.json", { main: './main.js' });
            Module.define( "pattarn/filename/sub/main.js", function () {});

            expect(Module._findFile(BASE)).toBe(BASE + '/sub/main.js');
        });
    });

    describe("Method _findModule:", function () {

        it("should return '/path/to/file/node_modules/file-A'", function () {
            var PATH = "/path/to/file", fileA = "file-A";
            Module.define( "/path/to/file/node_modules/file-A", function () {});
            Module.define( "/path/to/node_modules/file-A", function () {});
            Module.define( "/path/node_modules/file-A", function () {});
            Module.define( "/node_modules/file-A", function () {});

            expect(Module._findModule(PATH, fileA)).toBe('/path/to/file/node_modules/file-A');
        });

        it("should return '/path/to/node_modules/file-B'", function () {
            var PATH = "/path/to/file", fileB = "file-B";
            Module.define( "/path/to/node_modules/file-B", function () {});
            Module.define( "/path/node_modules/file-B", function () {});
            Module.define( "/node_modules/file-B", function () {});

            expect(Module._findModule(PATH, fileB)).toBe('/path/to/node_modules/file-B');
        });

        it("should return '/path/node_modules/file-C'", function () {
            var PATH = "/path/to/file", fileC = "file-C";
            Module.define( "/path/node_modules/file-C", function () {});
            Module.define( "/node_modules/file-C", function () {});

            expect(Module._findModule(PATH, fileC)).toBe('/path/node_modules/file-C');
        });

        it("should return '/node_modules/file-D'", function () {
            var PATH = "/path/to/file", fileD = "file-D";
            Module.define( "/node_modules/file-D", function () {});

            expect(Module._findModule(PATH, fileD)).toBe('/node_modules/file-D');
        });

        it("should return null when file not found.", function () {
            var PATH = "/path/to/file", fileE = "file-E";

            expect(Module._findModule(PATH, fileE)).toBe(null);
        });

        it("should return null when called from outside filepath.", function () {
            var PATH = "file", fileF = "file-F";

            expect(Module._findModule(PATH, fileF)).toBe(null);
        });

        it("should return 'path/node_modules/file-G'", function () {
            var PATH = "path/to/file", fileG = "file-G";
            Module.define( "path/node_modules/file-G", function () {});
            Module.define( "node_modules/file-G", function () {});

            expect(Module._findModule(PATH, fileG)).toBe('path/node_modules/file-G');
        });
    });

    describe("Property _NativeModule:", function () {

        var NativeModule;

        beforeEach(function () {
            NativeModule = Module._NativeModule;
        });

        describe("'_NativeModule' itself:", function () {
            describe("has methods and properties.", function () {
                it("Property filePaths", function () {
                    expect(NativeModule.filePaths).toEqual(['core/', 'node_core/']);
                });
                it("method exists", function () {
                    expect(typeof NativeModule.exists).toBe('function');
                });
                it("method getFilename", function () {
                    expect(typeof NativeModule.getFilename).toBe('function');
                });
                it("method getObject", function () {
                    expect(typeof NativeModule.getObject).toBe('function');
                });
            });
        });

        describe("Method exists:", function () {
            it("return if core module exists or not.", function () {
                var PATH = "core/module", MODULE = "module";
                Module.define( PATH, function () {});

                expect(NativeModule.exists(MODULE)).toBe(true);
            });
            it("return if node_core module exists or not.", function () {
                var PATH = "node_core/assert", MODULE = "assert";
                Module.define( PATH, function () {});

                expect(NativeModule.exists(MODULE)).toBe(true);
            });
        });

        describe("Method getFilename:", function () {
            it("should return core module.", function () {
                var MODULE = "assert";
                Module.define( "core/assert", function () {});
                Module.define( "node_core/assert", function () {});

                expect(NativeModule.getFilename(MODULE)).toBe("core/assert");
            });

            it("should return node_core module.", function () {
                var MODULE = "assert";
                Module.define( "node_core/assert", function () {});

                expect(NativeModule.getFilename(MODULE)).toBe("node_core/assert");
            });

            it("should return null.", function () {
                var MODULE = "assert";

                expect(NativeModule.getFilename(MODULE)).toBe(null);
            });
        });

        describe("Method getObject:", function () {
            it("should return global object.", function () {
                var MODULE = "TESTOBJECT1";
                var OBJECT = {};
                global[MODULE] = OBJECT;

                expect(NativeModule.getObject(MODULE)).toBe(OBJECT);
            });
            it("should return core module, instead of global object.", function () {
                var MODULE = "TESTOBJECT2";
                var OBJECT = {};
                global[MODULE] = OBJECT;
                Module.define( "core/" + MODULE, function () {});

                expect(NativeModule.getObject(MODULE)).not.toBe(OBJECT);
                expect(NativeModule.getObject(MODULE)).toBe(null);
            });
        });
    });

    describe("Method _resolveFilename:", function () {
        var PATH_DATA = [
            // test-pattern list. Item = [ parent, request, toBe ]
            // parent.filename is one of 2 types. '/path/to/file', 'node_core/file'.
            // require is one of 7 types.
            //      'module', './path', '../path', '/path', 'node_core', 'node_package', 'node_package/'
            [ { filename: '/path/to/file.js'},      'module(1)',           'core/module(1)'],
            [ { filename: '/path/to/file.js'},      './subfile.js(2)',     '/path/to/subfile.js(2)'],
            [ { filename: '/path/to/file.js'},      '../lib/mylib(3)',     '/path/lib/mylib(3)'],
            [ { filename: '/path/to/file.js'},      '/common/lib(4)',      '/common/lib(4)'],
            [ { filename: '/path/to/file.js'},      'assert(5)',           'node_core/assert(5)'],
            [ { filename: '/path/to/file.js'},      'package(6)',          '/path/node_modules/package(6)'],
            [ { filename: '/path/to/file.js'},      'package(7)/',         '/path/node_modules/package(7)/index.js'],

            [ { filename: 'node_core/assert.js'},   'module(8)',           'core/module(8)'],
            [ { filename: 'node_core/assert.js'},   './sub/file(9)',       'node_core/sub/file(9)'],
            [ { filename: 'node_core/sub/file.js'}, '../util(10)',         'node_core/util(10)'],
            [ { filename: 'node_core/assert.js'},   '/package.json(11)',   '/package.json(11)'],
            [ { filename: 'node_core/assert.js'},   'util(12)',            'node_core/util(12)'],
            [ { filename: 'node_core/sub/file.js'}, 'package(13)',         'node_core/node_modules/package(13)'],
            [ { filename: 'node_core/sub/file.js'}, 'package(14)/',        'node_core/node_modules/package(14)/index.js'],

            [ { filename: 'node_core/assert.js'},   'package(15)',         'node_core/node_modules/package(15)'],
            [ { filename: 'node_core/assert.js'},   'package(15)/main.js', 'node_core/node_modules/package(15)/main.js'],
            [ { filename: 'node_core/assert.js'},   'package(15)/package.json',
                                                                           'node_core/node_modules/package(15)/package.json'],
            [ { filename: 'node_core/assert.js'},   'package(15)/',        'node_core/node_modules/package(15)/main.js'],

            [ { filename: '/path/to/file.js'},  '../lib(16)/main.js',      '/path/lib(16)/main.js'],
            [ { filename: '/path/to/file.js'},  '../lib(16)/package.json', '/path/lib(16)/package.json'],
            [ { filename: '/path/to/file.js'},  '../lib(16)',              '/path/lib(16)/main.js'],
            [ { filename: '/path/to/file.js'},  '../lib(16)/',             '/path/lib(16)/main.js']
        ];

        it("should return PATH_DATA[i]", function () {
            for (var i = 0; i < PATH_DATA.length; i++) {
                Module.define(PATH_DATA[i][2], { main: './main.js' });
            }

            for (var j = 0; j < PATH_DATA.length; j++) {
                expect(Module._resolveFilename(PATH_DATA[j][1], PATH_DATA[j][0])).toBe(PATH_DATA[j][2]);
            }
        });
    });

    xdescribe("Method _load:", function () {

        var TEST_DATA = [
                {   path:               undefined,
                    parent:             {},

                    getObject:          function () {},
                    _resolveFilename:   function () {},
                    _cache:             [],
                    load:               function () {},

                    result:             null
                },
                {   path:               undefined,
                    parent:             '',

                    getObject:          function (path) { return {}; },
                    _resolveFilename:   function (path, parent) { return path; },
                    _cache:             [],
                    load:               function (filename) { module.exports = 'OK'; },

                    result:             {}
                },
                {   path:               undefined,
                    parent:             '',

                    getObject:          function (path) { return {}; },
                    _resolveFilename:   function (path, parent) { return path; },
                    _cache:             [],
                    load:               function (filename) { module.exports = 'OK'; },

                    result:             {}
                }
            ];
    });

    describe("method require - called in mainModule(Outside module):", function () {

        var require;
        beforeEach(function () {
            require = Module._require; // require outside modules.
        });

        describe("has properties and methods:", function () {
            it("Method resolve", function () {
                expect(typeof require.resolve).toBe('function');
            });

            it("Property cache", function () {
                expect(typeof require.cache).toBe('object');
            });
        });
    });

    describe("Method require - called inside module:", function () {

        var PARENT_FILENAME = '/REQUIRE_FROM.js';
        var TARGET_FILENAME = '/REQUIRED_MODULE.js';
        var parent, target;

        beforeEach(function () {
            Module.define(PARENT_FILENAME,
            function (exports, require, module, __filename, __dirname) {
                exports.require = require;
                exports.module = module;
            });

            Module.define(TARGET_FILENAME,
            function (exports, require, module, __filename, __dirname) {
                exports.require = require;
                exports.module = module;
                exports.filename = __filename;
                exports.dirname = __dirname;
                exports.This = this;
            });

            parent = Module._require(PARENT_FILENAME);
            target = parent.require(TARGET_FILENAME).module;
        });

        describe("should returns inside module:", function () {
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
                expect(target.exports.filename).toBe(TARGET_FILENAME);
            });
            it("loaded", function () {
                expect(target.loaded).toBe(true);
            });
            it("children", function () {
                expect(typeof target.children.length).toBe('number');
                expect(target.children.length).toBe(0);
            });

            describe("Method require:", function () {
                it("require should be function.", function () {
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

                describe("has properties and methods:", function () {
                    it("Method resolve", function () {
                        expect(typeof target.exports.require.resolve).toBe('function');
                        expect(typeof target.require.resolve).toBe('undefined');
                    });

                    it("Property cache", function () {
                        expect(typeof target.exports.require.cache).toBe('object');
                        expect(typeof target.require.cache).toBe('undefined');
                    });
                });
            });
        });
    });

    describe("Method wrap:", function () {
        it("should return wrapped content.", function () {
            expect(Module.wrap('', 'FILENAME', 'js')).toBe(
                    "require('module').define('FILENAME',\n" +
                    "function (exports, require, module, __filename, __dirname) {\n" +
                    "\n});\n"
                );
        });

        it("should return null when filetype is invalid.", function () {
            expect(Module.wrap('', 'FILENAME', 'INVALIDTYPE')).toBeNull();
        });
    });
});
