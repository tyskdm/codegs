# Code.gs

A tool to pack Node.js module files and module system emulator within one source file.


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

these are valid Node.js modules.
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

That's Code.gs.


## Why?


