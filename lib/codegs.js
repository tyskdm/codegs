
var minimatch = require('minimatch');
var joinPath = (function () {
    var _join = require('path').join;
    return function (base, request) {
        if (request) {
            return _join(base, request).replace(/\\/g, '/');
        }
        return base.replace(/\\/g, '/');
    }
})();

function Codegs(config) {

    this.config = config || {};

    this.files = {
        'core':         {},
        'node_core':    {},
        'node_modules': {},
        'source':       {},
        'main':         null,
        'kernel':       null
    };
    this.ignore = [];
    this.content = '';
}

Codegs.create = function (config) {
    return new Codegs(config);
};


Codegs.prototype.setup = function (mockfs) {
    var fs = mockfs || require('fs');
    var error;

    // this.config = config;
    this.files.main = joinPath(this.config.mainfile);
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

        this.files.kernel = joinPath(this.config.kernel);
        if ( ! fs.existsSync(this.files.kernel)) {
            this.files.kernel = null;
            return 'Error: kernel file is not existent.';
        }
        if ( ! fs.statSync(this.files.kernel).isFile()) {
            this.files.kernel = null;
            return 'Error: kernel file is not valid filetype.';
        }
        this._addIgnorePattern(this.files.kernel);
    }

    return null;
};

Codegs.prototype.addCoreFiles = function (mockfs) {
    var fs = mockfs || require('fs');

    if (typeof this.config.core !== 'string') {
        return 'Error: core file directory is not specified.';
    }

    var coredir = joinPath(this.config.core);
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

    var nodecoredir = joinPath(this.config.node_core);
    var error = this._addFilesToList(this.files.node_core, nodecoredir, 'node_core/', mockfs);
    if (error === null) {
        nodecoredir = nodecoredir.slice(-1) === '/' ? nodecoredir.slice(0, -1) : nodecoredir;
        this._addIgnorePattern(nodecoredir);
    }
    return error;
};

Codegs.prototype.addNodeModules = function (mockfs) {
    var fs = mockfs || require('fs');

    var moduledir = joinPath(this.config.rootdir, './node_modules');
    var error = this._addFilesToList(this.files.node_modules, moduledir, '/node_modules/', mockfs);
    if (error === null) {
        this._addIgnorePattern(moduledir);
    }
    return error;
};

Codegs.prototype.addSourceFiles = function (mockfs) {
    var fs = mockfs || require('fs');

    if (this.config.source.length === 0) {
        this.config.source.push(this.config.rootdir);
    }
    if (typeof this.config.rootdir !== 'string') {
        return 'Error: project directory is not specified.';
    }
    var rootdir = joinPath(this.config.rootdir);

    var i, error, source, storepath;
    for (i = 0; i < this.config.source.length; i++) {

        storepath = source = joinPath(this.config.source[i]);

        if (storepath.slice(0, rootdir.length) !== rootdir) {
            return 'Error: Source directory is outside project root.';
        }
        storepath = storepath === rootdir ? '/' : storepath.slice(rootdir.length);

        error = this._addFilesToList(this.files.source, source, storepath, mockfs);
        if (error === null) {
            source = source.slice(-1) === '/' ? source.slice(0, -1) : source;
            this._addIgnorePattern(source);
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

    content = Codegs._compileFilesList(this.files.node_modules, mockfs);
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

Codegs.prototype.out = function (mockfs) {
    var fs = mockfs || require('fs');

    if (this.config.output) {
        try {
            fs.writeFileSync(this.config.output, this.content);
        } catch(e) {
            return 'Error: ' + e;
        }
        return null;
    }

    return this.content;
};


Codegs._createFilesList = function (config, file, type) {
    var rootdir = joinPath(config.rootdir);
    var rootlength = rootdir.length　- (rootdir.slice(-1) === '/' ? 1 : 0);

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
        //
        //  TODO: Set file path and change '\' to '/'
        //
        content = codegsModule.wrap(content, filesList[file].path, filesList[file].type);
        if (content === null) {
            throw new Error("Error: Invalid filepath '" + filesList[file].path +
                            "'or type '" + filesList[file].type + "'");
        }
        mergedContent += content;
    }
    return mergedContent;
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

Codegs.prototype._addFilesToList = function (list, source, storepath, mockfs) {
    var fs = mockfs || require('fs');

    if (this._isIgnoreFile(source)) {
        return null;
    }

    if ( ! fs.existsSync(source)) {
        //return ("Error: File or Directory not Exists. '" + source + "'");
        return null;
    }

    var stat = fs.statSync(source);

    if (stat.isFile()) {
        // If specific file passed, no file type checking to add.
        if (list[source] === undefined) {
            list[source] = {
                type : source.slice(-5) === '.json' ? 'json' : 'js',
                path : storepath
            }
        }
        return null;
    }
    if (stat.isDirectory()) {
        var files = fs.readdirSync(source);

        var error;
        for (var i = 0; i < files.length; i++) {
            if (this._isIgnoreFile(files[i])) {
                continue;
            }
            stat = fs.statSync(joinPath(source, files[i]));
            if (stat.isFile()) {
                // File types to add are only '.js' and '.json', by default.
                if (! ( ((files[i].length > 3) && (files[i].slice(-3) === '.js')) ||
                        ((files[i].length > 5) && (files[i].slice(-5) === '.json'))) ) {
                    continue;
                }
            }
            error = this._addFilesToList(list,
                                    joinPath(source, files[i]),
                                    joinPath(storepath, files[i]),
                                    mockfs);
            if (error !== null) {
                return error;
            }
        }
        return null;
    }
    return null
}


module.exports = Codegs;
