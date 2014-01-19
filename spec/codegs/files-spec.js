
xdescribe("files:", function () {

    var files = require('../../lib/codegs/files.js');

    describe("files itself:", function () {
        describe("methods and properties:", function () {
            it("save", function () {
                expect(typeof files.prototype.require).toBe('function');
            });
            it("load", function () {
                expect(typeof files.prototype.require).toBe('function');
            });
            it("exists", function () {
                expect(typeof files.prototype.require).toBe('function');
            });

            it("resolveFilename", function () {
                expect(typeof files.prototype.require).toBe('function');
            });
            it("getDirname", function () {
                expect(typeof files.prototype.require).toBe('function');
            });
            it("joinPath", function () {
                expect(typeof files.prototype.require).toBe('function');
            });
            it("findFile", function () {
                expect(typeof files.prototype.require).toBe('function');
            });
        });
    });

    describe("method getDirname:", function () {
        it("should return dirname in full-filename.", function () {
            expect(files.getDirname('/path/to/file.js')).toBe('/path/to');
            expect(files.getDirname('/path/to/file/package.json')).toBe('/path/to/file');
        });
        it("should return arguments itself when filename doesn't starts with '/'.", function () {
            expect(files.getDirname('not/starts/with/slash.js')).toBe('not/starts/with/slash.js');
        });
    });

    describe("method joinPath:", function () {
        it("should return full-filename.", function () {
            expect(files.joinPath('/project/src', '../lib/assert.js')).toBe('/project/lib/assert.js');
        });
        it("overwrite basedir with requested path starts with slash.", function () {
            expect(files.joinPath('/a/b/c', '/d/file.js')).toBe('/d/file.js');
        });
        it("process up/down relative-path.", function () {
            expect(files.joinPath('/a/b/c', '../../d/./e/../../../f/file.js')).toBe('/f/file.js');
        });
        it("keep trail slash.", function () {
            expect(files.joinPath('/a/b', '../lib/module/')).toBe('/a/lib/module/');
        });
        it("should throw in error cases.", function () {
            expect(files.getDirname('/a/b', '../../../file.js')).toThrow();
        });
    });

    describe("files.findFile method:", function () {
        it("should get 2 options.", function () {
            var filename = '/path/to/file';
            var option = [ '', '.js', '/package.json', '/index.js' ];

            files.findFile('/path/to/file', option);


            expect(files._files['DEFINE_TEST']).toBe(func);
        });
    });
});
