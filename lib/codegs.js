
var path = require('path');

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
}

Codegs.create = function () {
    return new Codegs();
};


Codegs.prototype.setup = function (config, mockfs) {
    var fs = mockfs || require('fs');

    this.config = config;

    this.files.main = path.join(config.rootdir, config.mainfile);
    if ( ! fs.existsSync(this.files.main)) {
        this.files.main = null;
        return 'Error: main file is not existent.';
    }
    if (fs.statSync(this.files.main).isDirectory()) {
        return Codegs._parsePackageJson(this);
    }
    if ( ! fs.statSync(this.files.main).isFile()) {
        this.files.main = null;
        return 'Error: main file is not valid filetype.';
    }

    this.files.kernel = this.config.kernel;

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

    var coredir = path.join(this.config.rootdir, this.config.core);

    return Codegs._addFilesToList(this.files.core, coredir, 'core/', mockfs);
};

Codegs.prototype.addNodeCoreFiles = function (mockfs) {
    var fs = mockfs || require('fs');

    if (typeof this.config.node_core !== 'string') {
        return 'Error: node_core file directory is not specified.';
    }
    if (typeof this.config.rootdir !== 'string') {
        return 'Error: project directory is not specified.';
    }

    var nodecoredir = path.join(this.config.rootdir, this.config.node_core);

    return Codegs._addFilesToList(this.files.node_core, nodecoredir, 'node_core/', mockfs);
};

Codegs.prototype.addNodeModules = function (mockfs) {
    var fs = mockfs || require('fs');

    if (typeof this.config.rootdir !== 'string') {
        return 'Error: project directory is not specified.';
    }

    var moduledir = path.join(this.config.rootdir, './node_modules');

    return Codegs._addFilesToList(this.files.node_modules, moduledir, '/node_modules/', mockfs);
};

Codegs.prototype.addSourceFiles = function (mockfs) {
    var fs = mockfs || require('fs');

    if (this.config.source.length === 0) {
        this.config.source.push('./');
    }
    if (typeof this.config.rootdir !== 'string') {
        return 'Error: project directory is not specified.';
    }

    var i, error, sourcedir;
    for (i = 0; i < this.config.source.length; i++) {
        sourcedir = path.join(this.config.rootdir, this.config.source[i]);
        storedir = path.join('/', this.config.source[i]);
        error = Codegs._addFilesToList(this.files.source, sourcedir, storedir, mockfs);

        if (error !== null) break;
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

    var mainfileList = Codegs._createCompileList(this.config, this.files.main, 'main');
    content = Codegs._compileFilesList(mainfileList, mockfs);
    this.content += content;

    if (this.files.kernel) {
        var corefileList = {};
        corefileList[this.files.kernel] = { type: 'core', path: '' };
        content = Codegs._compileFilesList(corefileList, mockfs);
    } else {
        content = fs.readFileSync(require.resolve('./module.js'));
    }
    this.content += content;

    return null;
};

Codegs._createCompileList = function (config, file, type) {
    var rootlength = config.rootdir.length
                   - config.rootdir.slice(-1) === '/' ? 1 : 0;

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


Codegs._addFilesToList = function (list, dir, basepath, mockfs) {
    var fs = mockfs || require('fs');

    if ( ! fs.existsSync(dir)) return null;

    var i, filename, stat, error;
    var files = fs.readdirSync(dir);

    for (i = 0; i < files.length; i++) {
        filename = path.join(dir, files[i]);
        stat = fs.statSync(filename);

        if (stat.isDirectory()) {
            error = Codegs._addFilesToList(list, filename, path.join(basepath, files[i]), mockfs);
            if (error !== null) {
                return error;
            }
            continue;
        }

        if (stat.isFile() && (list[filename] === undefined)) {
            list[filename] = {
                type : filename.slice(-5) === '.json' ? 'json' : 'js',
                path : path.join(basepath, files[i])
            }
        }
    }

    return null
}


module.exports = Codegs;
