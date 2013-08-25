(function(global) {
"use strict";

// --- define ----------------------------------------------
// platform detection
// var _BROWSER = !!global.self;
// var _WORKER  = !!global.WorkerLocation;
var _NODE_JS = !!global.global;

// --- local variable --------------------------------------

// --- interface -------------------------------------------
function CPULv3(name) { // @arg String: player name
    this._name = name;
    this._human = false;
}
CPULv3.prototype.__proto__ = Player.prototype;
CPULv3.prototype.logic = logic; // [override] #logic(color:CellValue, cell:CellValueArray, callback):Boolean

// --- implement -------------------------------------------
function logic(param,      // @arg Object: { color, cell, turn }
                           //   param.color - CellValue: Cell.BLACK or Cell.WHITE
                           //   param.cell  - CellValueArray: [Cell.EMPTY, Cell.BLACK, ...]
                           //   param.turn  - Integer: turn count
               callback) { // @arg Function: callback(position:Integer):void

    // NOT IMPL.
/*
    //  Logic:
    //  (1). 盤面における各セルを事前に重み付け
    //  (2). 自分が打てる場所を増やし、相手が打てる場所を減らす
    //  (3). 取得可能なdisc数を評価する
    //  (4). サイドラインの得点を高く評価する
    //  (5). 序盤, 中盤, 終盤で打ちかたを変える
    //  (6). 重みが同じセルが複数ある場合は、ランダムに選択する
    //
    // 序盤は(2) + (6)の打ち方を行う
    // 中盤は(2) + (4) + (6)の打ち方を行う
    // 終盤は(2) + (3) + (4) + (6)の打ち方を行う
    var pos = 0;
    var i, j, scores = this.enumScore(cell, this.toDisc(turn)); // 得点を列挙
    var candidate = [];
    for (i = 0; i < scores.length; ++i) {
        if (scores[i]) {
            candidate.push([i,scores[i]]); // 得点可能な場所を候補として列挙 [[0=場所][1=得点]]
        }
    }
    var named = this.getNamedCellPosition();
    var weight = []; // 評価の重み
    var virtualCandidate = []; // 仮想候補

    // (1) K, A, B は高評価, C, X は低評価
    for (i = 0; i < candidate.length; ++i) {
        weight[i] = 20; // 重み20で初期化
        for (j = 0; j < named.K.length; ++j) { weight[i] += (named.K[j] == candidate[i][0]) ?  40 : 0; }
        for (j = 0; j < named.A.length; ++j) { weight[i] += (named.A[j] == candidate[i][0]) ?  10 : 0; }
        for (j = 0; j < named.B.length; ++j) { weight[i] += (named.B[j] == candidate[i][0]) ?  15 : 0; }
        for (j = 0; j < named.C.length; ++j) { weight[i] += (named.C[j] == candidate[i][0]) ? -10 : 0; }
        for (j = 0; j < named.X.length; ++j) { weight[i] += (named.X[j] == candidate[i][0]) ? -20 : 0; }
    }
    // (2) 自分が打てる場所を増やし、相手が打てる場所を減らす
    for (i = 0; i < candidate.length; ++i) {
        var nextCell = cell.copy(); // コピー

        virtualCandidate[0] = [ this.enumScore(cell, this.toDisc(turn), true).length,            // friend
                                this.enumScore(cell, this.toDisc(turn+1), true).length ];        // enemy
        this.moveDisc(nextCell, this.toDisc(turn), candidate[i][0]); // 一手仮打
        virtualCandidate[1] = [ this.enumScore(nextCell, this.toDisc(turn), true).length,        // friend
                                this.enumScore(nextCell, this.toDisc(turn+1), true).length ];    // enemy

        // 味方が打てる場所が増えているなら重み付け
        if (virtualCandidate[0][0] <= virtualCandidate[1][0]) {
            weight[i] += Math.abs(virtualCandidate[0][0] - virtualCandidate[1][0]);
        }
        // 敵が打てる場所が減っているなら重み付け
        if (virtualCandidate[0][1] > virtualCandidate[1][1]) {
            weight[i] += Math.abs(virtualCandidate[0][1] - virtualCandidate[1][1]);
        }

        // 一手先で敵に角が取られてしまうならNG
        this.draw(nextCell, turn+1, candidate[i][0]);
        for (j = 0; j < named.K.length; ++j) {
            if (this.getScore(nextCell, this.toDisc(turn+1), named.K[j])) {
                weight[i] = -20;
            }
        }
        // サイドラインに置けるなら高評価
        // ▼
        if (this.isSideLine(candidate[i])) {
            
        }
    }

    if (turn < 12) { // 序盤
        ;
    } else if (turn < 33) { // 中盤
        // (4) サイドラインの得点を高く評価する
        for (i = 0; i < candidate.length; ++i) {
            if (this.isSideLine(candidate[i][0])) {
                weight[i] += parseInt((candidate[i][1] * 5)); // サイドラインは3倍
            }
        }
    } else { // 終盤
        // (3) 取得可能なdisc数を評価する
        // (4) サイドラインの得点を高く評価する
        for (i = 0; i < candidate.length; ++i) {
            if (this.isSideLine(candidate[i][0])) {
                weight[i] += parseInt((candidate[i][1] * 5)); // サイドラインは5倍
            } else {
                weight[i] += parseInt((candidate[i][1] * 2)); // その他は2倍
            }
        }
    }
    // (6) 重みが同じセルが複数ある場合は、ランダムに選択する
    var max = -20, maxWeight = [];
    // 最大値の走査
    for (i = 0; i < weight.length; ++i) {
        if (max < weight[i]) {
            max = weight[i];
            maxWeight = [i]; // array reset
        } else if (max == weight[i]) {
            maxWeight.push(i);
        }
    }
    if (maxWeight.length) {
        pos = maxWeight[Math.floor(Math.random() * maxWeight.length)];
    } else {
        window.status = "bug";
    }
    return candidate[pos][0];
 */
}

// --- export ----------------------------------------------
if (_NODE_JS) {
    module.exports = CPULv3;
}
global.CPULv3 = CPULv3;

})(this.self || global);


