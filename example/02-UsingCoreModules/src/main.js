
require('global');


var assert = require('assert');

try {
    assert(true);
} catch (e) {
    console.log('assert(true) throw = ' + e);
}

try {
    assert(false);
} catch (e) {
    console.log('assert(false) throw = ' + e);
}
