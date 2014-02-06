# Code.gs

A tool to pack Node.js module files and module system emulator within one source file.
That source file can run on [Google Apps Script](https://developers.google.com/apps-script/) environment or perhaps other Javascript engines.

### Status
* Basic functionality working.
* Now still coding and debugging.

## First example

I think looking this simple example is the easiest way to understand what happens by this tool.

main.js

```javascript
var lib = require('./lib.js');
console.log('3 + 4 = ' + lib.sum(3, 4));
```

lib.js

```javascript
module.exports.sum = function (a, b) {
    return a + b;
};
```

those are valid Node.js modules.
So you can run:

```shell
$ node main.js
7
```

Then, try:

```shell
$ code main.js
```

and you see merged source code:

```shell
$ code main.js
// lib.js
// line: 3
require('module').define('/main.js',
function() {
module.exports.sum = function (a, b) {
    return a + b;
};
});
// main.js
// line: 2
require('module').runmain('/main.js');
var lib = require('./lib);
console.log('3 + 4 = ' + lib.sum(3, 4));
require('module').endmain('/main.js');
// module.js
// line: 336
function require(path) {
    require = (function () {
            :
```

That includes main.js lib.js, and it's executable.

```shell
$ code main.js > out.js
$ node out.js
7
```

That's how Code.gs works.


## Why?

I like [Google apps script](https://developers.google.com/apps-script/)(Server side javascript with online IDE for google apps), but not only, and also Jasmine - TDD/BDD.
I tried to run jasmine on GAS. It works, but it's too far from TDD.

After that I want to develop GAS software on my local pc, and I want local IDE/tools to support development.

I need IDE/tools to:
* Assist TDD/BDD(Jasmine etc.)
* Support some module system.(ex. autocomplete methods/properties in other module)

For this, instead of preparing special rich IDE/tools for GAS, I decided to write one small tool to make Node.js module files   be executable on GAS.


**note**<br/>
Full Compatibility with Node.js is not my goal. Actually, this version provides minimum compatibility with Node.js module system. for more details, see Limitation.


## Usage

**install**
```shell
$ npm install -g codegs
```

**usage**
```shell
$ code mainfile [ options ]
```

Code.gs needs some information to work.


### Minimum info to work
* Main module
* Project directory
* Source files
* Output file


#### Main module

[Current version] specify in command line.<br/>
[Futher version] command line or `package.json`.

Javascript VM load and run this file first. and against GAS specification, this module will be put in global scope.
It should be relative to the root of project directory.

**memo**<br/>
GAS entry functions should be defined in global scope with `function` statement.<br/>
`function onOpen() {}`, `function doGet() {}`, or `function YOURENTRYFUNCTION() {}`, etc., has to be in this mainfile.


#### Project directory

[Current version] Current working directory.<br/>
[Futher version] Or directory of `package.json` specified by command line.

Code.gs needs file path information to pack files for `require()` function. But full path name(may include personal name) is not suitable to publish on GAS.For this, Code.gs handle Project directory as a root(/).


#### Source files or directory

[Current version] Command line option `-s`/`--source` or project directory.<br/>
[Futher version] Or specified in `package.json`.

One or more files/directories are able to set. Those files should be under he project directory.<br/>
If not set by commandline option, Code.gs use project directory as source directory.


#### Output file

[Current version] Command line option `-o`/`--output` or `stdout`.

Not set, Code.gs outputs to standard output.


### Advanced options

* node_modules
* Core modules
* Node core modules
* Kernel file

#### node_modules

[Current version] No option. All modules in `PROJECT_DIRECTORY/node_modules/` will be packed.<br/>
[Futher version] Or specified in `package.json`.

Code.gs can handle node_modules and module directory. For loading modules inside node_modules directory, no need to code. Both:
`require('/node_modules/argv')` and `require('argv')` do work.

Currently, there's no way to ignore node_modules. All node_modules folders are packed into output file.


#### Core modules

[Current version] PROJECTDIRECTORY/core is default directory. or Any other directory set by option `-c` / `--core'.

Core modules are able to load without directory name such as 'assert', 'http' in Node.js.

Modules in this directory, Code.gs will assume to be core module. These modules will be laid out special path `core/` in output file(ex. `core/assert.js`). Other module can load like berow.

```javascript
var assert = require('assert');
```




## Limitation and Enhancement

### No Node.js Global Objects.


### Enhancemnet require to get Global Objects.
