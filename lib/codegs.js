/*
    var config = {
        rootdir:    process.cwd(),

        mainfile:   argv.targets.length === 0 ? './package.json' :
                    argv.targets.length === 1 ? argv.targets[0] : null,

        source:     argv.source     || [process.cwd()], // default current directory
        output:     argv.output     || null,
        core:       argv.core       || './core',
        nodecore:   argv.nodecore   || './node_core'
    };
*/

var path = require('path');

function Codegs() {
    this.files = {
        'core':         {},
        'node_core':    {},
        'node_modules': {},
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
    return null;
};

Codegs.prototype.compile = function (mockfs) {
    var fs = mockfs || require('fs');
    return null;
};

Codegs.prototype.out = function (mockfs) {
    var fs = mockfs || require('fs');
    return null;
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



(function () {
    if (config.mainfile === null) {

    }

    // Check if 'sourcedir' is dir?
    if ( ! fs.statSync(sourcedir).isDirectory()) {
        console.error('sourcedir[' + sourcedir + '] is not directory.');
        process.exit(1);
    }

    // get package.json into object.
    var jsonfile = sourcedir + '/package.json';
    var jsonobj = null;

    if (fs.existsSync(jsonfile)) {
        // if (package.json) - try to get mainfile
        jsonfile = fs.readFileSync(jsonfile, { encode: 'utf8' });
        jsonobj = JSON.parse(jsonfile);
    }

    // set full-path to mainfile
    if ( ! mainfile) {
        mainfile = jsonobj && jsonobj.main ? jsonobj.main : null;
    }

    // check if 'mainfile' is exist?
    if (mainfile) {
        if ( ! fs.existsSync(sourcedir + '/' + mainfile)) {
            console.error('mainfile[' + mainfile + '] is not exists.');
            process.exit(1);
        }
    }

    // Check if 'outdir' is dir?
    if ( ! fs.statSync(outdir).isDirectory()) {
        console.error('outdir[' + outdir + '] is not directory.');
        process.exit(1);
    }
    outfile = outdir + outfile;

    // get sourcefiles
    var files = fs.readdirSync(sourcedir);
    var sourcefiles = [];

    for (var i in files) {
        if (files[i].substring(files[i].length-3) !== '.js') {
            continue;
        }
        if (files[i] !== mainfile) {
            sourcefiles.push(files[i]);
        }
    }



    // =========================================
    // here, files list and options are fix.
    // after here, just do it.
    // =========================================

    var module = require('./module.js');
    var codeContent = '';

    codeContent += jsonobj && jsonobj.name ?    '// #Codegs.project: ' + jsonobj.name + '\n' : '';
    codeContent += jsonobj && jsonobj.version ? '// #Codegs.version: ' + jsonobj.version + '\n' : '';


    // setup codeContent part#1 : module.wrap(sourcefiles);

    sourcefiles.forEach (function (value, i) {
        codeContent += '// #Codegs.module[' + i + ']: ' + value + '\n';
        codeContent += module.wrap(
                fs.readFileSync(sourcedir + '/' + value, { encode: 'utf8' }),
                './' + value
            );
    });

    // setup codeContent part#2 : module.setMain(mainfile);
    if (mainfile) {
        codeContent += '// #Codegs.module[main]: ' + mainfile + '\n';
        codeContent += module.wrap(
                fs.readFileSync(sourcedir + '/' + mainfile, { encode: 'utf8' }),
                './' + mainfile, true
            );
    }

    // setup codeContent part#3 : module.js itself
    var modulejs = require.resolve('./module.js');
    if (modulejs) {
        codeContent += '// #Codegs.system:\n';
        codeContent += fs.readFileSync(modulejs, { encode: 'utf8' });
    } else {
        console.error('linkfile[code.js] is not found.');
        process.exit(1);
    }

    // write codeContent into outfile

    console.log(codeContent);

});
