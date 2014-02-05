
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
            it("case#1: stored path has not trailing slash.", function () {
                var fs = new MockFs({
                        '/project' : { type: 'dir' }
                    });

                expect(fs.existsSync('/project')).toBe(true);
                expect(fs.existsSync('/project/')).toBe(true);
            });
            it("case#2: stored path has trailing slash.", function () {
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

            var stat = new MockFs.Stat(fs, '/test');

            expect(stat.mockfs).toBe(fs);
            expect(stat.filename).toBe('/test');
        });

        it("should keep same filename that stored in strage.", function () {
            var fs = new MockFs({
                    '/test1/' : { type: 'dir' },
                    '/test2'  : { type: 'dir' }
                });

            expect(new MockFs.Stat(fs, '/test1' ).filename).toBe('/test1/');
            expect(new MockFs.Stat(fs, '/test1/').filename).toBe('/test1/');

            expect(new MockFs.Stat(fs, '/test2' ).filename).toBe('/test2');
            expect(new MockFs.Stat(fs, '/test2/').filename).toBe('/test2');
        });
    });

    describe("Method statSync:", function () {
        it("should return stat object when target exists.", function () {
            var fs = new MockFs({
                    '/test' : { type: 'dir' }
                });

            expect(fs.statSync('/test')).not.toBe(null);
            expect(fs.statSync('/test/')).not.toBe(null);
        });

        it("should return stat when directory exists by specifing file in taht.", function () {
            var fs = new MockFs({
                    '/test/foo.bar' : { type: 'file' }
                });

            expect(fs.statSync('/test')).not.toBe(null);
            expect(fs.statSync('/test/')).not.toBe(null);
        });

        it("should return null when target not exists.", function () {
            var fs = new MockFs({
                    '/test' : { type: 'dir' }
                });

            expect(fs.statSync('/NOTEXISTS')).toBe(null);
        });
    });

    describe("Class Stat:", function () {
        describe("Method isDirectory:", function () {
            it("should return if it's directory or not.", function () {
                var fs = new MockFs({
                        '/test1' : { type: 'dir'  },
                        '/test2' : { type: 'file' }
                    });

                expect(fs.statSync('/test1').isDirectory()).toBe(true);
                expect(fs.statSync('/test2').isDirectory()).toBe(false);
            });

            it("should return if it's file or not.", function () {
                var fs = new MockFs({
                        '/test1' : { type: 'dir'  },
                        '/test2' : { type: 'file' }
                    });

                expect(fs.statSync('/test1').isFile()).toBe(false);
                expect(fs.statSync('/test2').isFile()).toBe(true);
            });
        });
    });

    describe("Method readdirSync(path):", function () {
        it("should return list of files in directory pointed by path.", function () {
            var fs = new MockFs({
                    '/project/a'   : { type: 'file' },
                    '/project/b'   : { type: 'dir'  },
                    '/project/c/'  : { type: 'dir'  },
                    '/project/c/d' : { type: 'file' },
                    '/pro/e'       : { type: 'file' },
                }),
                result = [ 'a', 'b', 'c' ];

            var list = fs.readdirSync('/project');
            expect(list.length).toEqual(result.length);

            for (var i = 0; i < list.length; i++) {
                expect(list).toContain(result[i]);
                expect(result).toContain(list[i]);
            }

            list = fs.readdirSync('/project/');
            expect(list.length).toEqual(result.length);

            for (var i = 0; i < list.length; i++) {
                expect(list).toContain(result[i]);
                expect(result).toContain(list[i]);
            }
        });

        it("should return empty list if path is empty directory.", function () {
            var fs = new MockFs({
                    '/project/'    : { type: 'dir' },
                }),
                result = [ ];

            var list = fs.readdirSync('/project');
            expect(list.length).toEqual(result.length);

            for (var i = 0; i < list.length; i++) {
                expect(list).toContain(result[i]);
                expect(result).toContain(list[i]);
            }
            list = fs.readdirSync('/project/');
            expect(list.length).toEqual(result.length);

            for (var i = 0; i < list.length; i++) {
                expect(list).toContain(result[i]);
                expect(result).toContain(list[i]);
            }
        });

        it("should to throw when path is not existent.", function () {
            var fs = new MockFs({
                });

            expect(function () {
                fs.readdirSync('/project');
            }).toThrow("Error: ENOENT, no such file or directory '/project'");

            expect(function () {
                fs.readdirSync('/project/');
            }).toThrow("Error: ENOENT, no such file or directory '/project/'");
        });
    });

    describe("Method readFileSync(filename,[options]):", function () {
        it("should return content of file.", function () {
            var fs = new MockFs({
                    '/project/a'   : { type: 'file', content: 'A' },
                });

            var content = fs.readFileSync('/project/a', {encoding: 'utf8'});
            expect(content).toEqual('A');
        });

        it("should throw if file not exists.", function () {
            var fs = new MockFs({
                });

            expect(function () {
                fs.readFileSync('/project/a', {encoding: 'utf8'});
            }).toThrow("Error: ENOENT, no such file or directory '/project/a'");
        });

        it("should throw if filename is directory.", function () {
            var fs = new MockFs({
                    '/project/a'   : { type: 'dir' },
                });

            expect(function () {
                fs.readFileSync('/project/a', {encoding: 'utf8'});
            }).toThrow("Error: EISDIR, illegal operation on a directory");
        });

        //
        it("should throw if option.encoding is invalid.", function () {
            var fs = new MockFs({
                    '/project/a'   : { type: 'file', content: 'A' },
                });

            expect(function () {
                fs.readFileSync('/project/a', {encoding: 'INVALID'});
            }).toThrow("Error: Unknown encoding: INVALID");
        });
    });

});
