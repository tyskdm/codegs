
// var nodegs = require('../../lib/nodegs/nodegs.js');

xdescribe("NodeGS:", function () {
    describe("'nodeGS module' itself:", function () {
        it("should be Object not function.", function () {
            expect(typeof nodegs).toEqual("object");
            expect(nodegs instanceof Function).toBe(false);
        });

        it("has 4 methods.", function () {
            expect(nodegs.define instanceof Function).toBe(true);
            expect(nodegs.require instanceof Function).toBe(true);
            expect(nodegs.inject instanceof Function).toBe(true);
            expect(nodegs.config instanceof Function).toBe(true);
        });
    });

    xdescribe("nodeGS.define method:", function () {
        it("should set constructor function with module name.", function () {
            expect(nodegs.define('nodeGS')).toBe(nodegs);
        });
    });

    describe("nodeGS.require method:", function () {
        it("should return nodeGS itself when called with argument = 'nodeGS'", function () {
            expect(nodegs.require('nodeGS')).toBe(nodegs);
        });
        it("should throw 'Cannot find module 'nomodule'' when module is not find.", function () {
            function test() {
                return nodegs.require('nonExistentModuleName');
            }
            expect(test).toThrow("Cannot find module 'nonExistentModuleName'");
        });
    });
});
