

function onOpen() {
    var SpreadsheetApp = require('SpreadsheetApp');

    var ss = SpreadsheetApp.getActiveSheet();
    ss.getRange(1, 1).setValue(1, 1, new Date());
}


