(function(global) {
"use strict";

// --- define ----------------------------------------------
// platform detection
// var _BROWSER = !!global.self;
// var _WORKER  = !!global.WorkerLocation;
var _NODE_JS = !!global.global;

// --- local variable --------------------------------------

// --- interface -------------------------------------------
function BaseLogic() { }
BaseLogic.reverseColor          = reverseColor;
BaseLogic.getMaxValueIndex      = getMaxValueIndex;
BaseLogic.getNamedCell          = getNamedCell;
BaseLogic.getHintLength         = getHintLength;
BaseLogic.isOuterLine           = isOuterLine;
BaseLogic.isVerticalOuterLine   = isVerticalOuterLine;
BaseLogic.isHorizontalOuterLine = isHorizontalOuterLine;
BaseLogic.inUpLine              = inUpLine;
BaseLogic.inBottomLine          = inBottomLine;
BaseLogic.inLeftLine            = inLeftLine;
BaseLogic.inRightLine           = inRightLine;

// --- implement -------------------------------------------
function reverseColor(color) {
    return color === Cell.BLACK ? Cell.WHITE : Cell.BLACK
}

// 配列の先頭から最大の値を持つ要素を検索し、添え字を返す
function getMaxValueIndex(array) {
    var position = 0;
    var maxValue = 0;

    for (var i = 0, iz = array.length; i < iz; ++i) {
        if (maxValue < array[i]) {
            maxValue = array[i];
            position = i;
        }
    }
    return position;
}

function toPos(x, y) {
    return x + y * 8;
}

function getHintLength(cell,    // @arg CellValueArray: [Cell.BLACK, ...]
                       color) { // @arg CellValue: Cell.BLACK
    var hint = new Cell(cell).hint(color);

    return hint.filter(function(value) {
                return !!value;
            }).length;
}

function getNamedCell() { // @ret Object: { K:[], C:[], X:[], A:[], B:[] }
                          // @desc: get named cells
    /**
     * KCABBACK
     * CX    XC
     * A      A
     * B      B
     * B      A
     * A      A
     * CX    XC
     * KCABBACK
     */
    return {
        // 角
        "K": [ 0, 7, 56, 63 ],
        // 角の隣(危険)
        "C": [ 1, 6, toPos(0,1), toPos(7,1),
               toPos(0,7-1), toPos(7,7-1), toPos(1,7), toPos(7-1,7) ],
        // 角の斜め隣(最も危険)
        "X": [ toPos(1,1), toPos(7-1,1), toPos(1,7-1), toPos(7-1,7-1) ],
        // Cの隣(微妙)
        "A": [ toPos(2,0), toPos(7-2,0), toPos(0,2), toPos(7,2),
               toPos(0,7-2), toPos(7,7-2), toPos(2,7), toPos(7-2,7) ],
        // Aの隣(取れるなら取りたい)
        "B": [ toPos(3,0), toPos(7-3,0), toPos(0,3), toPos(7,3),
               toPos(0,7-3), toPos(7,7-3), toPos(3,7), toPos(7-3,7) ]
    };
}

function isOuterLine(pos) { // @arg Integer: 0 ~ 63
                            // @desc: 外縁部ならtrue
    return isVerticalOuterLine(pos) || isHorizontalOuterLine(pos);
}
function isVerticalOuterLine(pos) { // @arg Integer: 0 ~ 63
                               // @desc: 左右の外縁部ならtrue
    return inLeftLine(pos) || inRightLine(pos);
}
function isHorizontalOuterLine(pos) { // @arg Integer: 0 ~ 63
                                 // @desc: 上下の外縁部ならtrue
    return inUpLine(pos) || inBottomLine(pos);
}
function inUpLine(pos) { // @desc: 上端のライン(0 ~ 7)ならtrue
    return pos <= 7;
}
function inBottomLine(pos) { // @desc: 下端のライン(56 ～ 53)ならtrue
    return pos >= 8 * 7;
}
function inLeftLine(pos) { // @desc: 左端のライン(8, 16, 24, 32, 40, 48)ならtrue
    return (pos % 8) == 0;
}
function inRightLine(pos) { // @desc: 右端のライン(15, 23, 31, 39, 47, 55)ならtrue
    return (pos % 8) == 7;
}


// --- export ----------------------------------------------
if (_NODE_JS) {
    module.exports = BaseLogic;
}
global.BaseLogic = BaseLogic;

})(this.self || global);

