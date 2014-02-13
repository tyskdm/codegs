#Code.gs Examples

##02-UsingNodeCoreModules

Node core modules:
util / assert / console

Fake modules:
process / buffer


###Usage

Come to this directory and try:

1) node lib/main.js

- You see result of `lib.sum(3, 4);`

2) code lib/main.js -o out.js

- code create out.js including main.js, lib.js and module emulator.

- Create a new Google Apps Script project in your Google drive.
- Copy content of out.js to Code.gs file in your project.
- Run or Debug function 'require'

- View Logs(Ctrl+Enter).
- You see result of `lib.sum(3, 4);`

###How this works

This program calculate sum and print result throw 'Logger.log'. Logger is native object on Google Apps Script and not exists in Node.js environment.

When run main.js in your local PC, Node.js try to search 'Logger' module in node_modules folder and find and load it from ./example/node_modules.

When run main.js in GAS environment, Codegs kernel search 'Logger' module in global objects or node_modules. Codegs find it in global, and return that.
Codegs command line tool does not merge Logger.js module, because it's plased outside project directory.
