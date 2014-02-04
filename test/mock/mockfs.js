

function MockFs(files) {
    this.storage = files;
}

MockFs.prototype.existsSync = function (filename) {
    if (this._findFilename(filename) !== null) return true;

    filename += (filename.slice(-1) === '/') ? '' : '/';
    var filepath, pl = filename.length;

    for (filepath in this.storage) {
        if (filepath.substr(0, pl) === filename) {
            this.storage[filename] =  { type: 'dir' };
            return true;
        }
    }

    return false;
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


MockFs.prototype.readFileSync = function (filename, options) {
    options = options || { encoding: null };

    if (options.encoding !== 'utf8') {
        // Actually, Node.js returns Buffer when encoding === null.
        throw new Error("Error: Unknown encoding: " + options.encoding);
    }

    if ( ! this.existsSync(filename)) {
        throw new Error("Error: ENOENT, no such file or directory '" + filename + "'");
    }

    var file = this._findFilename(filename);
    if (this.storage[file].type !== 'file') {
        throw new Error("Error: EISDIR, illegal operation on a directory");
    }

    return this.storage[file].content;
}

module.exports = MockFs;
