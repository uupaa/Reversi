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
    this._name  = name;
}
Player.prototype.name    = name;    // Player#name():String
Player.prototype.isHuman = isHuman; // Player#isHuman():Boolean
Player.prototype.think   = think;   // Player#think(color:CellValue, cell:CellValueArray, callback):Boolean

// --- implement -------------------------------------------
function name() { // @ret String: player name
    return this._name;
}

function isHuman() { // @ret Boolean:
    return true;
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

