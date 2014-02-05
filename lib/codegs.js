
var minimatch = require('minimatch');
var joinPath = require('path').join;
//var joinPath = require('./module.js')._joinPath;

function Codegs() {
    this.files = {
        'core':         {},
        'node_core':    {},
        'node_modules': {},
        'source':       {},
        'main':         null,
        'kernel':       null
    };

    this.config = null;
    this.content = '';
    this.ignore = [];
}

Codegs.create = function () {
    return new Codegs();
};


Codegs.prototype.setup = function (config, mockfs) {
    var fs = mockfs || require('fs');
    var error;

    this.config = config;

    this.files.main = config.mainfile;
    if ( ! fs.existsSync(this.files.main)) {
        this.files.main = null;
        return 'Error: main file is not existent.';
    }
    if (fs.statSync(this.files.main).isDirectory()) {
        error = Codegs._parsePackageJson(this);
        if (error !== null) {
            return error;
        }
    } else if ( ! fs.statSync(this.files.main).isFile()) {
        this.files.main = null;
        return 'Error: main file is not valid filetype.';
    }
    this._addIgnorePattern(this.files.main);

    if (this.config.kernel) {     // !== null && !== undefined

        this.files.kernel = this.config.kernel;
        if ( ! fs.existsSync(this.files.kernel)) {
            this.files.kernel = null;
            return 'Error: kernel file is not existent.';
        }
        if ( ! fs.statSync(this.files.kernel).isFile()) {
            this.files.kernel = null;
            return 'Error: kernel file is not valid filetype.';
        }
    }

    return null;
};

Codegs.prototype.addCoreFiles = function (mockfs) {
    var fs = mockfs || require('fs');

    if (typeof this.config.core !== 'string') {
        return 'Error: core file directory is not specified.';
    }
    if (typeof this.config.rootdir !== 'string') {
        return 'Error: project directory is not specified.';
    }

    var coredir = this.config.core;
    var error = this._addFilesToList(this.files.core, coredir, 'core/', mockfs);
    if (error === null) {
        coredir = coredir.slice(-1) === '/' ? coredir.slice(0, -1) : coredir;
        this._addIgnorePattern(coredir);
    }
    return error;
};

Codegs.prototype.addNodeCoreFiles = function (mockfs) {
    var fs = mockfs || require('fs');

    if (typeof this.config.node_core !== 'string') {
        return 'Error: node_core file directory is not specified.';
    }
    if (typeof this.config.rootdir !== 'string') {
        return 'Error: project directory is not specified.';
    }

    var nodecoredir = this.config.node_core;
    var error = this._addFilesToList(this.files.node_core, nodecoredir, 'node_core/', mockfs);
    if (error === null) {
        nodecoredir = nodecoredir.slice(-1) === '/' ? nodecoredir.slice(0, -1) : nodecoredir;
        this._addIgnorePattern(nodecoredir);
    }
    return error;
};

Codegs.prototype.addNodeModules = function (mockfs) {
    var fs = mockfs || require('fs');

    if (typeof this.config.rootdir !== 'string') {
        return 'Error: project directory is not specified.';
    }

    var moduledir = joinPath(this.config.rootdir, './node_modules');
    var error = this._addFilesToList(this.files.node_modules, moduledir, '/node_modules/', mockfs);
    if (error === null) {
        moduledir = moduledir.slice(-1) === '/' ? moduledir.slice(0, -1) : moduledir;
        this._addIgnorePattern(moduledir);
    }
    return error;
};

