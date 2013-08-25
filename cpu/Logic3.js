(function(global) {
"use strict";

// --- define ----------------------------------------------
// platform detection
// var _BROWSER = !!global.self;
// var _WORKER  = !!global.WorkerLocation;
var _NODE_JS = !!global.global;

// --- local variable --------------------------------------

// --- interface -------------------------------------------
function Logic3(name) { // @arg String: player name
    this._name = name;
    this._human = false;
}
Logic3.prototype.__proto__ = Player.prototype;
Logic3.prototype.logic = logic; // [override] #logic(color:CellValue, cell:CellValueArray, callback):Boolean

// --- implement -------------------------------------------
function logic(param,      // @arg Object: { color, cell, turn }
                           //   param.color - CellValue: Cell.BLACK or Cell.WHITE
                           //   param.cell  - CellValueArray: [Cell.EMPTY, Cell.BLACK, ...]
                           //   param.turn  - Integer: turn count
               callback) { // @arg Function: callback(position:Integer):void

    // Logic:
    //  (1). 引数で渡された盤面のコピーを作る
    //  (2). 得点の見積もりをだす
    //  (3). 得点の配列を走査し最大値を探す。同じ値が複数ある場合は後勝ち
    //  (4). 見つかった最大値を返す。全て同点なら0を返す
    //
    //  常に最高得点の場所を選択する

    var cell = new Cell(param.cell);    // (1). Cellオブジェクトを作成
    var hint = cell.hint(param.color);  // (2). 得点の見積もり
    var position = 0;

    // (3). 配列の先頭から最大の値を持つ要素を検索し、添え字を返す
    position = BaseLogic.getMaxValueIndex(hint);
    callback(position);
}

// --- export ----------------------------------------------
if (_NODE_JS) {
    module.exports = Logic3;
}
global.Logic3 = Logic3;

})(this.self || global);

