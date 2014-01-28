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

var files = {
    'js':     [],
    'json':   [],
    'main':   '',
    'kernel': ''
};

function setup(config, mockfs) {
    var fs = mockfs || require('fs');

    var mainfile = path.join(config.rootdir, config.mainfile);

    if ( ! fs.existsSync(mainfile)) {
        return 'Error: main file is not existent.';
    }

    if (fs.statSync(mainfile).isDirectory()) {
        mainfile = path.join(mainfile, './package.json');
        if ( ! fs.existsSync(mainfile)) {
            return 'Error: main file is not found.';
        }
    }

    if ( ! fs.statSync(mainfile).isFile()) {
        return 'Error: main file is not valid filetype.';
    }

    if (mainfile.slice(-13) === '/package.json') {
        var error = _parsePackageJson(config);
        if (error !== null) {
            return error;
        }
    }

    return null;
}

function addSourceFiles(config, mockfs) {
    var fs = mockfs || require('fs');
    return null;
}

function removeIgnoreFiles(config, mockfs) {
    var fs = mockfs || require('fs');
    return null;
}

function outMergedScript(config, mockfs) {
    var fs = mockfs || require('fs');
    return null;
}

function _parsePackageJson(config, mockfs) {
    var fs = mockfs || require('fs');
    return 'Error: can not parse package.json yet.';
}

module.exports = {
    setup: setup,
    addSourceFiles: addSourceFiles,
    removeIgnoreFiles: removeIgnoreFiles,
    outMergedScript: outMergedScript,
    _parsePackageJson: _parsePackageJson,
    _files: files
};


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
