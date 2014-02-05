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
     *  - TODO: should check all options(files and directories)
     */
    describe("Method setup:", function () {
        var DUMMY_CONFIG = {
            rootdir:  '/project',
            mainfile: '/project/main.js'
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
                        mainfile:   '/home/usr/project/main.js'
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
                        mainfile:   '/home/usr/project/main.js'
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
                        mainfile:   '/home/usr/project/main.js'
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
                        mainfile:   '/home/usr/project/main.js'
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
                    '/project/core/process.js':     { type: 'file'},
                    '/project/core/Buffer.json':    { type: 'file'},
                });

                var list = {};
                var code = codegs.create();
                var err = code._addFilesToList(list, '/project/core', 'core/', mockfs);

                expect(err).toBeNull();
                expect(list).toEqual({
                    '/project/core/process.js':     { type: 'js',   path: 'core/process.js' },
                    '/project/core/Buffer.json':    { type: 'json', path: 'core/Buffer.json' },
                });
            });

            it("case#2 : add files from empty directory.", function () {
                var mockfs = new MockFs({
                    '/project/core':  { type: 'dir'},
                });

                var list = {};
                var code = codegs.create();
                var err = code._addFilesToList(list, '/project/core', 'core/', mockfs);

                expect(err).toBeNull();
                expect(list).toEqual({
                    // empty.
                });
            });

            it("case#3 : add files in ./core nested directory.", function () {
                var mockfs = new MockFs({
                    '/project/core/process.js':     { type: 'file'},
                    '/project/core/lib/Buffer.js':  { type: 'file'},
                    '/project/core/lib/sub/a.json': { type: 'file'},
                });

                var list = {};
                var code = codegs.create();
                var err = code._addFilesToList(list, '/project/core', 'core/', mockfs);

                expect(err).toBeNull();
                expect(list).toEqual({
                    '/project/core/process.js':     { type: 'js',   path: 'core/process.js' },
                    '/project/core/lib/Buffer.js':  { type: 'js',   path: 'core/lib/Buffer.js' },
                    '/project/core/lib/sub/a.json': { type: 'json', path: 'core/lib/sub/a.json' },
                });
           });

            it("case#4 : do nothing when directory not exists.", function () {
                var mockfs = new MockFs({
                    // empty.
                });

                var list = {};
                var code = codegs.create();
                var err = code._addFilesToList(list, '/project/core', 'core/', mockfs);

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
                        mainfile:   '/project/main.js',
                        core:       '/project/core'
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
                        mainfile:   '/project/main.js',
                        node_core:  '/project/node_core'
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
                        mainfile:   '/project/main.js',
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
            // TODO: should check the directory exists or not.

            it("case#1 : add all files in ./ directory.", function () {
                var mockfs = new MockFs({
                    '/project/modules/tool.js':     { type: 'file'},
                    '/project/modules/util.js':     { type: 'file'},
                    '/project/lib.js':              { type: 'file'},
                    '/project/index.js':            { type: 'file'},
                });
                var code = codegs.create();
                expect(code.setup({
                        rootdir:    '/project',
                        mainfile:   '/project/index.js',
                        source:     ['/project'],
                    }, mockfs)).toBeNull();

                var err = code.addSourceFiles(mockfs);
                expect(err).toBeNull();
                expect(code.files.source).toEqual({
                    '/project/modules/tool.js':     { type: 'js', path: '/modules/tool.js' },
                    '/project/modules/util.js':     { type: 'js', path: '/modules/util.js' },
                    '/project/lib.js':              { type: 'js', path: '/lib.js' },
                });
            });

            it("case#2 : add files only in ./lib ./bin directory.", function () {
                var mockfs = new MockFs({
                    '/project/modules/tool.js':     { type: 'file'},
                    '/project/lib/module.js':       { type: 'file'},
                    '/project/bin/cli.js':          { type: 'file'},
                    '/project/index.js':            { type: 'file'},
                });
                var code = codegs.create();
                expect(code.setup({
                        rootdir:    '/project',
                        mainfile:   '/project/index.js',
                        source:     ['/project/lib/', '/project/bin'],
                    }, mockfs)).toBeNull();

                var err = code.addSourceFiles(mockfs);
                expect(err).toBeNull();
                expect(code.files.source).toEqual({
                    '/project/bin/cli.js':          { type: 'js', path: '/bin/cli.js' },
                    '/project/lib/module.js':       { type: 'js', path: '/lib/module.js' },
                });
            });
        });

        describe("Private Method _addIgnorePattern:", function () {

            it("add ignore pattern into codegs object.", function () {
                var code = codegs.create();
                expect(code.ignore).toEqual([]);

                code._addIgnorePattern('.*');

                expect(code.ignore).toEqual(['.*']);
            });
        });

        describe("Private Method _isIgnoreFile:", function () {

            it("case#1 : should return true when match ignore pattern.", function () {
                var code = codegs.create();
                expect(code.ignore).toEqual([]);

                code._addIgnorePattern('*.js');
                expect(code._isIgnoreFile('main.js')).toBe(true);
            });

            it("case#2 : should return false when unmatch ignore pattern.", function () {
                var code = codegs.create();
                expect(code.ignore).toEqual([]);

                code._addIgnorePattern('*.js');
                expect(code._isIgnoreFile('main.json')).toBe(false);
            });
        });
    });


    /*
     *  Method compile:
     *  - get filename from codegs object.
     *  - read and wrap source files, and merge them.
     *  - store that into codegs.content.
     */
    describe("Method compile:", function () {

        describe("Static Private Method _compileFilesList:", function () {

            it("should wrap files and return merged one.", function () {
                var mockfs = new MockFs({
                    '/project/core/module.js':       { type: 'file', content: '// ## module.js ##\n' },
                    '/project/core/dom.json':        { type: 'file', content: '// ## dom.json ##\n' },
                    '/project/main.js':              { type: 'file', content: '// ## main.js ##\n' },
                    '/project/core/kernel/core.js':  { type: 'file', content: '// ## core.js ##\n' },
                });
                var filesList = {
                    '/project/core/module.js':       { type: 'js',   path: 'core/module.js' },
                    '/project/core/dom.json':        { type: 'json', path: 'core/dom.json' },
                    '/project/main.js':              { type: 'main', path: '/main.js' },
                    '/project/core/kernel/core.js':  { type: 'core', path: 'core/kernel/core.js' },
                };

                var content = codegs._compileFilesList(filesList, mockfs);
                expect(typeof content).toBe('string');
                expect(content).not.toBe('');
            });

            it("should return null when filetype is invalid.", function () {
                var mockfs = new MockFs({
                    '/project/core/module.js':       { type: 'file', content: '// ## module.js ##\n' },
                });
                var filesList = {
                    '/project/core/module.js':       { type: 'INVALID',   path: 'core/module.js' },
                };

                expect(function () {
                    codegs._compileFilesList(filesList, mockfs);
                }).toThrow();
            });
        });

        it("should wrap corefile, merge, and store into codegs.content.", function () {
            var mockfs = new MockFs({
                '/project/core/module.js':       { type: 'file', content: '// ## module.js ##\n' },
                '/project/core/dom.json':        { type: 'file', content: '// ## dom.json ##\n' },
                '/project/index.js':             { type: 'file', content: '// ## index.js ##\n' },
                '/module.js':                    { type: 'file', content: '// ## module.js ##\n' },
            });
            var code = codegs.create();
            expect(code.setup({
                    rootdir:    '/project',
                    mainfile:   '/project/index.js',
                    kernel:     '/module.js',
                }, mockfs)).toBeNull();
            code.files.core = {
                '/project/core/module.js':       { type: 'js',   path: 'core/module.js' },
                '/project/core/dom.json':        { type: 'json', path: 'core/dom.json' },
            };

            var error = code.compile(mockfs);
            expect(error).toBeNull();
            expect(typeof code.content).toBe('string');
            expect(code.content).not.toBe('');
        });

        it("should wrap node_core files and merge them into codegs.content.", function () {
            var mockfs = new MockFs({
                '/project/node_core/assert.js': { type: 'file', content: '// ## assert.js ##\n' },
                '/project/node_core/util.json': { type: 'file', content: '// ## util.json ##\n' },
                '/project/index.js':            { type: 'file', content: '// ## index.js ##\n' },
                '/module.js':                    { type: 'file', content: '// ## module.js ##\n' },
            });
            var code = codegs.create();
            expect(code.setup({
                    rootdir:    '/project',
                    mainfile:   '/project/index.js',
                    kernel:     '/module.js',
                }, mockfs)).toBeNull();
            code.files.node_core = {
                '/project/node_core/assert.js': { type: 'js',   path: 'node_core/assert.js' },
                '/project/node_core/util.json': { type: 'json', path: 'node_core/util.json' },
            };

            var error = code.compile(mockfs);
            expect(error).toBeNull();
            expect(typeof code.content).toBe('string');
            expect(code.content).not.toBe('');
        });

        it("should wrap sourcefile, merge, and store into codegs.content.", function () {
            var mockfs = new MockFs({
                '/project/lib/module.js':       { type: 'file', content: '// ## module.js ##\n' },
                '/project/bin/cli.js':          { type: 'file', content: '// ## cli.js ##\n' },
                '/project/index.js':            { type: 'file', content: '// ## index.js ##\n' },
                '/module.js':                    { type: 'file', content: '// ## module.js ##\n' },
            });
            var code = codegs.create();
            expect(code.setup({
                    rootdir:    '/project',
                    mainfile:   '/project/index.js',
                    kernel:     '/module.js',
                }, mockfs)).toBeNull();
            code.files.source = {
                '/project/bin/cli.js':          { type: 'js', path: '/bin/cli.js' },
                '/project/lib/module.js':       { type: 'js', path: '/lib/module.js' },
            };

            var error = code.compile(mockfs);
            expect(error).toBeNull();
            expect(typeof code.content).toBe('string');
            expect(code.content).not.toBe('');
        });

        it("should wrap mainfile, merge, and store into codegs.content.", function () {
            var mockfs = new MockFs({
                '/project/index.js':            { type: 'file', content: '// ## index.js ##\n' },
                '/module.js':                    { type: 'file', content: '// ## module.js ##\n' },
            });
            var code = codegs.create();
            expect(code.setup({
                    rootdir:    '/project',
                    mainfile:   '/project/index.js',
                    kernel:     '/module.js',
                }, mockfs)).toBeNull();

            var error = code.compile(mockfs);
            expect(error).toBeNull();
            expect(typeof code.content).toBe('string');
            expect(code.content).not.toBe('');
        });
    });


    xdescribe("Method _parsePackageJson:", function () {

    });
});
