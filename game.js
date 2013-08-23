function $(id) {
    return document.getElementById(id);
}

Array.prototype.copy = function() {
    //return Array.prototype.slice.call(this);
    return Array.apply(null, this);
}

// 配列の先頭から最大の値を持つ要素を検索し、添え字を返す
Array.prototype.firstMaxValuesIndex = function() {
    var i, max = 0, rv = 0;
    for (i = 0; i < this.length; ++i) {
        if (this[i] > max) {
            max = this[i];
            rv = i;
        }
    }
    return rv;
}

var game = null; // グローバル変数

function boot() {
    game = new Othello();
}

// ----------------------------------------
function Othello() {
    // 定数
    this.EMPTY        = 0x0;    // 空きセル(取れない)
    this.BLACK        = 0x1;    // 黒disc
    this.WHITE        = 0x2;    // 白disc
    this.ABLE_MASK    = 0x3;    // ABLEをノックアウトするマスク値
    this.ABLE        = 0x4;    // 空きセル(取れる)
    this.NEWS        = [[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]]; // 8方向(北,東北,東,東南...)

    // データメンバ
    this.cellSize    = 8;            // ゲームボードのセル数
    this.cell        = [];            // セルの配列
    this.player1    = 0;            // player: 0=人間,1～CPU
    this.player2    = 0;            // player: 0=人間,1～CPU
    this.turn        = 0;            // ターン数(偶数:BLACK, 奇数:WHITE)
    this.nextPos    = -1;            // 先行入力されたpos, -1なら指定されていない状態
    this.tid        = null;            // インターバルタイマーID
    this.delay        = 50;            // インターバルタイマーのディレイ(間隔)
    this.cpu        = null;            // CPUロジック

    this.oldCell    = [];            // undoバッファ
    this.oldTurn    = 0;            // undoバッファ
}

