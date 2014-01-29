/**
 *  Specfile for gasModule
 *
 */

var nodegs = require('nodeGS');

var mod1 = nodegs.inject('Module1', {
    SpreadsheetApp: fakeSpreadsheet_type01,
    Table: fakeTable_type02
});

var mod2 = nodegs.require('Module2');



describe("Module1", function() {
    it ("should be...", function() {
        expect(mod1.sum(7, 11)).toEqual(18);
    });
});

