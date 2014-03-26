/*
    Usage:

    var config = {
        rootdir:    process.cwd(),
        mainfile:   path to mainfile or package.json
        source:     argv.source     || [process.cwd()],
        output:     argv.output     || null,
        core:       argv.core       || './core',
        nodecore:   argv.nodecore   || './node_core',
        kernel:     argv.kernel     || null
    };

    Codegs.create(config);
*/

describe("codegs:", function () {

    var path =   require('path');
    var codegs = require('../../lib/codegs.js');
    var MockFs = require('../mock/mockfs.js');

    beforeEach(function () {
        ;
    });

    describe("'codegs' itself:", function () {
        it("should be constractor.", function () {
            expect(typeof codegs).toBe('function');
        });
    });

    describe("Method create:", function () {
        var DEFAULT_CONFIG = {
                rootdir:      null,
                mainfile:     null,
                source:       null,
                output:       null,
                core:         null,
                node_core:    null,
                node_modules: null,
                kernel:       null
            },
            DUMMY_CONFIG = {
                rootdir:      '/project',
                mainfile:     '/project/main.js'
            },
            ADDED_CONFIG = {
                rootdir:      '/project',
                mainfile:     '/project/main.js',

                source:       null,
                output:       null,
                core:         null,
                node_core:    null,
                node_modules: null,
                kernel:       null
            };

        it("creates new codegs object.", function () {
            expect(codegs.create() instanceof codegs).toBe(true);
        });

        it("should return default values when argument not exists.", function () {
            var code = codegs.create();
            expect(code.config).toEqual(DEFAULT_CONFIG);
        });

        it("should set config-info into object", function () {
            var code = codegs.create(DUMMY_CONFIG);
            expect(code.config).toEqual(ADDED_CONFIG);
        });
    });

    describe("Method loadPackageJson:", function () {

        it("should return Error when package.json is not found.", function () {
            var mockfs = new MockFs({
                '/project/lib/main.js' :        { type: 'file' }
            });

            var code = codegs.create();
            var error = code.loadPackageJson('/project/package.json', mockfs);
            expect(error).toBe('Error: package.json is not found.');
        });

        describe("should call addConfig to set config with package info:", function () {
            it("case#1 package.json is empty.", function () {
                var mockfs = new MockFs({
                    '/project/package.json' :       { type: 'file' }
                });

                var code = codegs.create();
                spyOn(code, '_require').andReturn({ /* EMPTY */ });
                spyOn(code, 'addConfig').andReturn(null);

                var error = code.loadPackageJson('/project/package.json', mockfs);
                expect(error).toBeNull();

                expect(code._require.calls.length).toEqual(1);
                expect(code.addConfig.calls.length).toEqual(1);

                expect(code.addConfig).toHaveBeenCalledWith({
                    rootdir:      '/project',
                    mainfile:     null,
                    node_modules: []
                });
            });

            it("case#2 package.json has properties.", function () {
                var mockfs = new MockFs({
                    '/project/package.json' :       { type: 'file' }
                });

                var code = codegs.create();
                spyOn(code, '_require').andReturn({
                    main:         './lib/main.js',
                    dependencies: {
                        argv: '~v0.0.0',
                        mods: 'v1.0.0'
                    }
                });
                spyOn(code, 'addConfig').andReturn(null);

                var error = code.loadPackageJson('/project/package.json', mockfs);
                expect(error).toBeNull();

                expect(code._require.calls.length).toEqual(1);
                expect(code.addConfig.calls.length).toEqual(1);

                expect(code.addConfig).toHaveBeenCalledWith({
                    rootdir:      '/project',
                    mainfile:     './lib/main.js',
                    node_modules: [ 'argv', 'mods' ]
                });
            });

            it("case#3 package.json has props and empty files list.", function () {
                var mockfs = new MockFs({
                    '/project/package.json' :       { type: 'file' }
                });

                var code = codegs.create();
                spyOn(code, '_require').andReturn({
                    files: []
                });
                spyOn(code, 'addConfig').andReturn(null);

                var error = code.loadPackageJson('/project/package.json', mockfs);
                expect(error).toBeNull();

                expect(code._require.calls.length).toEqual(1);
                expect(code.addConfig.calls.length).toEqual(1);

                expect(code.addConfig).toHaveBeenCalledWith({
                    rootdir:      '/project',
                    mainfile:     null,
                    node_modules: [],
                    source:       []
                });
            });

            it("case#4 package.json has props and files list containing some.", function () {
                var mockfs = new MockFs({
                    '/project/package.json' :       { type: 'file' }
                });

                var code = codegs.create();
                spyOn(code, '_require').andReturn({
                    files: [ 'lib', './src' ]
                });
                spyOn(code, 'addConfig').andReturn(null);

                var error = code.loadPackageJson('/project/package.json', mockfs);
                expect(error).toBeNull();

                expect(code._require.calls.length).toEqual(1);
                expect(code.addConfig.calls.length).toEqual(1);

                expect(code.addConfig).toHaveBeenCalledWith({
                    rootdir:      '/project',
                    mainfile:     null,
                    node_modules: [],
                    source:       [ '/project/lib', '/project/src' ]
                });
            });
        });
    });

    /*
     *  Method setup:
     *  - find mainfile
     *  - TODO: should check kernel option.
     */
    describe("Method setup:", function () {

        describe("should set default config values:", function () {
            it("rootdir = process.cwd.", function () {
                var mockfs = new MockFs({
                    '/home/usr/project' :               { type: 'dir' },
                    '/home/usr/project/main.js' :       { type: 'file'}
                });

                var code = codegs.create();
                expect(code.config.rootdir).toBe(null);

                var error = code.setup(mockfs);
                expect(error).not.toBeNull();
                expect(code.config.rootdir).toBe(process.cwd());
            });

            it("mainfile = process.cwd.", function () {
                var mockfs = new MockFs({
                    '/home/usr/project' :               { type: 'dir' },
                    '/home/usr/project/main.js' :       { type: 'file'}
                });

                var code = codegs.create();
                expect(code.config.mainfile).toBe(null);

                var error = code.setup(mockfs);
                expect(code.config.mainfile).toBe(process.cwd());
                expect(error).not.toBeNull();
            });
        });

        describe("should check code_core directory:", function () {
            it("case#1 : core_dir not specified.", function () {
                var mockfs = new MockFs({
                    '/home/usr/project' :               { type: 'dir' },
                    '/home/usr/project/main.js' :       { type: 'file'}
                });

                var code = codegs.create({
                    rootdir:    '/home/usr/project',
                    mainfile:   '/home/usr/project/main.js'
                });
                expect(code.config.core).toBe(null);

                var error = code.setup(mockfs);
                expect(error).toBe(null);
                expect(code.config.core).toBe('/home/usr/project/core');
            });

            it("case#2 : core_dir exists.", function () {
                var mockfs = new MockFs({
                    '/home/usr/project' :               { type: 'dir' },
                    '/home/usr/project/main.js' :       { type: 'file'},
                    '/home/usr/project/core' :          { type: 'dir'}
                });

                var code = codegs.create({
                    rootdir:    '/home/usr/project',
                    mainfile:   '/home/usr/project/main.js'
                });
                expect(code.config.core).toBe(null);

                code.addConfig({ core: './core' });
                expect(code.config.core).toBe('./core');

                var error = code.setup(mockfs);
                expect(error).toBe(null);
                expect(code.config.core).toBe('/home/usr/project/core');
            });

            it("case#3 : core_dir NOT exists.", function () {
                var mockfs = new MockFs({
                    '/home/usr/project' :               { type: 'dir' },
                    '/home/usr/project/main.js' :       { type: 'file'}
                });

                var code = codegs.create({
                    rootdir:    '/home/usr/project',
                    mainfile:   '/home/usr/project/main.js'
                });
                expect(code.config.core).toBe(null);

                code.addConfig({ core: './core' });
                expect(code.config.core).toBe('./core');

                var error = code.setup(mockfs);
                expect(error).toBe('Error: core module directory is not existent.');
                expect(code.config.core).toBe('/home/usr/project/core');
            });

            it("case#4 : core_dir is not a directory.", function () {
                var mockfs = new MockFs({
                    '/home/usr/project' :               { type: 'dir' },
                    '/home/usr/project/main.js' :       { type: 'file'},
                    '/home/usr/project/core' :          { type: 'file'}
                });

                var code = codegs.create({
                    rootdir:    '/home/usr/project',
                    mainfile:   '/home/usr/project/main.js'
                });
                expect(code.config.core).toBe(null);

                code.addConfig({ core: './core' });
                expect(code.config.core).toBe('./core');

                var error = code.setup(mockfs);
                expect(error).toBe('Error: core module directory is not directory.');
                expect(code.config.core).toBe('/home/usr/project/core');
            });
        });

        describe("should check node_core directory:", function () {
            it("case#1 : node_core_dir not specified.", function () {
                var mockfs = new MockFs({
                    '/home/usr/project' :               { type: 'dir' },
                    '/home/usr/project/main.js' :       { type: 'file'}
                });

                var code = codegs.create({
                    rootdir:    '/home/usr/project',
                    mainfile:   '/home/usr/project/main.js'
                });
                expect(code.config.node_core).toBe(null);

                var error = code.setup(mockfs);
                expect(error).toBe(null);
                expect(code.config.node_core).toBe('/home/usr/project/node_core');
            });

            it("case#2 : node_core_dir exists.", function () {
                var mockfs = new MockFs({
                    '/home/usr/project' :               { type: 'dir' },
                    '/home/usr/project/main.js' :       { type: 'file'},
                    '/home/usr/project/node_core' :     { type: 'dir'}
                });

                var code = codegs.create({
                    rootdir:    '/home/usr/project',
                    mainfile:   '/home/usr/project/main.js'
                });
                expect(code.config.node_core).toBe(null);

                code.addConfig({ node_core: './node_core' });
                expect(code.config.node_core).toBe('./node_core');

                var error = code.setup(mockfs);
                expect(error).toBe(null);
                expect(code.config.node_core).toBe('/home/usr/project/node_core');
            });

            it("case#3 : node_core_dir NOT exists.", function () {
                var mockfs = new MockFs({
                    '/home/usr/project' :               { type: 'dir' },
                    '/home/usr/project/main.js' :       { type: 'file'}
                });

                var code = codegs.create({
                    rootdir:    '/home/usr/project',
                    mainfile:   '/home/usr/project/main.js'
                });
                expect(code.config.node_core).toBe(null);

                code.addConfig({ node_core: './node_core' });
                expect(code.config.node_core).toBe('./node_core');

                var error = code.setup(mockfs);
                expect(error).toBe('Error: node_core module directory is not existent.');
                expect(code.config.node_core).toBe('/home/usr/project/node_core');
            });

            it("case#4 : node_core_dir is not a directory.", function () {
                var mockfs = new MockFs({
                    '/home/usr/project' :               { type: 'dir' },
                    '/home/usr/project/main.js' :       { type: 'file'},
                    '/home/usr/project/node_core' :     { type: 'file'}
                });

                var code = codegs.create({
                    rootdir:    '/home/usr/project',
                    mainfile:   '/home/usr/project/main.js'
                });
                expect(code.config.node_core).toBe(null);

                code.addConfig({ node_core: './node_core' });
                expect(code.config.node_core).toBe('./node_core');

                var error = code.setup(mockfs);
                expect(error).toBe('Error: node_core module directory is not directory.');
                expect(code.config.node_core).toBe('/home/usr/project/node_core');
            });
        });

        describe("should find mainfile:", function () {
            it("case#1 : mainfile exists.", function () {
                var mockfs = new MockFs({
                    '/home/usr/project' :               { type: 'dir' },
                    '/home/usr/project/main.js' :       { type: 'file'}
                });

                var code = codegs.create({
                    rootdir:    '/home/usr/project',
                    mainfile:   '/home/usr/project/main.js'
                });
                var error = code.setup(mockfs);

                expect(error).toBe(null);
                expect(code.files.main).toBe('/home/usr/project/main.js');
            });

            it("case#2 : mainfile is not exists.", function () {
                var mockfs = new MockFs({
                    '/home/usr/project' :               { type: 'dir' }
                });

                var code = codegs.create({
                        rootdir:    '/home/usr/project',
                        mainfile:   '/home/usr/project/main.js'
                    });
                var error = code.setup(mockfs);

                expect(error).toBe('Error: main file is not existent.');
                expect(code.files.main).toBe(null);
            });

            it("case#3 : mainfile is directory.", function () {
                var mockfs = new MockFs({
                    '/home/usr/project' :               { type: 'dir' },
                    '/home/usr/project/main.js' :       { type: 'dir' }
                });

                var code = codegs.create({
                        rootdir:    '/home/usr/project',
                        mainfile:   '/home/usr/project/main.js'
                    });
                var error = code.setup(mockfs);

                expect(error).toBe('Error: main file is not valid filetype.');
                expect(code.files.main).toBe(null);
            });

            it("case#4 : mainfile is invalid filetype.", function () {
                var mockfs = new MockFs({
                    '/home/usr/project' :               { type: 'dir' },
                    '/home/usr/project/main.js' :       { type: 'INVALID' }
                });

                var code = codegs.create({
                        rootdir:    '/home/usr/project',
                        mainfile:   '/home/usr/project/main.js'
                    });
                var error = code.setup(mockfs);

                expect(error).toBe('Error: main file is not valid filetype.');
                expect(code.files.main).toBe(null);
            });
        });
    });

    /*
     *  Method addSourceFiles:
     *
     *  - add source files into files listObjects.
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
                    '/project/core/Buffer.json':    { type: 'file'}
                });

                var list = {};
                var code = codegs.create();
                var err = code._addFilesToList(list, '/project/core', 'core/', false, mockfs);

                expect(err).toBeNull();
                expect(list).toEqual({
                    '/project/core/process.js':     { type: 'js',   path: 'core/process.js' },
                    '/project/core/Buffer.json':    { type: 'json', path: 'core/Buffer.json' }
                });
            });

            it("case#2 : add files from empty directory.", function () {
                var mockfs = new MockFs({
                    '/project/core':  { type: 'dir'}
                });

                var list = {};
                var code = codegs.create();
                var err = code._addFilesToList(list, '/project/core', 'core/', false, mockfs);

                expect(err).toBeNull();
                expect(list).toEqual({
                    // empty.
                });
            });

            it("case#3 : add files in ./core nested directory.", function () {
                var mockfs = new MockFs({
                    '/project/core/process.js':     { type: 'file'},
                    '/project/core/lib/Buffer.js':  { type: 'file'},
                    '/project/core/lib/sub/a.json': { type: 'file'}
                });

                var list = {};
                var code = codegs.create();
                var err = code._addFilesToList(list, '/project/core', 'core/', false, mockfs);

                expect(err).toBeNull();
                expect(list).toEqual({
                    '/project/core/process.js':     { type: 'js',   path: 'core/process.js' },
                    '/project/core/lib/Buffer.js':  { type: 'js',   path: 'core/lib/Buffer.js' },
                    '/project/core/lib/sub/a.json': { type: 'json', path: 'core/lib/sub/a.json' }
                });
           });

            it("case#4 : do nothing when directory not exists.", function () {
                var mockfs = new MockFs({
                    // empty.
                });

                var list = {};
                var code = codegs.create();
                var err = code._addFilesToList(list, '/project/core', 'core/', false, mockfs);

                expect(err).toBeNull();
                expect(list).toEqual({
                    // empty.
                });
            });

            it("case#5 : Ignore not .js / .json files.", function () {
                var mockfs = new MockFs({
                    '/project/core/a.js':           { type: 'file'},
                    '/project/core/b.json':         { type: 'file'},
                    '/project/core/c':              { type: 'file'},
                    '/project/core/.js':            { type: 'file'},
                    '/project/core/.json':          { type: 'file'},
                    '/project/core/lib.js/d.js':    { type: 'file'},
                    '/project/core/lib.js/e':       { type: 'file'}
                });

                var list = {};
                var code = codegs.create();
                var err = code._addFilesToList(list, '/project/core', 'core/', false, mockfs);

                expect(err).toBeNull();
                expect(list).toEqual({
                    '/project/core/a.js':           { type: 'js',   path: 'core/a.js' },
                    '/project/core/b.json':         { type: 'json', path: 'core/b.json' },
                    '/project/core/lib.js/d.js':    { type: 'js',   path: 'core/lib.js/d.js' }
                });
           });
        });

        describe("Method addCoreFiles:", function () {
            it("case#1 : add files in ./core directory.", function () {
                var mockfs = new MockFs({
                    '/project/core/process.js':     { type: 'file'},
                    '/project/core/Buffer.js':      { type: 'file'},
                    '/project/main.js':             { type: 'file'}
                });
                var code = codegs.create({
                        rootdir:    '/project',
                        mainfile:   '/project/main.js',
                        core:       '/project/core'
                    });
                expect(code.setup(mockfs)).toBeNull();

                var err = code.addCoreFiles(mockfs);
                expect(err).toBeNull();
                expect(code.files.core).toEqual({
                    '/project/core/process.js': { type: 'js', path: 'core/process.js' },
                    '/project/core/Buffer.js' : { type: 'js', path: 'core/Buffer.js' }
                });
            });
        });

        describe("Method addNodeCoreFiles:", function () {
            it("case#1 : add files in ./node_core directory.", function () {
                var mockfs = new MockFs({
                    '/project/node_core/util.js':   { type: 'file'},
                    '/project/node_core/assert.js': { type: 'file'},
                    '/project/main.js':             { type: 'file'}
                });
                var code = codegs.create({
                        rootdir:    '/project',
                        mainfile:   '/project/main.js',
                        node_core:       '/project/node_core'
                    });
                expect(code.setup(mockfs)).toBeNull();

                var err = code.addNodeCoreFiles(mockfs);
                expect(err).toBeNull();
                expect(code.files.node_core).toEqual({
                    '/project/node_core/util.js':   { type: 'js', path: 'node_core/util.js' },
                    '/project/node_core/assert.js': { type: 'js', path: 'node_core/assert.js' }
                });
            });
        });

        describe("Method addNodeModules:", function () {
            it("case#1 : add files in ./node_modules directory.", function () {
                var mockfs = new MockFs({
                    '/project/node_modules/argv.js':      { type: 'file'},
                    '/project/node_modules/minimatch.js': { type: 'file'},
                    '/project/main.js':                   { type: 'file'}
                });
                var code = codegs.create({
                    rootdir:    '/project',
                    mainfile:   '/project/main.js'
                });
                expect(code.setup(mockfs)).toBeNull();

                var err = code.addNodeModules(mockfs);
                expect(err).toBeNull();
                expect(code.files.node_modules).toEqual({
                    '/project/node_modules/argv.js':      { type: 'js', path: '/node_modules/argv.js' },
                    '/project/node_modules/minimatch.js': { type: 'js', path: '/node_modules/minimatch.js' }
                });
            });

            it("case#2 : add only specified files.", function () {
                var mockfs = new MockFs({
                    '/project/node_modules/argv.js':                { type: 'file'},
                    '/project/node_modules/commander':              { type: 'file'},
                    '/project/node_modules/minimatch.js':           { type: 'file'},
                    '/project/node_modules/folderModule/main.js':   { type: 'file'},
                    '/project/main.js':                             { type: 'file'}
                });
                var code = codegs.create({
                    rootdir:        '/project',
                    mainfile:       '/project/main.js',
                    node_modules:   [ 'argv', 'commander', 'folderModule' ]
                });
                expect(code.setup(mockfs)).toBeNull();

                var err = code.addNodeModules(mockfs);
                expect(err).toBeNull();
                expect(code.files.node_modules).toEqual({
                    // '/project/node_modules/argv.js':                { type: 'js', path: '/node_modules/argv.js' },
                    // Currentry, It's necessary that specify full name with filename extension.

                    '/project/node_modules/commander':              { type: 'js', path: '/node_modules/commander' },
                    '/project/node_modules/folderModule/main.js':   { type: 'js', path: '/node_modules/folderModule/main.js' }
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
                    '/project/index.js':            { type: 'file'}
                });
                var code = codegs.create({
                        rootdir:    '/project',
                        mainfile:   '/project/index.js',
                        source:     ['/project']
                    });
                expect(code.setup(mockfs)).toBeNull();

                var err = code.addSourceFiles(mockfs);
                expect(err).toBeNull();
                expect(code.files.source).toEqual({
                    '/project/modules/tool.js':     { type: 'js', path: '/modules/tool.js' },
                    '/project/modules/util.js':     { type: 'js', path: '/modules/util.js' },
                    '/project/lib.js':              { type: 'js', path: '/lib.js' }
                });
            });

            it("case#2 : add files only in ./lib ./bin directory.", function () {
                var mockfs = new MockFs({
                    '/project/modules/tool.js':     { type: 'file'},
                    '/project/lib/module.js':       { type: 'file'},
                    '/project/bin/cli.js':          { type: 'file'},
                    '/project/index.js':            { type: 'file'}
                });
                var code = codegs.create({
                        rootdir:    '/project',
                        mainfile:   '/project/index.js',
                        source:     ['/project/lib/', '/project/bin']
                    });
                expect(code.setup(mockfs)).toBeNull();

                var err = code.addSourceFiles(mockfs);
                expect(err).toBeNull();
                expect(code.files.source).toEqual({
                    '/project/bin/cli.js':          { type: 'js', path: '/bin/cli.js' },
                    '/project/lib/module.js':       { type: 'js', path: '/lib/module.js' }
                });
            });

            it("case#3 : Sourcefile not specified.", function () {
                var mockfs = new MockFs({
                    '/project/modules/tool.js':     { type: 'file'},
                    '/project/modules/util.js':     { type: 'file'},
                    '/project/lib.js':              { type: 'file'},
                    '/project/index.js':            { type: 'file'}
                });
                var code = codegs.create({
                        rootdir:    '/project',
                        mainfile:   '/project/index.js'
                        // NOT SPECIFIED : source:     ['/project'],
                    });
                expect(code.setup(mockfs)).toBeNull();

                var err = code.addSourceFiles(mockfs);
                expect(err).toBeNull();
                expect(code.files.source).toEqual({
                    '/project/modules/tool.js':     { type: 'js', path: '/modules/tool.js' },
                    '/project/modules/util.js':     { type: 'js', path: '/modules/util.js' },
                    '/project/lib.js':              { type: 'js', path: '/lib.js' }
                });
            });

            it("case#4 : Specify sourcefiles list as empty.", function () {
                var mockfs = new MockFs({
                    '/project/modules/tool.js':     { type: 'file'},
                    '/project/modules/util.js':     { type: 'file'},
                    '/project/lib.js':              { type: 'file'},
                    '/project/index.js':            { type: 'file'}
                });
                var code = codegs.create({
                        rootdir:    '/project',
                        mainfile:   '/project/index.js',
                        source:     [ /* EMPTY */ ]
                    });
                expect(code.setup(mockfs)).toBeNull();

                var err = code.addSourceFiles(mockfs);
                expect(err).toBeNull();
                expect(code.files.source).toEqual({ /* EMPTY */ });
            });
        });

        describe("Private Method _addIgnoreFilepath:", function () {

            it("add ignore filepath into codegs object.", function () {
                var code = codegs.create();
                expect(code.ignoreFilepath).toEqual([]);

                code._addIgnoreFilepath('/main.js');

                expect(code.ignoreFilepath).toEqual(['/main.js']);
            });
        });

        describe("Private Method _addIgnorePattern:", function () {

            it("add ignore pattern into codegs object.", function () {
                var code = codegs.create();
                expect(code.ignorePattern).toEqual([]);

                code._addIgnorePattern('.*');

                expect(code.ignorePattern).toEqual(['.*']);
            });
        });

        describe("Private Method _isIgnoreFile:", function () {

            it("case#1 : should return true when match ignore pattern.", function () {
                var code = codegs.create();
                expect(code.ignorePattern).toEqual([]);

                code._addIgnorePattern('**/*.js');
                expect(code._isIgnoreFile('/main.js', true)).toBe(true);
                expect(code._isIgnoreFile('/project/lib/main.js', true)).toBe(true);
            });

            it("case#2 : should return false when unmatch ignore pattern.", function () {
                var code = codegs.create();
                expect(code.ignorePattern).toEqual([]);

                code._addIgnorePattern('**/*.js');
                expect(code._isIgnoreFile('/project.js/main.json', true)).toBe(false);
            });

            it("case#3 : should return false when checkPattern flag is not set.", function () {
                var code = codegs.create();
                expect(code.ignorePattern).toEqual([]);

                code._addIgnorePattern('**/*.js');
                expect(code._isIgnoreFile('/main.js')).toBe(false);
                expect(code._isIgnoreFile('/project/lib/main.js')).toBe(false);
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
                    '/project/core/kernel/core.js':  { type: 'file', content: '// ## core.js ##\n' }
                });
                var filesList = {
                    '/project/core/module.js':       { type: 'js',   path: 'core/module.js' },
                    '/project/core/dom.json':        { type: 'json', path: 'core/dom.json' },
                    '/project/main.js':              { type: 'main', path: '/main.js' },
                    '/project/core/kernel/core.js':  { type: 'core', path: 'core/kernel/core.js' }
                };

                var content = codegs._compileFilesList(filesList, mockfs);
                expect(typeof content).toBe('string');
                expect(content).not.toBe('');
            });

            it("should remove shebang from file content.", function () {
                var mockfs = new MockFs({
                    '/project/bin/cli.js':           { type: 'file', content: "#! /usr/bin/env node\nrequire('../lib/codegs')();\n" }
                });
                var filesList = {
                    '/project/bin/cli.js':           { type: 'js',   path: '/bin/cli.js' }
                };

                var content = codegs._compileFilesList(filesList, mockfs);
                expect(typeof content).toBe('string');
                expect(content).toBe("require('module').define('/bin/cli.js',\n" +
                                     "function (exports, require, module, __filename, __dirname) {\n" +
                                     "\nrequire('../lib/codegs')();\n" +
                                     "\n});\n");
            });

            it("should return null when filetype is invalid.", function () {
                var mockfs = new MockFs({
                    '/project/core/module.js':       { type: 'file', content: '// ## module.js ##\n' }
                });
                var filesList = {
                    '/project/core/module.js':       { type: 'INVALID',   path: 'core/module.js' }
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
                '/module.js':                    { type: 'file', content: '// ## module.js ##\n' }
            });

            //var code = codegs.create();
            //expect(code.setup({
            //        rootdir:    '/project',
            //        mainfile:   '/project/index.js',
            //        kernel:     '/module.js',
            //    }, mockfs)).toBeNull();
            var code = codegs.create({
                    rootdir:    '/project',
                    mainfile:   '/project/index.js',
                    kernel:     '/module.js'
                });
            expect(code.setup(mockfs)).toBeNull();

            code.files.core = {
                '/project/core/module.js':       { type: 'js',   path: 'core/module.js' },
                '/project/core/dom.json':        { type: 'json', path: 'core/dom.json' }
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
                '/module.js':                    { type: 'file', content: '// ## module.js ##\n' }
            });

            //var code = codegs.create();
            //expect(code.setup({
            //        rootdir:    '/project',
            //        mainfile:   '/project/index.js',
            //        kernel:     '/module.js',
            //    }, mockfs)).toBeNull();
            var code = codegs.create({
                    rootdir:    '/project',
                    mainfile:   '/project/index.js',
                    kernel:     '/module.js'
                });
            expect(code.setup(mockfs)).toBeNull();

            code.files.node_core = {
                '/project/node_core/assert.js': { type: 'js',   path: 'node_core/assert.js' },
                '/project/node_core/util.json': { type: 'json', path: 'node_core/util.json' }
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
                '/module.js':                    { type: 'file', content: '// ## module.js ##\n' }
            });
            //var code = codegs.create();
            //expect(code.setup({
            //        rootdir:    '/project',
            //        mainfile:   '/project/index.js',
            //        kernel:     '/module.js',
            //    }, mockfs)).toBeNull();
            var code = codegs.create({
                    rootdir:    '/project',
                    mainfile:   '/project/index.js',
                    kernel:     '/module.js'
                });
            expect(code.setup(mockfs)).toBeNull();

            code.files.source = {
                '/project/bin/cli.js':          { type: 'js', path: '/bin/cli.js' },
                '/project/lib/module.js':       { type: 'js', path: '/lib/module.js' }
            };

            var error = code.compile(mockfs);
            expect(error).toBeNull();
            expect(typeof code.content).toBe('string');
            expect(code.content).not.toBe('');
        });

        it("should wrap mainfile, merge, and store into codegs.content.", function () {
            var mockfs = new MockFs({
                '/project/index.js':            { type: 'file', content: '// ## index.js ##\n' },
                '/module.js':                    { type: 'file', content: '// ## module.js ##\n' }
            });
            //var code = codegs.create();
            //expect(code.setup({
            //        rootdir:    '/project',
            //        mainfile:   '/project/index.js',
            //        kernel:     '/module.js',
            //    }, mockfs)).toBeNull();
            var code = codegs.create({
                    rootdir:    '/project',
                    mainfile:   '/project/index.js',
                    kernel:     '/module.js'
                });
            expect(code.setup(mockfs)).toBeNull();

            var error = code.compile(mockfs);
            expect(error).toBeNull();
            expect(typeof code.content).toBe('string');
            expect(code.content).not.toBe('');
        });
    });


    xdescribe("Method _parsePackageJson:", function () {

    });
});
