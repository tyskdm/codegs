

function MockFs(files) {
    this.storage = files;
}

MockFs.prototype.existsSync = function (filename) {
    return (this.storage[filename] !== undefined) ? true : false;
};

MockFs.prototype.statSync = function (filename) {
    if ( !this.existsSync(filename)) {
        return null;
    }
    return new MockFs.Stat(this, filename);
};

MockFs.Stat = function (mockfs, filename) {
    this.mockfs = mockfs;
    this.filename = filename;
};

MockFs.Stat.prototype.isDirectory = function () {
    return (this.storage[this.filename].type === 'dir');
};

MockFs.Stat.prototype.isFile = function () {
    return (this.storage[this.filename].type === 'file');
};


module.exports = MockFs;
