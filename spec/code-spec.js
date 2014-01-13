
var nodeGS = require('../lib/code');

describe("codegs:", function () {
    describe("'codegs module' itself:", function () {
        it("should be function.", function () {
            expect(typeof nodeGS).toEqual("object");
            expect(nodeGS instanceof Function).toBe(false);
        });

        it("has 4 methods.", function () {
            expect(nodeGS.define instanceof Function).toBe(true);
            expect(nodeGS.require instanceof Function).toBe(true);
            expect(nodeGS.inject instanceof Function).toBe(true);
            expect(nodeGS.config instanceof Function).toBe(true);
        });
    });

    xdescribe("nodeGS.define method:", function () {
        it("should set constructor function with module name.", function () {
            expect(nodeGS.define('nodeGS')).toBe(nodeGS);
        });
    });

    describe("nodeGS.require method:", function () {
        it("should return nodeGS itself when called with argument = 'nodeGS'", function () {
            expect(nodeGS.require('nodeGS')).toBe(nodeGS);
        });
        it("should throw 'Cannot find module 'nomodule'' when module is not find.", function () {
            function test() {
                return nodeGS.require('nonExistentModuleName');
            }
            expect(test).toThrow("Cannot find module 'nonExistentModuleName'");
        });
    });
});
