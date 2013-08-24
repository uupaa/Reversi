(function(global) {
"use strict";

// --- define ----------------------------------------------
// platform detectioN
// var _BROWSER = !!global.self;
// var _WORKER  = !!global.WorkerLocation;
var _NODE_JS = !!global.global;

// --- local variable --------------------------------------

// --- interface -------------------------------------------
function Game() { }
Game.prototype.init = init;     // Game#init():void
Game.prototype.play = play;     // Game#play(player1:Player = null, player2:Player = null):void
Game.prototype.undo = undo;     // Game#undo():void
Game.prototype.color = color;   // Game#color():CellValueObject - { current: Cell.BLACK, next: Cell.WHITE }
Game.prototype.player = player; // Game#player(color:CellValue):Player
Game.prototype.handleEvent = handleEvent; // Game#handleEvent(event:Event)

// --- implement -------------------------------------------
function init() {
    this._cell   = new Cell();
    this._view   = new View(this, this._cell);
    this._color  = Cell.BLACK; // current color. BLACK or WHITE
    this._player = {};         // { Cell.BLACK: Player, Cell.WHITE: Player }
    this._selectedCell = -1;   // selected cell number(0 ~ 63), -1 is unselected
}

function play(player1,   // @arg Player(= null): black player
              player2) { // @arg Player(= null): white player
    this.init();
    this._player[Cell.BLACK] = player1 || new Player("Human1");
    this._player[Cell.WHITE] = player2 || new Player("Human2");
    this._view.update();
    _gameLoop(this);
}

function undo() {
    this._color = this._cell.undo();
    this._view.update();
}

function _gameLoop(that) {
    _nextTurn();

    function _nextTurn() {
        var player = that._player[that._color];

        _isGameOver()        ? _gameOver() :
        _isPass(that._color) ? _pass()     :
        player.isHuman()     ? _human()
                             : _cpu();
    }
    function _isGameOver() {
        return that._cell.cell().every(function(value) {
            return !!value;
        });
    }
    function _isPass(color) {
        return that._cell.hint(color).every(function(value) {
            return value === 0;
        });
    }
    function _human() {
        if (that._selectedCell === -1) { // not selected
            setTimeout(_human, 100); // re-evaluate after 100ms
            return;
        }
        var x = (that._selectedCell % 8);
        var y = (that._selectedCell / 8) | 0;

        that._selectedCell = -1; // -> clear (not selected)
        _move(that._color, x, y);
    }
    function _cpu() {
        var clonedCellArray = that._cell.cell().slice(); // [cell, ...]

        player.think(that._color, clonedCellArray, function(x, y) {
            _move(that._color, x, y);
        });
    }
    function _move(color, x, y) {
        // judge
        if ( that._cell.hint(color)[x + y * 8] ) {
            that._cell.move(color, x, y);
            that._color = that.color().next;
            that._view.update();
        } else {
            //alert(" bad boy ");
        }
        setTimeout(_nextTurn, 100);
    }
    function _gameOver() {
        that._view.update("GAMEOVER");
    }
    function _pass() {
        if ( _isPass(that.color().next) ) {
            that._view.update("GAMEOVER");
        } else {
            that._view.update("PASS");
            that._color = that.color().next;
            that._view.update();
            _nextTurn();
        }
    }
}

function color() { // @ret ColorValueObject: { current: Cell.BLACK, next: Cell.WHITE }
                   // @desc: current color
    var next = this._color === Cell.BLACK ? Cell.WHITE
                                          : Cell.BLACK;
    return { current: this._color, next: next };
}

function player(color) { // @arg ColorValue: Cell.BLACK or Cell.WHITE
                         // @ret Player: player object
    return this._player[color];
}

function handleEvent(event) {
    if (event.type === "click") {
        this._selectedCell = event.data;
    }
}

// --- export ----------------------------------------------
if (_NODE_JS) {
    module.exports = Game;
}
global.Game = Game;

})(this.self || global);

