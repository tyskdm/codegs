/**
 *  Specfile for gasModule
 *
 */

var nodegs = require('nodeGS');

var smod = nodegs.inject('someModule', {
    SpreadsheetApp: fakeSpreadsheet_type01,
    Table: fakeTable_type02
});

var omod = nodegs.require('otherModule');



describe("Some module", function() {
    it ("should be...", function() {
        expect(mySum.sum(7, 11)).toEqual(18);
    });
});