Othello.prototype = {
    /** セルの初期化とdiscの初期配置 */
    init: function() {
        // 環境変数の取得
        var size = $("cellSize");
        this.cellSize = parseInt(size.options[size.selectedIndex].value);
        this.cell = []; // clear

        var player1 = $("player1"), player2 = $("player2");
        this.player1 = parseInt(player1.options[player1.selectedIndex].value);
        this.player2 = parseInt(player2.options[player2.selectedIndex].value);
        this.cpu     = new class_othello_cpu(this, this.cellSize, this.player1, this.player2);

        // セルの初期化
        for (var i = 0; i < Math.pow(this.cellSize, 2); ++i) {
            this.cell[i] = this.EMPTY;
        }

        this.arrangement(0); // 初期配置
        this.draw(this.cell, this.turn, -1); // 描画
        this.loop();
    },

    /** discの初期配置
     * @param    number    pattern        配置パターン
     */
    arrangement: function(pattern) {
        pattern = pattern || 0;
        switch (pattern) {
        case 0:
            var c = Math.floor(this.cellSize / 2) - 1; // 中心よりちょい左
            this.cell[this.toPos(c,  c  )] = this.WHITE;
            this.cell[this.toPos(c+1,c  )] = this.BLACK;
            this.cell[this.toPos(c,  c+1)] = this.BLACK;
            this.cell[this.toPos(c+1,c+1)] = this.WHITE;
            this.turn = 0;    // 黒のターン
            break;
        case 1:
            // black pass check
            var a = [
                    2,2,2,2,2,1,0,0,
                    2,2,2,2,1,0,0,0,
                    2,1,1,1,0,0,0,0,
                    0,0,1,1,1,0,0,0,
                    0,0,0,1,1,1,0,0,
                    0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,
            ];
            var d = [this.EMPTY, this.BLACK, this.WHITE];
            for (var i = 0; i < a.length; ++i) {
                this.cell[i] = d[a[i]];
            };
            this.turn = 1;    // 白のターン
            break;
        case 2:
            // 黒ヤギさんが左下を選択しちゃう
            var a = [
                    0,0,2,0,0,0,0,0,
                    0,0,2,0,0,0,0,2,
                    0,0,2,1,2,2,2,2,
                    0,0,0,2,1,1,2,2,
                    0,0,1,2,1,1,1,2,
                    0,0,2,2,2,1,2,2,
                    0,0,0,2,2,2,0,0,
                    0,0,2,2,2,2,2,0,
            ];
            var d = [this.EMPTY, this.BLACK, this.WHITE];
            for (var i = 0; i < a.length; ++i) {
                this.cell[i] = d[a[i]];
            };
            this.turn = 30; // 黒
            break;
        }
    },

    loop: function() {
        var _self = this;
        if (this.tid) {
            // インターバルタイマー停止
            clearInterval(this.tid);
            this.tid = null;
        }
        this.tid = setInterval(
            function () {
                if (_self.isHumanTurn()) {
                    if (_self.nextPos == -1) {
                        // playerがdiscを置いていない → 次のタイムアウトまで待機
                    } else {
                        _self.move(_self.nextPos);
                        _self.nextPos = -1;
                    }
                } else {
                    var pos = _self.cpu.think(_self.cell, _self.turn);
                    if (pos == -1) {
                        _self.draw(_self.cell, _self.turn, pos);
                        alert(_self.gameOver(1));
                    } else {
                        window.status = pos;
                        _self.move(pos);
                    }
                }
            }, this.delay
        );
    },

    /** posを記憶 */
    onclick: function(pos) {
        this.nextPos = pos;
    },

    undo: function() {
        this.cell = this.oldCell.copy(); // undoバッファからリストア
        this.turn = this.oldTurn; // undoバッファからリストア
        this.draw(this.cell, this.turn, -1);
    },

    /** 操作権限があればtrue */
    isHumanTurn: function() {
        if (this.turn % 2) {
            return (this.player2) ? false : true; // white
        }
        return (this.player1) ? false : true; // black
    },
    /**
     * disc設置可能か判断し、(1)discを設置, (2)敵のdiscを裏返す, (3)ターンの切替 を行います。
     *
     * @param number    pos        セルの位置を0以上の値で指定します。
     */
    move: function(pos) {
        window.status = "";
        var msg = "";

        if (this.getScore(this.cell, this.toDisc(this.turn), pos)) {
            this.oldCell = this.cell.copy(); // undoバッファ更新
            this.oldTurn = this.turn; // undoバッファ更新

            this.moveDisc(this.cell, this.toDisc(this.turn), pos);    //    1手指す(クリック位置にdiscを設定)
            ++this.turn;    // ターンの切替

            if (this.isPass(this.enumScore(this.cell, this.toDisc(this.turn)))) { // パス?
                ++this.turn;    // ターンの切替

                if (this.isPass(this.enumScore(this.cell, this.toDisc(this.turn)))) { // パス + パス = 双方手詰まり
                    msg += this.gameOver(0);
                } else {
                    if (this.isHumanTurn()) { // 捜査権限があればメッセージボックスを出す。CPUなら出さない
                        msg += this.getPlayerName((this.turn % 2) ? 2 : 1);
                        msg += "のターンです。";
                    }
                }
            }
        } else {
            window.status = pos + "には置けません";
            pos = -1;
        }
        // 描画
        this.draw(this.cell, this.turn, pos);

        if (msg) {
            alert(msg);
        }
    },

    /** ゲームオーバー処理
     *
     * @param bool    kind    終了方法    0: 通常, 1投了
     * @return string        終了メッセージ
     */
    gameOver: function(kind) {
        var msg = "";

        // インターバルタイマー停止
        clearInterval(this.tid);
        this.tid = null;

        if (kind == 0) {
            msg = "ゲーム終了です。";

            var discs = this.discs(this.cell);

            if (discs[0] > discs[1]) {
                msg += discs[0] + "対" + discs[1] + "で" + this.getPlayerName(1) + "の勝利です。";
            } else if (discs[0] < discs[1]) {
                msg += discs[0] + "対" + discs[1] + "で" + this.getPlayerName(2) + "の勝利です。";
            } else {
                msg += "引き分けです。";
            }
        } else {
            msg = "投了でゲーム終了です。";
            msg += _self.getPlayerName((this.turn % 2) ? 1 : 2);
            msg += "の勝利です。";
        }
        return msg;
    },

    /** プレイヤー名の取得
     *
     * @param number    id    1でplayer1を,2でplayer2の名前を返します
     */
    getPlayerName: function(id) {
        var e = $("player" + id);
        return e.options[e.selectedIndex].text;
    },

    /** 1手指す
     *
     * discを設置し挟んだ敵のdiscを全て裏返す
     *
     * @param array        cell        セルの配列です。
     * @param number    disc        味方のdiscを指定します。
     * @param number    pos            discの位置を0以上の値で指定します。
     */
    moveDisc: function(cell, disc, pos) {
        cell[pos] = disc; // 指定位置にdiscを設置
        for (var i = 0; i < this.NEWS.length; ++i) {
            this.getCompassScore(cell, disc, pos, this.NEWS[i]) && this.reverseDisc(cell, disc, pos, this.NEWS[i]);
        }
    },
    /** discを裏返す
     *
     * @param array        cell    セルの配列です。
     * @param number    disc    味方のdiscを指定します。
     * @param number    pos        discの位置を0以上の値で指定します。
     * @param array        bias    [横方向の増減値,縦方向の増減値] を指定します。
     */
    reverseDisc: function(cell, disc, pos, bias) {
        var x = this.toX(pos), y = this.toY(pos);
        while (1) {
            x += bias[0];
            y += bias[1];
            if (cell[this.toPos(x,y)] == disc) { // 味方のdiscに会ったら終了
                break;
            }
            cell[this.toPos(x,y)] = disc; // 敵のdiscは裏返す
        }
    },
    /** 黒と白のdisc数を返す
     *
     * @param array        cell    セルの配列です。
     * @return array            [黒,白]
     */
    discs: function(cell) {
        var i, rv = [0,0];
        for (i = 0; i < cell.length; ++i) {
            rv[0] += (cell[i] == this.BLACK) ? 1 : 0;
            rv[1] += (cell[i] == this.WHITE) ? 1 : 0;
        }
        return rv;
    },
    /** 得点の列挙
     *
     * 左上から順番にdiscの周囲8方向について、
     * 取得可能なdisc数をカウントし配列を返します。
     *
     * @param array        cell        セルの配列です。
     * @param number    disc        味方のdiscを指定します。
     * @param bool        haveZero    ゼロ点のセルを含めない場合にtrueを指定します。
     * @return array                得点の配列を返します。ゼロは設置できないことを意味します。
     *                                [セル0の得点,セル1の得点,..]
     */
    enumScore: function(cell, disc, skipZero) {
        skipZero = skipZero || false;
        var i, score, rv = [];
        for (i = 0; i < cell.length; ++i) {
            score = this.getScore(cell, disc, i);
            if (skipZero && !score) {
                ;
            } else {
                rv.push(score);
            }
        }
        return rv;
    },
    /** ある座標の得点を返す
     *
     * @param array        cell        セルの配列です。
     * @param number    disc        味方のdiscを指定します。
     * @param number    pos            セルの位置を0以上の値で指定します。
     * @return number                得点を返します。0ならdiscを設置できないセルです。
     */
    getScore: function(cell, disc, pos) {
        var i, rv = 0;
        if ((cell[pos] & this.ABLE_MASK) == this.EMPTY) { // disc未設置なら得点を調べる
            for (i = 0; i < this.NEWS.length; ++i) {
                rv += this.getCompassScore(cell, disc, pos, this.NEWS[i]);
            }
        }
        return rv;
    },
    /** ある方向の得点を返す
     *
     * @param array        cell        セルの配列です。
     * @param number    disc        味方のdiscを指定します。
     * @param number    pos            セルの位置を0以上の値で指定します。
     * @param array        bias        [横方向の増減値,縦方向の増減値] を指定します。
     * @return number                得点を返します。
     *                                見つからない場合や範囲外の場合は0を返します。
     */
    getCompassScore: function(cell, disc, pos, bias) {
        var rv = 0, next = (disc == this.BLACK) ? this.WHITE : this.BLACK;
        var x = this.toX(pos), y = this.toY(pos);
        while (1) {
            x += bias[0];
            y += bias[1];
            if (x < 0 || x >= this.cellSize) { return 0; } // miss hit
            if (y < 0 || y >= this.cellSize) { return 0; } // miss hit
            if (cell[this.toPos(x,y)] == next)    { ++rv; continue; }    // hit
            if (cell[this.toPos(x,y)] == disc)    { return rv; }        // end

            return 0; // EMPTY, ABLEなら得点ゼロで終了
        }
    },

    /** パス(どこも指せない)ならtrue
     * @param array scores    enumScore()が返す配列を指定します。
     * @return bool            どこにも指せない場合にtrueを返します。
     */
    isPass: function(scores) {
        for (var i = 0; i < scores.length; ++i) {
            if (scores[i]) {
                return false;
            }
        }
        return true;
    },
    toDisc: function(turn)        { return (turn % 2 == 0) ? this.BLACK : this.WHITE; },
    toPos: function(x, y)        { return this.cellSize * y + x; },
    toX: function(pos)            { return pos % this.cellSize; },
    toY: function(pos)            { return Math.floor(pos / this.cellSize); },

    /** 描画
     *
     * @param array        cell    セルの配列です。
     * @param number    turn    ターンです。
     * @param number    markPos    discを置いたセルの位置を0以上の値で指定するとマーキングします。
     *                            -1を指定するとマーキングしません。
     */
    draw: function(cell, turn, markPos) {
        var img = { 0: "empty", 1: "black", 2: "white", 4: "able" };
        var mode = $("hintMode");
        var hintColor = !!(parseInt(mode.options[mode.selectedIndex].value) & 0x1); // ヒントを色で表示
        var hintScore = !!(parseInt(mode.options[mode.selectedIndex].value) & 0x2); // ヒントを得点で表示
        var scores = this.enumScore(cell, this.toDisc(turn));
        var x, y, pos, s = [];
        var id = "", className = "", handler = "", nodeValue = "";
        for (y = 0; y < this.cellSize; ++y) {
            s.push("<tr>");
            for (x = 0; x < this.cellSize; ++x) {
                pos            = this.toPos(x, y);
                id            = " id=\"cell" + pos + "\"";
                if (markPos == pos) {
                    className    = " class=\"" + img[(hintColor && scores[pos]) ? this.ABLE : cell[pos] & 0x03] + " mark\""; // ヒントカラー + マーク
                } else {
                    className    = " class=\"" + img[(hintColor && scores[pos]) ? this.ABLE : cell[pos] & 0x03] + "\""; // ヒントカラー
                }
                handler        = " onclick=\"game.onclick(" + pos + ")\"";
                nodeValue    = (hintScore && scores[pos]) ? scores[pos] : " "; // score表示
//                s.push("<td" + id + className + handler + ">" + nodeValue + " " + pos + "</td>");
                s.push("<td" + id + className + handler + ">" + nodeValue + "</td>");
            }
            s.push("</tr>");
        }
        $("layer0").innerHTML = s.join("");

        // SCOREを表示
        var discs = this.discs(cell);
        $("blackScore").innerHTML = discs[0];
        $("whiteScore").innerHTML = discs[1];

        // next turn
        $("turn").setAttribute('class', (turn % 2) ? "white" : "black");
    }
};

window.onload = boot;
