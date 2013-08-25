(function(global) {
"use strict";

// --- define ----------------------------------------------
// platform detection
// var _BROWSER = !!global.self;
// var _WORKER  = !!global.WorkerLocation;
var _NODE_JS = !!global.global;

// --- local variable --------------------------------------

// --- interface -------------------------------------------
function CPULv2(name) { // @arg String: player name
    this._name = name;
    this._human = false;
}
CPULv2.prototype.__proto__ = Player.prototype;
CPULv2.prototype.logic = logic; // [override] #logic(color:CellValue, cell:CellValueArray, callback):Boolean

// --- implement -------------------------------------------
function logic(param,      // @arg Object: { color, cell, turn }
                           //   param.color - CellValue: Cell.BLACK or Cell.WHITE
                           //   param.cell  - CellValueArray: [Cell.EMPTY, Cell.BLACK, ...]
                           //   param.turn  - Integer: turn count
               callback) { // @arg Function: callback(position:Integer):void

    // Logic:
    //
    //  (1). 引数で渡された盤面のコピーを作る
    //  (2). 得点の見積もりをだす
    //  (3). 盤面における各セルを事前に重み付け
    //  (4). 自分が打てる場所を増やし、相手が打てる場所を減らす
    //  (5). 重みが同じセルが複数ある場合は、ランダムに選択する
    // 序盤は (4) + (5) の打ち方を行う
    // 中盤や終盤は (4) の打ちかたを行う
    // discの数を意識していないため詰めが甘い
    var cell = new Cell(param.cell);    // (1). Cellオブジェクトを作成
    var hint = cell.hint(param.color);  // (2). 得点の見積もり
    var color = param.color;
    var turn = param.turn;
    var candidate = [];
    var candidate2 = []; // 次の一手の候補
    var pos = 0, i = 0, iz = 0, j = 0;

    for (i = 0; i < 64; ++i) {
        if (hint[i]) {
            candidate.push([ i, hint[i] ]); // 得点可能な場所を候補として列挙 [[0=場所][1=得点]]
        }
    }
    var named = BaseLogic.getNamedCell();
    var weight = []; // 評価の重み


    // (3) K, A, B は高評価, C, X は低評価
    for (i = 0, iz = candidate.length; i < iz; ++i) {
        weight[i] = 20; // 重み20で初期化
        for (j = 0; j < named.K.length; ++j) { weight[i] += (named.K[j] == candidate[i][0]) ?  20 : 0; }
        for (j = 0; j < named.A.length; ++j) { weight[i] += (named.A[j] == candidate[i][0]) ?   2 : 0; }
        for (j = 0; j < named.B.length; ++j) { weight[i] += (named.B[j] == candidate[i][0]) ?   4 : 0; }
        for (j = 0; j < named.C.length; ++j) { weight[i] += (named.C[j] == candidate[i][0]) ? -10 : 0; }
        for (j = 0; j < named.X.length; ++j) { weight[i] += (named.X[j] == candidate[i][0]) ? -20 : 0; }
    }
    // (4) 自分が打てる場所を増やし相手が打てる場所を減らすような場所を探す
    for (i = 0, iz = candidate.length; i < iz; ++i) {
        candidate2[0] = [
            BaseLogic.getHintLength(cell.cell(), color),                         // friend
            BaseLogic.getHintLength(cell.cell(), BaseLogic.reverseColor(color))  // enemy
        ];
        // 一手仮打
        var nextCell = new Cell(cell.cell()).move(color, candidate[i][0] % 8,
                                                         candidate[i][0] / 8 | 0);

        candidate2[1] = [
            BaseLogic.getHintLength(nextCell.cell(), color),   // friend
            BaseLogic.getHintLength(nextCell.cell(), BaseLogic.reverseColor(color)) // enemy
        ];
        // 味方が打てる場所が増えているなら重み付け
        if (candidate2[0][0] <= candidate2[1][0]) {
            weight[i] += Math.abs(candidate2[0][0] - candidate2[1][0]);
        }
        // 敵が打てる場所が減っているなら重み付け
        if (candidate2[0][1] > candidate2[1][1]) {
            weight[i] += Math.abs(candidate2[0][1] - candidate2[1][1]);
        }
    }
    // (5) 重みが同じセルが複数ある場合は、ランダムに選択する
    if (turn < 12) {
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
        pos = maxWeight[Math.floor(Math.random() * maxWeight.length)];
    } else {
        // 最も重みが高いセルの添え字を返す
        pos = BaseLogic.getMaxValueIndex(weight);
    }
    var position = candidate[pos][0];

    callback( position );
}

// --- export ----------------------------------------------
if (_NODE_JS) {
    module.exports = CPULv2;
}
global.CPULv2 = CPULv2;

})(this.self || global);

