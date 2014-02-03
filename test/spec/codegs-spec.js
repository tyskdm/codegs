
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
     *  - set config info into codegs object
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
     *  Method addSourceFiles:
     *
     *  - add source files into two files listObjects, files['js'] and files['json'].
     *    files['js'] = {
     *          {realFilePath : codegsFilePath },
     *          {'~/poject/lib/example.js' : '/lib/example.js' },   // source files
     *          {'~/poject/core/assert.js' : 'core/assert.js' }     // core modules
     *      };
     *
     *  - serch files in paths configured by config.source.
     *
     *  - There's some of source types.
     *    1) Core file  <-- don't care here.
     *    2) main file  <-- don't care here.
     *    3) kernel file  <-- don't care here.
     *
     *    4) core files
     *    5) node_core files
     *    6) node_modules
     *    7) user source files
     */
    describe("Methods to add source files:", function () {

        describe("Static private Method _addFilesToList:", function () {

            it("case#1 : add files in ./core directory.", function () {
                var mockfs = new MockFs({
                    '/project/core/process.js': { type: 'file'},
                    '/project/core/Buffer.js':  { type: 'file'},
                });

                var list = {};
                var err = codegs._addFilesToList(list, '/project/core', 'core/', mockfs);

                expect(err).toBeNull();
                expect(list).toEqual({
                    '/project/core/process.js': { type: 'js', path: 'core/process.js' },
                    '/project/core/Buffer.js' : { type: 'js', path: 'core/Buffer.js' },
                });
            });

            it("case#2 : add files from empty directory.", function () {
                var mockfs = new MockFs({
                    '/project/core':  { type: 'dir'},
                });

                var list = {};
                var err = codegs._addFilesToList(list, '/project/core', 'core/', mockfs);

                expect(err).toBeNull();
                expect(list).toEqual({
                    // empty.
                });
            });

            it("case#3 : add files in ./core nested directory.", function () {
                var mockfs = new MockFs({
                    '/project/core/process.js':     { type: 'file'},
                    '/project/core/lib/Buffer.js':  { type: 'file'},
                    '/project/core/lib/sub/a.js':   { type: 'file'},
                });

                var list = {};
                var err = codegs._addFilesToList(list, '/project/core', 'core/', mockfs);

                expect(err).toBeNull();
                expect(list).toEqual({
                    '/project/core/process.js':     { type: 'js', path: 'core/process.js' },
                    '/project/core/lib/Buffer.js':  { type: 'js', path: 'core/lib/Buffer.js' },
                    '/project/core/lib/sub/a.js':   { type: 'js', path: 'core/lib/sub/a.js' },
                });

            });

            it("case#4 : do nothing when directory not exists.", function () {
                var mockfs = new MockFs({
                    // empty.
                });

                var list = {};
                var err = codegs._addFilesToList(list, '/project/core', 'core/', mockfs);

                expect(err).toBeNull();
                expect(list).toEqual({
                    // empty.
                });
            });
        });

        describe("Method addCoreFiles:", function () {
            // TODO: should check the directory exists or not.

            it("case#1 : add files in ./core directory.", function () {
                var mockfs = new MockFs({
                    '/project/core/process.js':     { type: 'file'},
                    '/project/core/Buffer.js':      { type: 'file'},
                    '/project/main.js':             { type: 'file'},
                });
                var code = codegs.create();
                expect(code.setup({
                        rootdir:    '/project',
                        mainfile:   'main.js',
                        core:       './core'
                    }, mockfs)).toBeNull();

                var err = code.addCoreFiles(mockfs);
                expect(err).toBeNull();
                expect(code.files.core).toEqual({
                    '/project/core/process.js': { type: 'js', path: 'core/process.js' },
                    '/project/core/Buffer.js' : { type: 'js', path: 'core/Buffer.js' },
                });
            });
        });

        describe("Method addNodeCoreFiles:", function () {
            // TODO: should check the directory exists or not.

            it("case#1 : add files in ./node_core directory.", function () {
                var mockfs = new MockFs({
                    '/project/node_core/util.js':   { type: 'file'},
                    '/project/node_core/assert.js': { type: 'file'},
                    '/project/main.js':             { type: 'file'},
                });
                var code = codegs.create();
                expect(code.setup({
                        rootdir:    '/project',
                        mainfile:   'main.js',
                        node_core:  './node_core'
                    }, mockfs)).toBeNull();

                var err = code.addNodeCoreFiles(mockfs);
                expect(err).toBeNull();
                expect(code.files.node_core).toEqual({
                    '/project/node_core/util.js':   { type: 'js', path: 'node_core/util.js' },
                    '/project/node_core/assert.js': { type: 'js', path: 'node_core/assert.js' },
                });
            });
        });

        describe("Method addNodeModules:", function () {
            // TODO: should check the directory exists or not.

            it("case#1 : add files in ./node_modules directory.", function () {
                var mockfs = new MockFs({
                    '/project/node_modules/argv.js':      { type: 'file'},
                    '/project/node_modules/minimatch.js': { type: 'file'},
                    '/project/main.js':                   { type: 'file'},
                });
                var code = codegs.create();
                expect(code.setup({
                        rootdir:    '/project',
                        mainfile:   'main.js',
                    }, mockfs)).toBeNull();

                var err = code.addNodeModules(mockfs);
                expect(err).toBeNull();
                expect(code.files.node_modules).toEqual({
                    '/project/node_modules/argv.js':      { type: 'js', path: '/node_modules/argv.js' },
                    '/project/node_modules/minimatch.js': { type: 'js', path: '/node_modules/minimatch.js' },
                });
            });
        });

        describe("Method addSourceFiles:", function () {

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
});
