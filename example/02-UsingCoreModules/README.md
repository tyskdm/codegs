# Code.gs Examples

## 02-UsingCoreModules

This example include some core modules. node_core modules are from Node.js project. core modules are written for GAS environment instead of original Node.js modules.

Node core modules:
- util / assert / console
- These are copy of Node.js 0.10.24 original modules.

Core modules:
- process / buffer
- `process` is partial(minimum) implementation. `buffer` is only dummy constractor.

In this example, main.js will set up global objects(same as Node.js), load `assert` module, and store result of assertion into Logger using cosole.log().

### Usage

Come to this directory and type:

```shell
code src/main.js -o out.js
```

- `code` will create out.js including main.js, core/node_core modules and module emulator.

- Create a new Google Apps Script project in your Google drive.
- Copy content of out.js to Code.gs file in your project.
- Run function 'require'. (Debug mode execution does not work. It may be GAS Limitation.)

- View Logs(Ctrl+Enter).
- You see result of assertion.

### How this works

In main.js, module `global` is loaded. It loads some modules into global space. Those are needed by Node.js core modules.

After that, load `assert` module which use global object `console`, node core module `util`.

Then, assert and log results.
