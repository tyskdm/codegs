
describe("mockfs:", function () {

    var MockFs = require('./mockfs');

    beforeEach(function () {
        ;
    });

    describe("'mockfs' itself:", function () {
        it("should be constractor.", function () {
            expect(typeof mockfs).toBe('function');
        });
    });

    describe("Method existsSync:", function () {
        it("should return true when file exists.", function () {
            var fs = new MockFs({
                    '/project/package.json' : { type: 'file' }
                });

            expect(fs.existsSync('/project/package.json')).toBe(true);
            expect(fs.existsSync('/project/package.json/')).toBe(false);
        });

        it("should return true when directory exists.", function () {
            var fs = new MockFs({
                    '/project' : { type: 'dir' }
                });

            expect(fs.existsSync('/project')).toBe(true);
            expect(fs.existsSync('/project/')).toBe(true);
        });

        it("should return false when file/directory not exists.", function () {
            var fs = new MockFs({
                    '/dummy' : { type: 'file' },
                });

            expect(fs.existsSync('/project')).toBe(false);
            expect(fs.existsSync('/project/')).toBe(false);
        });
    });
});
