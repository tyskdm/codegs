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
                type:           'file',
                description:    "Codegs kernel module file. (default is 'module.js')",
                example:        "'code --kernel=file' or 'code -k file'"
            },
        ])
        .run();

    //console.log(argv);
    //process.exit();

    if (argv.targets.length > 1) {
        console.error('Error: too many main files.');
        process.exit(1);
    }

    var config = {
        rootdir:    process.cwd(),
        mainfile:   argv.targets.length === 0 ? './' : argv.targets[0],

        source:     argv.source     || [],
        output:     argv.output     || null,
        core:       argv.core       || './core',
        nodecore:   argv.nodecore   || './node_core',
        kernel:     argv.kernel     || null
    };

    //console.log(config);
    //process.exit();

    var codegs = require('./codegs');
    var error;

    var code = codegs.create();

    error = code.setup(config);
    _check(error);

    error = code.addSourceFiles();
    _check(error);

    error = code.removeIgnoreFiles();
    _check(error);

    error = code.comlile();
    _check(error);

    error = code.out();
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
