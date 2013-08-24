(function(global) {
"use strict";

// --- define ----------------------------------------------
// platform detectioN
// var _BROWSER = !!global.self;
// var _WORKER  = !!global.WorkerLocation;
var _NODE_JS = !!global.global;

// --- local variable --------------------------------------

// --- interface -------------------------------------------
function Cell() {
    this._undo = { cell: [], color: [] };
    this._cell = [
            0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,
            0,0,0,2,1,0,0,0,
            0,0,0,1,2,0,0,0,
            0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0
        ];
}
// --- Cell Values ---
Cell.EMPTY = 0;
Cell.BLACK = 1;
Cell.WHITE = 2;

Cell._DIRECTION_BIAS = [
    { x: 0, y:-1 }, // N
    { x: 1, y:-1 }, // NE
    { x: 1, y: 0 }, // E
    { x: 1, y: 1 }, // SE
    { x: 0, y: 1 }, // S
    { x:-1, y: 1 }, // SW
    { x:-1, y: 0 }, // S
    { x:-1, y:-1 }  // NW
];
Cell.prototype.move  = move;    // Cell#move(color:CellValue, x:Integer, y:Integer):void
Cell.prototype.undo  = undo;    // Cell#undo():CellValue
Cell.prototype.cell  = cell;    // Cell#cell():CellValueArray
Cell.prototype.hint  = hint;    // Cell#hint(color:CellValue):ScoreIntegerArray
Cell.prototype.score = score;   // Cell#score():Array

// --- implement -------------------------------------------
function move(color, // @arg CellValue: Cell.BLACK or Cell.WHITE
              x,     // @arg XPositionInteger: 0 ~ 7
              y) {   // @arg YPositionInteger: 0 ~ 7
                     // @desc: turn move
    var that = this;

    this._undo.cell.push(this._cell.slice()); // copy
    this._undo.color.push(color);

    this._cell[x + y * 8] = color; // set color to cell

    for (var dir = 0; dir < 8; ++dir) {
        if ( _hint(that, color, x, y, dir) ) {
            _reverse(that, color, x, y, dir);
        }
    }
}

function undo() { // @ret CellValue: Cell.BLACK or Cell.WHITE
    if (this._undo.cell.length) {
        this._cell = this._undo.cell.pop();
        return this._undo.color.pop();
    }
    return Cell.BLACK;
}

function _reverse(that, color, x, y, direction) {
    var bias = Cell._DIRECTION_BIAS[direction];

    while (1) {
        x += bias.x;
        y += bias.y;
        if (that._cell[x + y * 8] === color) { // found a my color -> loop out
            break;
        }
        that._cell[x + y * 8] = color; // enemy color -> reverse
    }
}

function cell() { // @ret CellValueArray: [cell, ...]
    return this._cell;
}

function hint(color) { // @arg CellValue: Cell.WHITE or Cell.BLACK
                       // @ret ScoreIntegerArray: [score, ... ]
                       // @desc: calculate the hint, so possible score.
    if (color === undefined) {
        throw new Error("BAD_ARG");
    }
    var rv = [];
    var y = 0, x = 0, score = 0, dir = 0;

    for (; y < 8; ++y) {
        for (x = 0; x < 8; ++x) {
            score = 0;
            if (this._cell[x + y * 8] === Cell.EMPTY) {
                for (dir = 0; dir < 8; ++dir) {
                    score += _hint(this, color, x, y, dir);
                }
            }
            rv[x + y * 8] = score;
        }
    }
    return rv;
}

function _hint(that, color, x, y, direction) {
    var bias = Cell._DIRECTION_BIAS[direction];
    var score = 0;
    var enemy = (color === Cell.WHITE) ? Cell.BLACK
                                       : Cell.WHITE;
    while (1) {
        x += bias.x;
        y += bias.y;
        if (x < 0 || x >= 8 || y < 0 || y >= 8) { // out of range
            return 0;
        }
        switch (that._cell[x + y * 8]) {
        case enemy: ++score; break;
        case color: return score;
        default:    return 0;
        }
    }
}

function score() { // @ret Array: score. { black, white }
                   // @desc: calculate the black and white scores.
    var score = { black: 0, white: 0 };

    for (var i = 0; i < 64; ++i) {
        switch (this._cell[i]) {
        case Cell.BLACK: ++score.black; break;
        case Cell.WHITE: ++score.white;
        }
    }
    return score;
}

// --- export ----------------------------------------------
if (_NODE_JS) {
    module.exports = Cell;
}
global.Cell = Cell;

})(this.self || global);

