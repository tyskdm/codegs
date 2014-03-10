module.exports = function () {

    var packageinfo = require('../package.json'),
        version = packageinfo.version || '0.0.0';

    var argv = require('argv')
        .version(version)
        .info("Usage: code FILE [options]\n\n" +
              "FILE:  main '.js' file.\n\n" +
              "Options:")
        .option([
            {   name:           'source',
                short:          's',
                type:           'csv,path',
                description:    'Source files or directories to merge.',
                example:        "'code --source=file1,file2,..' or 'code -s file1 -s file2..'"
            },
            {   name:           'output',
                short:          'o',
                type:           'path',
                description:    'Output file',
                example:        "'code --outout=file' or 'code -o file'"
            },
            {   name:           'core',
                short:          'c',
                type:           'path',
                description:    "'Directry of core modules. (default is './core')",
                example:        "'code --core=path' or 'code -c path'"
            },
            {   name:           'nodecore',
                short:          'n',
                type:           'path',
                description:    "'Directry of Node.js core modules. (default is './node_core')",
                example:        "'code --nodecore=path' or 'code -n path'"
            },
            {   name:           'kernel',
                short:          'k',
                type:           'path',
                description:    "Codegs kernel module file. (default is 'module.js')",
                example:        "'code --kernel=file' or 'code -k file'"
            },
        ])
        .run();

    if (argv.targets.length > 1) {
        console.error('Error: too many main files.');
        process.exit(1);
    }

    var path = require('path');
    var cwd = process.cwd();
    var mainfile = argv.targets.length === 0 ? cwd : path.join(cwd, argv.targets[0]);

    // all options should be fully resolved path.
    // and be possibly using platform path delimiter('\').
    var config = {
        rootdir:    cwd,
        mainfile:   mainfile,

        source:     argv.options.source     || null,
        output:     argv.options.output     || null,
        core:       argv.options.core       || null,
        node_core:  argv.options.nodecore   || null,
        kernel:     argv.options.kernel     || null
    };


    var codegs = require('./codegs');
    var code = codegs.create();
    var error;

    // Check mainfile. It's .js file or points package.json to configure.
    // switch (config.mainfile) {

    // case  'directory'
        // search config.mainfile + package.json
        // set package.json, .npmignore, cwd.

    // case  'package.json'
        // set package.json, .npmignore, cwd.

    // default
        // search config.rootdir + package.json
        // set package.json, .npmignore, cwd.

    // }


    error = code.addConfig(config);
    _check(error);

    error = code.run();
    _check(error);

    process.exit(0);
};

function _check(error) {
    if (error !== null) {
        if (error.substr(0, 6) === 'Error:') {
            console.error(error);
            console.log('');
            process.exit(1);
        } else {
            console.log(error);
        }
    }
}


if (module.parent === null) {
    module.exports();
}
