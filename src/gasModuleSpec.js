/**
 *  Specfile for gasModule
 *
 */

var ngs = require('nodeGS');

var smod = ngs.inject('someModule', {
    SpreadsheetApp: fakeSpreadsheet_type01,
    Table: fakeTable_type02
});

var omod = ngs.require('otherModule');



describe("Some module", function() {
    it ("should be...", function() {
        expect(mySum.sum(7, 11)).toEqual(18);
    });
});

