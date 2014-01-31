

function MockFs(files) {
    this.storage = files;
}

MockFs.prototype.existsSync = function (filename) {
    return this._findFilename(filename) !== null;
};

MockFs.prototype.statSync = function (filename) {
    if ( !this.existsSync(filename)) {
        return null;
    }
    return new MockFs.Stat(this, filename);
};

MockFs.Stat = function (mockfs, filename) {
    this.mockfs = mockfs;
    this.filename = mockfs._findFilename(filename);
};

MockFs.Stat.prototype.isDirectory = function () {
    return (this.mockfs.storage[this.filename].type === 'dir');
};

MockFs.Stat.prototype.isFile = function () {
    return (this.mockfs.storage[this.filename].type === 'file');
};



MockFs.prototype._findFilename = function (filename) {

    if (this.storage[filename] !== undefined) return filename;

    if (filename.slice(-1) !== '/') {
        return (this.storage[filename + '/'] !== undefined) ? filename + '/' : null;
    }

    var withoutslash = filename.slice(0, -1);
    if (this.storage[withoutslash] !== undefined) {
        return this.storage[withoutslash].type === 'dir' ? withoutslash : null;
    }

    return null;
};


MockFs.prototype.readdirSync = function (path) {
    var filelist = [];
    var templist = {};
    var idx, filename = '';
    var p = path;

    if (p.slice(-1) !== '/') {
        p += '/';
    }
    var pl = p.length;

    for (filename in this.storage) {
        if (filename.substr(0, pl) === p) {
            filename = filename.slice(pl);
            idx = filename.indexOf('/');
            if (idx >= 0) {
                filename = filename.substring(0, idx);
            }
            templist[filename] = true;
        }
    }

    for (filename in templist) {
        if (filename !== '') {
            filelist.push(filename);
        }
    }

    if ((filelist.length === 0) && ( ! this.existsSync(p))) {
        throw new Error("Error: ENOENT, no such file or directory '" + path + "'");
    }

    return filelist;
};


module.exports = MockFs;
