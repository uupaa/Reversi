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
function init() { // @desc: initialize
    this._cell   = new Cell();
    this._view   = new View(this, this._cell);
    this._color  = Cell.BLACK; // current color. BLACK or WHITE
    this._player = {};         // { Cell.BLACK: Player, Cell.WHITE: Player }
    this._selectedCell = -1;   // selected cell number(0 ~ 63), -1 is unselected
}

function play(player1,   // @arg Player(= null): black player. Human or CPU
              player2) { // @arg Player(= null): white player. Human or CPU
                         // @desc: play the game.
    this.init();

    // --- create player object ---
    this._player[Cell.BLACK] = player1 || new Player("Player1"); // 指定されていなければHumanで生成
    this._player[Cell.WHITE] = player2 || new Player("Player2"); // 指定されていなければHumanで生成

    this._view.update();
    _gameLoop(this);
}

function undo() { // @desc: undo
    this._color = this._cell.undo();
    this._view.update();
}

function _gameLoop(that) {
    _nextTurn();

    function _nextTurn() {
        var player = that._player[that._color];

        _isGameOver()        ? _gameOver() :    // ゲームオーバ判定
        _isPass(that._color) ? _pass()     :    // パス判定
        player.isHuman()     ? _human()
                             : _cpu(player);
    }
    function _human() {
        if (that._selectedCell === -1) { // not selected - セルが選択されていなければ100ms待つ
            setTimeout(_human, 100); // re-evaluate after 100ms
            return;
        }

        console.log(that._color === 1 ? "BLACK" : "WHITE", that._selectedCell);

        _move(that._color, that._selectedCell); // move the stone. 石を取る
        that._selectedCell = -1; // -> clear (not selected)
    }

    function _cpu(player) {
        // call cpu logic
        var param = {
                color: that._color,               // CellValue. Cell.BLACK or Cell.WHITE - 現在の手番の色
                cell:  that._cell.cell().slice(), // cloned borad. [Cell.BLACK, ...] - 盤面の配列をコピーしたもの, 配列の長さは64
                turn:  that._cell.turn()          // turn count. 0 ~ 63 - 現在のターン数(0 ~ 63)
            };
        player.logic(param, function(position) { // @arg Integer: cell position. x + y * 8 = 0 ~ 63

            console.log(that._color === 1 ? "BLACK" : "WHITE", position);

            _move(that._color, position);
        });
    }

    function _move(color,      // @arg CellValue: Cell.BLACK or Cell.WHITE
                   position) { // @arg Integer: cell position. x + y * 8 = 0 ~ 63
                               // @desc: move the stone to position.
                               //        position で指定された場所に石を置く
        var x = (position % 8);
        var y = (position / 8) | 0;

        // judge position. - 配置不能な場所に置こうとしていないかをチェック
        if ( that._cell.hint(color)[position] ) {
            that._cell.move(color, x, y);         // update board info.
            that._color = that.color().next;      // set next color
            that._view.update();                  // View を update
        } else {
            // Bad boy!
            console.error(color === 1 ? "BLACK" : "WHITE", position, x, y);
        }
        setTimeout(_nextTurn, 100);
    }
    function _isGameOver() {
        // 盤面に石が全て配置されていればゲーム終了
        return that._cell.cell().every(function(value) {
            return !!value;
        });
    }
    function _isPass(color) {
        // 得点不能ならパス
        return that._cell.hint(color).every(function(value) {
            return value === 0;
        });
    }
    function _gameOver() {
        that._view.update("GAMEOVER");
    }
    function _pass() {
        if ( _isPass(that.color().next) ) { // pass and pass -> Game Over. 相互にパスする状況ならゲーム終了
            that._view.update("GAMEOVER");
        } else {
            that._view.update("PASS");
            that._color = that.color().next; // pass
            that._view.update();
            _nextTurn();
        }
    }
}

function color() { // @ret CellValueObject: { current: Cell.BLACK, next: Cell.WHITE }
                   // @desc: get current color.
                   //        現在の手番の色を返す
    var next = this._color === Cell.BLACK ? Cell.WHITE
                                          : Cell.BLACK;
    return { current: this._color, next: next };
}

function player(color) { // @arg CellValue: Cell.BLACK or Cell.WHITE
                         // @ret Player: get player object.
                         //              player(Human or CPU)オブジェクトを返す
    return this._player[color];
}

function handleEvent(event) { // @arg Event/Object: { type, data }
                              // @desc: even handler.
                              //        イベントハンドラ, このゲームではセルクリックから呼ばれる
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

