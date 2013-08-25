(function(global) {
"use strict";

// --- define ----------------------------------------------
// platform detection
// var _BROWSER = !!global.self;
// var _WORKER  = !!global.WorkerLocation;
var _NODE_JS = !!global.global;

// --- local variable --------------------------------------

// --- interface -------------------------------------------
function CPULv1(name) { // @arg String: player name
    this._name = name;
    this._human = false;
}
CPULv1.prototype.__proto__ = Player.prototype;
CPULv1.prototype.logic = logic; // [override] #logic(color:CellValue, cell:CellValueArray, callback):Boolean

// --- implement -------------------------------------------
function logic(param,      // @arg Object: { color, cell, turn }
                           //   param.color - CellValue: Cell.BLACK or Cell.WHITE
                           //   param.cell  - CellValueArray: [Cell.EMPTY, Cell.BLACK, ...]
                           //   param.turn  - Integer: turn count
               callback) { // @arg Function: callback(position:Integer):void

    // Logic:
    //  (1). 引数で渡された盤面のコピーを作る
    //  (2). 得点の見積もりをだす
    //  (3). 配置可能な場所の候補を列挙する
    //  (4). 列挙した候補からランダムに１つ選択する

    var cell = new Cell(param.cell);    // (1). Cellオブジェクトを作成
    var hint = cell.hint(param.color);  // (2). 得点の見積もり
    var candidate = [];                 // 配置候補

    for (var i = 0; i < 64; ++i) {
        if (hint[i]) { // 配置が可能で…
            candidate.push(i); // (3). 得点可能な場所を候補として列挙
        }
    }
    // (4). 列挙済みの候補からランダムに選定
    var index = Math.floor(Math.random() * candidate.length);
    var position = candidate[index];

    // 石を打つ位置を引数で渡す
    callback(position);
}

// --- export ----------------------------------------------
if (_NODE_JS) {
    module.exports = CPULv1;
}
global.CPULv1 = CPULv1;

})(this.self || global);