// TODO: Source list is directory or file.check it.
Codegs.prototype.addSourceFiles = function (mockfs) {
    var fs = mockfs || require('fs');

    if (this.config.source.length === 0) {
        this.config.source.push(this.config.rootdir);
    }
    if (typeof this.config.rootdir !== 'string') {
        return 'Error: project directory is not specified.';
    }
    var rootdir = this.config.rootdir;

    var i, error, sourcedir, storedir;
    for (i = 0; i < this.config.source.length; i++) {

        sourcedir = this.config.source[i];

        storedir = this.config.source[i];
        if (storedir.slice(0, rootdir.length) !== rootdir) {
            return 'Error: Source directory is outside project root.';
        }
        storedir = storedir === rootdir ? '/' : storedir.slice(rootdir.length);

        error = this._addFilesToList(this.files.source, sourcedir, storedir, mockfs);
        if (error === null) {
            sourcedir = sourcedir.slice(-1) === '/' ? sourcedir.slice(0, -1) : sourcedir;
            this._addIgnorePattern(sourcedir);
        } else {
            break;
        }
    }
    return error;
};

Codegs.prototype.compile = function (mockfs) {
    var fs = mockfs || require('fs');

    this.content = '';
    var content = '';

    content = Codegs._compileFilesList(this.files.core, mockfs);
    this.content += content;

    content = Codegs._compileFilesList(this.files.node_core, mockfs);
    this.content += content;

    content = Codegs._compileFilesList(this.files.source, mockfs);
    this.content += content;

    var mainfileList = Codegs._createFilesList(this.config, this.files.main, 'main');
    content = Codegs._compileFilesList(mainfileList, mockfs);
    this.content += content;

    if (this.files.kernel) {
        var corefileList = {};
        corefileList[this.files.kernel] = { type: 'core', path: '' };
        content = Codegs._compileFilesList(corefileList, mockfs);
    } else {
        // kernel === null, then should not wrap. just read and append.
        content = fs.readFileSync(require.resolve('./module.js'));
    }
    this.content += content;

    return null;
};

Codegs._createFilesList = function (config, file, type) {
    var rootlength = config.rootdir.length　- (config.rootdir.slice(-1) === '/' ? 1 : 0);

    var mainpath = file.slice(rootlength);
    var fileList = {};

    fileList[file] = { type: type, path: mainpath};

    return fileList;
};

Codegs._compileFilesList = function (filesList, mockfs) {
    var fs = mockfs || require('fs');
    var codegsModule = require('./module');

    var file, content, err, mergedContent = '';

    for (file in filesList) {
        content = fs.readFileSync(file, {encoding: 'utf8'});
        content = codegsModule.wrap(content, filesList[file].path, filesList[file].type);
        if (content === null) {
            throw new Error("Error: Invalid filepath '" + filesList[file].path +
                            "'or type '" + filesList[file].type + "'");
        }
        mergedContent += content;
    }
    return mergedContent;
};



Codegs.prototype.out = function (mockfs) {
    var fs = mockfs || require('fs');

    return this.content;
};

Codegs._parsePackageJson = function (codegs, mockfs) {
    var fs = mockfs || require('fs');

    codegs.files.main = null;
    return 'Error: main file is not found.';
}

Codegs.prototype._addIgnorePattern = function (pattern) {
    this.ignore.push(pattern);
};

Codegs.prototype._isIgnoreFile = function (file) {
    for (var i = 0; i < this.ignore.length; i++) {
        if (minimatch(file, this.ignore[i])) {
            return true;
        }
    }
    return false;
};

Codegs.prototype._addFilesToList = function (list, dir, basepath, mockfs) {
    var fs = mockfs || require('fs');

    if ( ! fs.existsSync(dir)) return null;

    var i, filename, stat, error;
    var files = fs.readdirSync(dir);

    for (i = 0; i < files.length; i++) {
        filename = joinPath(dir, files[i]);

        if (this._isIgnoreFile(files[i]) || this._isIgnoreFile(filename)) {
            continue;
        }

        stat = fs.statSync(filename);
        if (stat.isDirectory()) {
            error = this._addFilesToList(list, filename, joinPath(basepath, files[i]), mockfs);
            if (error !== null) {
                return error;
            }
            continue;
        }

        if (stat.isFile() && (list[filename] === undefined)) {
            list[filename] = {
                type : filename.slice(-5) === '.json' ? 'json' : 'js',
                path : joinPath(basepath, files[i])
            }
        }
    }

    return null
}


module.exports = Codegs;
