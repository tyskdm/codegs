/**
 *  GASのメイン関数群を含むファイルは、モジュールとせずにグローバルに直接配置する。
 *  exports, module, __filename, __dirname は、定義されない（undefined）。
 *  
 *  Toolで自動的にHeaderを付加する。
 */
require('nodeGS').setMain('filepath');  // メインファイルのpathを指定する。


/**
 *  コード本体
 */

function onOpen() {
    var SpreadsheetApp = require('SpreadsheetApp');

    var ss = SpreadsheetApp.getActiveSheet();
    ss.getRange(1, 1).setValue(1, 1, new Date());
}


