#! /usr/bin/env node

exports.version = '0.1.0';

var opts = require('opts');
opts.parse([
    { short       : 'v'
    , long        : 'version'
    , description : 'Show version'
    , callback    : function () { console.log(exports.version); process.exit(1); }
    },
    { short       : 's'
    , long        : 'sourcedir'
    , description : 'Source directory name'
    , value       : true
    },
    { short       : 'm'
    , long        : 'mainfile'
    , description : 'main file name'
    , value       : true
    },
    { short       : 'o'
    , long        : 'outdir'
    , description : 'Output dir name'
    , value       : true
    },
    { short       : 'f'
    , long        : 'outfile'
    , description : 'Output file name'
    , value       : true
    }
], true);

// get command line options
var sourcedir = opts.get('sourcedir') || process.cwd(); // default current directory
var mainfile  = opts.get('mainfile')  || null;
var outdir    = opts.get('outdir')    || process.cwd(); // default current directory
var outfile   = opts.get('outfile')   || 'Code.gs';


// ===============================
// Prepaire to process
// ===============================

var fs = require('fs');

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

var code = require('./code.js');
var codeContent = '';

codeContent += jsonobj && jsonobj.name ? '// ' + jsonobj.name + '\n' : '';
codeContent += jsonobj && jsonobj.version ? '// ' + jsonobj.version + '\n' : '';


// setup codeContent part#1 : code.wrap(sourcefiles);

for (var i in sourcefiles) {
    codeContent += '// ' + sourcefiles[i] + '\n';
    codeContent += code.wrap(
            fs.readFileSync(sourcedir + '/' + sourcefiles[i], { encode: 'utf8' }),
            './' + sourcefiles
        );
}

// setup codeContent part#2 : code.setMain(mainfile);
if (mainfile) {
    codeContent += '// ' + mainfile + '\n';
    codeContent += code.wrap(
            fs.readFileSync(sourcedir + '/' + mainfile, { encode: 'utf8' }),
            './' + mainfile, true
        );
}

// setup codeContent part#3 : code.js itself
var codejs = require.resolve('./code.js');
if (codejs) {
    codeContent += '// code.js system code.\n';
    codeContent += fs.readFileSync(codejs, { encode: 'utf8' });
} else {
    console.error('linkfile[code.js] is not found.');
    process.exit(1);
}

// write codeContent into outfile

console.log(codeContent);

// exit(0)
process.exit(0);
