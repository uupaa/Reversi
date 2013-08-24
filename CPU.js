(function(global) {
"use strict";

// --- define ----------------------------------------------
// platform detection
// var _BROWSER = !!global.self;
// var _WORKER  = !!global.WorkerLocation;
var _NODE_JS = !!global.global;

// --- local variable --------------------------------------

// --- interface -------------------------------------------
function CPU(name) { // @arg String: player name
    this._name  = name;
}
CPU.prototype.__proto__ = Player.prototype;
CPU.prototype.isHuman = isHuman; // [override] CPU#isHuman():Boolean
CPU.prototype.think   = think;   // [override] CPU#think(color:CellValue, cell:CellValueArray, callback):Boolean

// --- implement -------------------------------------------
function isHuman() { // @ret Boolean:
    return false;
}

function think(color,      // @arg CellValue: Cell.BLACK or Cell.WHITE
               cell,       // @arg CellValueArray: [Cell.EMPTY, Cell.BLACK, ...]
               callback) { // @arg Function: callback(x:Integer, y:Integer):void
}

// --- export ----------------------------------------------
if (_NODE_JS) {
    module.exports = Player;
}
global.Player = Player;

})(this.self || global);


