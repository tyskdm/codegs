
var Module = require('../../lib/codegs/files.js');

describe("files:", function () {

    describe("files itself:", function () {
        describe("methods and properties:", function () {
            it("save", function () {
                expect(typeof Module.prototype.require).toBe('function');
            });
            it("load", function () {
                expect(typeof Module.prototype.require).toBe('function');
            });
            it("exists", function () {
                expect(typeof Module.prototype.require).toBe('function');
            });

            it("resolveFilename", function () {
                expect(typeof Module.prototype.require).toBe('function');
            });
            it("getDir", function () {
                expect(typeof Module.prototype.require).toBe('function');
            });
            it("join", function () {
                expect(typeof Module.prototype.require).toBe('function');
            });
            it("findFile", function () {
                expect(typeof Module.prototype.require).toBe('function');
            });
        });
    });

    describe("files.findFile method:", function () {
        it("should get 2 options.", function () {
            var filename = '/path/to/file';
            var option = [ '', '.js', '/package.json', '/index.js' ];

            files.findFile('/path/to/file', option);


            expect(Module._files['DEFINE_TEST']).toBe(func);
        });
    });
});
