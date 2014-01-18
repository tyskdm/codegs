
var Module = require('../../lib/codegs/files.js');

describe("files:", function () {

    describe("files itself:", function () {
        describe("methods and properties:", function () {
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
            it("store", function () {
                expect(typeof Module.prototype.require).toBe('function');
            });
            it("exists", function () {
                expect(typeof Module.prototype.require).toBe('function');
            });
            it("getContent", function () {
                expect(typeof Module.prototype.require).toBe('function');
            });
        });
    });

    describe("files.resolveFilename method:", function () {
        it("should set module code to module._files[].", function () {
            expect(Module._files['DEFINE_TEST']).toBeUndefined;

            var func = function() { ; };
            Module.define('DEFINE_TEST', func);

            expect(Module._files['DEFINE_TEST']).toBe(func);
        });
    });
});
