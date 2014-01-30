
describe("mockfs:", function () {

    var MockFs = require('./mockfs');

    beforeEach(function () {
        ;
    });

    describe("'mockfs' itself:", function () {
        it("should be constractor.", function () {
            expect(typeof MockFs).toBe('function');
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

        describe("should return true when directory exists:", function () {
            it("case#1: stored path has not trairing slash.", function () {
                var fs = new MockFs({
                        '/project' : { type: 'dir' }
                    });

                expect(fs.existsSync('/project')).toBe(true);
                expect(fs.existsSync('/project/')).toBe(true);
            });
            it("case#2: stored path has trairing slash.", function () {
                var fs = new MockFs({
                        '/project/' : { type: 'dir' }
                    });

                expect(fs.existsSync('/project')).toBe(true);
                expect(fs.existsSync('/project/')).toBe(true);
            });
        });

        it("should return false when file/directory not exists.", function () {
            var fs = new MockFs({
                    '/dummy' : { type: 'file' },
                });

            expect(fs.existsSync('/project')).toBe(false);
            expect(fs.existsSync('/project/')).toBe(false);
        });
    });

    describe("Method Stat:", function () {
        it("should return new Stat object.", function () {
            var fs = new MockFs({
                    '/test' : { type: 'file' }
                });

            var stat = new MockFs(fs, '/test');

            expect(stat.mockfs).toBe(fs);
            expect(stat.filename).toBe('/test');
        });
    });

    describe("Method statSync:", function () {
        it("should return stat object when target exists.", function () {
            var fs = new MockFs({
                    '/test' : { type: 'dir' }
                });

            var stat = fs.statSync('/test');

            expect(stat.mockfs).toBe(fs);
            expect(stat.filename).toBe('/test');
        });

        it("should return null when target not exists.", function () {
            var fs = new MockFs({
                    '/test' : { type: 'dir' }
                });

            var stat = fs.statSync('/NOTEXISTS');

            expect(stat).toBe(null);
        });
    });
});
