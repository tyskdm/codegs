/**
 *  GASモジュールの Wrapper
 *  Toolで自動的にWrapする。
 */
require('nodeGS').define('filename',
function(exports, require, module, __filename, __dirname) {

    // ここに、モジュールのソースファイルを挿入する

});



/**
 *  モジュールのソースファイル
 */

/*  node環境でのUnit Testingのための、おまじないの１行
 *  ・node環境ではrequireを置き換える。これによってinjectionが機能するようになる。
 *  ・GAS環境では作用なし。
 */
require('nodeGS').setup(arguments);     // argumentsは、GASグローバル空間では undefined.

// nodeGSをコード中でも利用するときは以下の記述も可能。
var nodegs = require('nodeGS').setup(arguments);



//  ここにコードを書く




