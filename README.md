# Code.gs

A tool to pack Node.js module files and module system emulator within one source file.
That source file is executable on [Google Apps Script](https://developers.google.com/apps-script/) environment( or perhaps other Javascript engines).

#### v0.0.8
* After startup and Before calling runmain, 'require' method assumes that self filename is '/.'.
* Add ['codegs-core'](https://www.npmjs.org/package/codegs-core) module to npm as another package. That includes some code　core modules for GAS, and some Node.js core modules.(No change in this package)

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
require('module').define('/main.js',
function(exports, require, module, \__filename, \__dirname) {
module.exports.sum = function (a, b) {
    return a + b;
};
});
require('module').runmain('/main.js');
var lib = require('./lib);
console.log('3 + 4 = ' + lib.sum(3, 4));
require('module').endmain('/main.js');
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

Code.gs needs some information to work. Options let code.gs know that information.


### Minimum info to work
* Main module
* Project directory
* Source files
* Output file


#### Main module

[Current version] specify in command line.<br/>
[Futher version] command line or `package.json`.

- Javascript VM load and run this file first. and against GAS specification, this module will be put in global scope.
It should be relative to the root of project directory.

**memo**<br/>
GAS entry functions should be defined in global scope with `function` statement.<br/>
`function onOpen() {}`, `function doGet() {}`, or `function YOURENTRYFUNCTION() {}`, etc., has to be in this mainfile.


#### Project directory

[Current version] Current working directory.<br/>
[Futher version] Or directory of `package.json` specified by command line.

- Code.gs needs file path information to pack files for `require()` function. But full path name(may include personal name) is not suitable to publish on GAS.For this, Code.gs handle Project directory as a root(/).


#### Source files or directory

[Current version] Command line option `-s`/`--source` or project directory.<br/>
[Futher version] Or specified in `package.json`.

- One or more files/directories are able to set. Those files should be under the project directory.
- If not set by commandline option, Code.gs use project directory as source directory.


#### Output file

[Current version] Command line option `-o` / `--output` or `stdout`.

- Not set, Code.gs outputs to standard output.


### Advanced Info to do more

* node_modules
* Core modules
* Node core modules
* Kernel file

#### node_modules

[Current version] No option. All modules in `PROJECT/node_modules/` will be packed.<br/>
[Futher version] Not all, only specified modules in `package.json` will be packed.

- Code.gs can handle node_modules.

- To load modules in `/node_modules`, no need to code fully filepath. Both of bellow are valid.

    ```shell
    var argv = require('/node_modules/argv.js');
    var argv = require('argv');
    ```

- Currently, there's no way to ignore node_modules. All files in node_modules directory are packed into output file.


#### Core modules

[Current version] PROJECT/core is default directory. or Any other directory set by option `-c` / `--core'.

- Core modules are able to load without directory name such as 'assert', 'http' in Node.js. It's same as node_modules, but always this takes priority.

- Modules in this directory, Code.gs will assume to be core module. These modules will be laid out hidden path in output file.

#### NodeCore modules

[Current version] PROJECT/node_core is default directory. or Any other directory set by option `-n` / `--nodecore`.

- As same as Core modules. It's priority is between core module and node_modules.

    Core module > NodeCore modules > node_modules

- This(PROJECT/node_core) is for Node.js core modules. If you want to use Node.js core files such as util, assert, etc. put it in
this directory.

**note**<br/>
Node.js core modules have deep dependency each other modules. So It's not so easy to run outside Node.js environment. I'd like to try some modules.

#### Kernel file

[Current version] Default file is 'module.js' in this package. Option `-k` / `--kernel` set it any other file.

- Default kernel(module.js) is minimum & simple module emulator. But using additional module, It's possible to extend kernel functions like global object `process`, `console`, timer functions,.. if you write.

- Code.gs can pack those additional modules with simple default kernel. and, use that package as a new kernel.

    ... This needs more explanation. I'll add later.


## Limitation and Enhancement

### No Node.js Global Objects.

Node.js has some global objects(http://nodejs.jp/nodejs.org_ja/docs/v0.10/api/globals.html).

But Code.gs provides only one function 'require'. No other global namespace pollution.


### Enhancemnet require to get Global Objects.

Google Apps Script also provides global objects such as Logger, SpreadsheetApp, etc.

'require()' of Code.gs returns global object by name. It means this code returns original Logger object.

```javascript
var log = require('Logger');
```

**memo**<br>
This is for debugging GAS code on Node.js. Using this, It's easy to inject API objects.

When you want to use mock-Logger or mock-spreadsheet,.. write mock and put it in node_modules directory of parent directry.

ex. if your project root dir is `/home/path/to/project/`, then put mock in `/home/path/to/node_module`.

Node.js search that path and find mock.<br/>
Code.gs doesn't pack that mock(Because it locate outside project.). and require returns REAL objects.
