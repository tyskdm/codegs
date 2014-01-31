
/*
    var config = {
        rootdir:    process.cwd(),

        mainfile:   argv.targets.length === 0 ? './package.json' :
                    argv.targets.length === 1 ? argv.targets[0] : null,

        source:     argv.source     || [process.cwd()], // default current directory
        output:     argv.output     || null,
        core:       argv.core       || './core',
        nodecore:   argv.nodecore   || './node_core'
    };
*/

describe("codegs:", function () {

    var codegs = require('../../lib/codegs.js');
    var MockFs = require('../mock/mockfs.js');

    beforeEach(function () {
        ;
    });

    describe("'codegs' itself:", function () {
        it("should be constractor.", function () {
            expect(typeof codegs).toBe('function');
        });

        describe("has Methods and Properties:", function () {
            it("Method create", function () {
                expect(typeof codegs.create).toBe('function');
            });
            it("Static Method setup", function () {
                expect(typeof codegs.prototype.setup).toBe('function');
            });
            it("Method addSourceFiles", function () {
                expect(typeof codegs.prototype.addSourceFiles).toBe('function');
            });
            it("Method removeIgnoreFiles", function () {
                expect(typeof codegs.prototype.removeIgnoreFiles).toBe('function');
            });
            it("Method compile", function () {
                expect(typeof codegs.prototype.compile).toBe('function');
            });
            it("Method out", function () {
                expect(typeof codegs.prototype.out).toBe('function');
            });

            it("Static Method _parsePackageJson", function () {
                expect(typeof codegs._parsePackageJson).toBe('function');
            });
        });
    });


    describe("Method create:", function () {
        it("creates new codegs object.", function () {
            expect(codegs.create() instanceof codegs).toBe(true);
        });
    });


    /*
     *  Method setup:
     *  - set config info int object
     *  - find mainfile
     */
    describe("Method setup:", function () {
        var DUMMY_CONFIG = {
            rootdir:  '/project',
            mainfile: 'main.js'
        };

        it("should store config-info into object", function () {
            var code = codegs.create();
            expect(code.config).toBe(null);

            code.setup(DUMMY_CONFIG);
            expect(code.config).toBe(DUMMY_CONFIG);
        });

        describe("should find mainfile:", function () {
            it("case#1 : mainfile exists.", function () {
                var mockfs = new MockFs({
                    '/home/usr/project' :               { type: 'dir' },
                    '/home/usr/project/main.js' :       { type: 'file'},
                });

                var code = codegs.create();
                var error = code.setup({
                        rootdir:    '/home/usr/project',
                        mainfile:   'main.js'
                    }, mockfs);

                expect(error).toBe(null);
                expect(code.files.main).toBe('/home/usr/project/main.js');
            });

            it("case#2 : mainfile is not exists.", function () {
                var mockfs = new MockFs({
                    '/home/usr/project' :               { type: 'dir' },
                });

                var code = codegs.create();
                var error = code.setup({
                        rootdir:    '/home/usr/project',
                        mainfile:   'main.js'
                    }, mockfs);

                expect(error).toBe('Error: main file is not existent.');
                expect(code.files.main).toBe(null);
            });

            it("case#3 : mainfile is directory and it's empty.", function () {
                var mockfs = new MockFs({
                    '/home/usr/project' :               { type: 'dir' },
                    '/home/usr/project/main.js' :       { type: 'dir' },
                });

                var code = codegs.create();
                var error = code.setup({
                        rootdir:    '/home/usr/project',
                        mainfile:   'main.js'
                    }, mockfs);

                expect(error).toBe('Error: main file is not found.');
                expect(code.files.main).toBe(null);
            });

            it("case#4 : mainfile is invalid filetype.", function () {
                var mockfs = new MockFs({
                    '/home/usr/project' :               { type: 'dir' },
                    '/home/usr/project/main.js' :       { type: 'INVALID' },
                });

                var code = codegs.create();
                var error = code.setup({
                        rootdir:    '/home/usr/project',
                        mainfile:   'main.js'
                    }, mockfs);

                expect(error).toBe('Error: main file is not valid filetype.');
                expect(code.files.main).toBe(null);
            });
        });
    });



/*
    var config = {
        rootdir:    process.cwd(),

        mainfile:   argv.targets.length === 0 ? './package.json' :
                    argv.targets.length === 1 ? argv.targets[0] : null,

        source:     argv.source     || [process.cwd()], // default current directory
        output:     argv.output     || null,
        core:       argv.core       || './core',
        nodecore:   argv.nodecore   || './node_core',
        kernel:     argv.kernel     || null
    };
*/


    xdescribe("Method _parsePackageJson:", function () {

    });

    xdescribe("Method _joinPath:", function () {
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
});
