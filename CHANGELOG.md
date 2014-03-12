### v0.0.9:
date: 2014-03-12
changes:
    - codegs: Add config option that specify which node_modules should be packed.
    - codegs: Add checking source file option if it's empty or not specified.
    - codegs: Add ignorePattern handling methods.
    - codegs: Add method loadPackageJson that load values from package.json and .npmignore.
    - cli: Be able to handle MAINFILE option that is main .js file or package.json or project directory.

### v0.0.8:
date: 2014-02-28
changes:
    - After startup and Before calling runmain, 'require' method assumes that self filename is '/.'.
    - Add 'codegs-core' module to npm as another package. That includes some code　core modules for GAS, and some Node.js core modules.(No change in this package)

### v0.0.6:
date: 2014-02-10
changes:
    - Work with windows('\' file path delimiter).
    - Merge Only .js / .json file into output code by default.
    - Add a example 01-Simple
