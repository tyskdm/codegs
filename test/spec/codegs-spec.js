
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

    beforeEach(function () {
        ;
    });

    describe("'codegs' itself:", function () {
        describe("has Methods and Properties:", function () {
            it("Method setup", function () {
                expect(typeof codegs.setup).toBe('function');
            });
            it("Method addSourceFiles", function () {
                expect(typeof codegs.addSourceFiles).toBe('function');
            });
            it("Method removeIgnoreFiles", function () {
                expect(typeof codegs.removeIgnoreFiles).toBe('function');
            });
            it("Method outMergedScript", function () {
                expect(typeof codegs.outMergedScript).toBe('function');
            });

            it("Method _parsePackageJson", function () {
                expect(typeof codegs._parsePackageJson).toBe('function');
            });
            it("Property _files", function () {
                expect(codegs._files).toEqual({
                    'js':     [],
                    'json':   [],
                    'main':   '',
                    'kernel': ''
                });
            });
        });
    });

    describe("Method init:", function () {
        var TEST_CASE = [
            {
                title: 'case#1',
                files: {
                    '/home/usr/project' : 'd',
                    '/home/usr/project/package.json' : 'f',
                    '/home/usr/project/lib' : 'd',
                    '/home/usr/project/lib/file1' : 'f',
                    '/home/usr/project/lib/file2' : 'f',
                    '/home/usr/project/lib/file3' : 'f',
                    '/home/usr/project/lib/folder' : 'd',
                },
                config: {
                    rootdir:    '/home/usr/project',
                    mainfile:   '/home/usr/project/lib/file1'
                },
                toBe: '/home/usr/project/lib/file1'
            },
            {
                title: 'case#2',
                files: {
                    '/home/usr/project' : 'd',
                    '/home/usr/project/package.json' : 'f',
                    '/home/usr/project/lib' : 'd',
                    '/home/usr/project/lib/file1' : 'f',
                    '/home/usr/project/lib/file2' : 'f',
                    '/home/usr/project/lib/file3' : 'f',
                    '/home/usr/project/lib/folder' : 'd',
                },
                config: {
                    rootdir:    '/home/usr/project',
                    mainfile:   '/home/usr/project/lib/file1'
                },
                toBe: '/home/usr/project/lib/file1'
            }
        ];

        function getMockFs(files) {
            var storage = files;

            function existsSync(file) {
                return (storage[file] !== undefined) ? true : false;
            }

            function statSync(file) {
                var stat = storage[file].slice(0);

                function isDirectory() { return (stat === 'd'); }

                function isFile() { return (stat === 'f'); }

                return {
                    stat: stat,
                    isDirectory: isDirectory,
                    isFile: isFile
                }
            }

            return {
                existsSync: existsSync,
                statSync: statSync
            };
        };

        for (var i = 0; i < TEST_CASE.length; i++) {
            it("should pass TEST_CASE[ " + TEST_CASE[i].title + " ]", (function () {
                var mockfs = getMockFs(TEST_CASE[i].files);
                var config = TEST_CASE[i].config;
                var toBe = TEST_CASE[i].toBe;

                function func() {
                    codegs.setup(config, mockfs);
                    expect(config.mainfile).toBe(toBe);
                }
                return func;
            })());
        }
    });

    describe("Method _parsePackageJson:", function () {

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
