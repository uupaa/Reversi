(function(global) {
"use strict";

// --- define ----------------------------------------------
// platform detection
// var _BROWSER = !!global.self;
// var _WORKER  = !!global.WorkerLocation;
var _NODE_JS = !!global.global;

// --- local variable --------------------------------------

// --- interface -------------------------------------------
function View(game, cell) {
    this._game = game;
    this._cell = cell;
    _init(this);
}
View.prototype.update = update;   // View#update(type)

// --- implement -------------------------------------------
function _init(that) {
    // create td x 64
    // <table id="board">
    //   <tr>
    //      <td id="cell_{index}" class="" onclick="game.handleEvent(...)">
    _query("#board td").forEach(function(node, index) {
        node.id = "cell_" + index;
        node.className = "";
        node.addEventListener("click", function() {
            that._game.handleEvent({ type: "click", data: index });
        });
    });
}

function update(type) { // @arg String(= ""):
    switch (type || "PROGRESS") {
    case "PROGRESS":
        _updateBoard(this);
        _updateScore(this);
        _updateTurnColor(this);
        break;
    case "PASS":
        alert( "PASS" );
        _updateBoard(this);
        _updateScore(this);
        _updateTurnColor(this);
        break;
    case "GAMEOVER":
        alert( _gameOver(this) );
    }
}

function _updateBoard(that) {
    var color = that._game.color().current;
    var cell  = that._cell.cell();
    var hint  = that._cell.hint(color);

    _query("#board td").forEach(function(node, index) {
        node.className = "";
        switch (cell[index]) {
        case Cell.BLACK: node.classList.add("black"); break;
        case Cell.WHITE: node.classList.add("white");
        }
        if (hint[index]) {
            node.classList.add("placeable");
            node.textContent = hint[index];
        } else {
            node.classList.remove("placeable");
            node.textContent = "";
        }
    });
}

function _updateScore(that) {
    var score = that._cell.score();

    document.querySelector("#blackScore").innerHTML = score.black;
    document.querySelector("#whiteScore").innerHTML = score.white;
}

function _updateTurnColor(that) {
    var value = that._game.color().current === Cell.BLACK ? "black"
                                                          : "white";

    document.querySelector("#turn").setAttribute("class", value);
}

function _query(selector, context) {
    context = context || document;
    return Array.prototype.slice.call( context.querySelectorAll(selector) );
}

function _gameOver(that) {
    var score = that._cell.score();

    if (score.black === score.white) {
        return "The game ended in a draw.";
    }
    var winnerColor = score.black > score.white ? Cell.BLACK : Cell.WHITE;
    var winner = that._game.player(winnerColor);

    return "The game ended in " + score.black + " -- " + score.white + ". " +
           "Winner is " + winner.name() + ".";
}

// --- export ----------------------------------------------
if (_NODE_JS) {
    module.exports = View;
}
global.View = View;

})(this.self || global);
