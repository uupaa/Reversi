(function(global) {
"use strict";

// --- define ----------------------------------------------
// platform detection
// var _BROWSER = !!global.self;
// var _WORKER  = !!global.WorkerLocation;
var _NODE_JS = !!global.global;

// --- local variable --------------------------------------

// --- interface -------------------------------------------
function Player(name) { // @arg String: player name
    this._name = name;
    this._human = true;
}
Player.prototype.name    = name;    // Player#name():String
Player.prototype.isHuman = isHuman; // Player#isHuman():Boolean
Player.prototype.logic   = logic;   // Player#logic(color:CellValue, cell:CellValueArray, callback):Boolean

// --- implement -------------------------------------------
function name() { // @ret String: player name
    return this._name;
}

function isHuman() { // @ret Boolean:
    return this._human;
}

function logic(param,      // @arg Object: { color, cell, turn }
                           //   param.color - CellValue: Cell.BLACK or Cell.WHITE
                           //   param.cell  - CellValueArray: [Cell.EMPTY, Cell.BLACK, ...]
                           //   param.turn  - Integer: turn count
               callback) { // @arg Function: callback(position:Integer):void

    // logic.
    //  1. 配列を走査し最大値を探す。
    //  2. 同じ値が複数ある場合は後勝ち
    //  3. 見つかった最大値を返す。全て同点なら0を返す

    // 配列の先頭から最大の値を持つ要素を検索し、添え字を返す
    var position = 0, i, maxValue = 0;
    for (i = 0; i < 64; ++i) {
        if (maxValue < param.cell[i]) {
            maxValue = param.cell[i];
            position = i;
        }
    }
    callback(position);
}

// --- export ----------------------------------------------
if (_NODE_JS) {
    module.exports = Player;
}
global.Player = Player;

})(this.self || global);

