# Code.gs

A tool to pack Node.js module files and module system emulator within one source file.

## First example.

~/yourproject/main.js
```javascript
var lib = require('./lib);

console.log('3 + 4 = ' + lib.sum(3, 4));
```

~/yourproject/lib.js
```javascript
module.exports.sum = function (a, b) {
    return a + b;
};
```

goto yourproject and type:
```shell
$ code main.js
```

then you see packed source code:
```shell
// lib.js
// line: 3
require('module').define('/main.js',
function() {
module.exports.sum = function (a, b) {
    return a + b;
};
});
// main.js
// line: 3
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

that is packed main.js, lib.js and Node.js module system emulator.
So it's executable.
```shell
$ code main.js > out.js
$ node out.js
7
```


