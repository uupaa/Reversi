
function class_othello_cpu(game, cellSize, player1, player2) {
	this.game = game;
	this.cellSize = cellSize;
	this.cpuBlackLevel	= player1;		// CPU-BLACK LEVEL(最弱が1)
	this.cpuWhiteLevel	= player2;		// CPU-WHITE LEVEL(最弱が1)
}

/* CPUロジック
 *
 * 1) 自分が打てる場所を増やす
 * 2) 相手が打てる場所を減らす
 * 3) 隅は最優先
 * 4) 隅の１つ内側は最低
 * 5) 中盤は、discを少なくする
 * 6) 中盤は1石だけ返す手を優先
 *
 */

/*
 * 最後の2手以内なら最も多く取れるコマを取る
 */


class_othello_cpu.prototype = {

	think: function(cell, turn) {
		var lv = (turn % 2) ? this.cpuWhiteLevel : this.cpuBlackLevel
		switch (lv) {
		case 1:
			return this.level1(cell.copy(), turn);
		case 2:
			return this.level2(cell.copy(), turn);
		case 3:
			return this.level3(cell.copy(), turn);
		}
		return -1;
	},

	toDisc: function(turn)				{ return this.game.toDisc(turn); },
	toPos: function(x, y)				{ return this.game.toPos(x, y); },
	moveDisc: function(cell, disc, pos)	{ this.game.moveDisc(cell, disc, pos); },
	draw: function(cell, turn, markPos)	{ this.game.draw(cell, turn, markPos); },
	enumScore: function(cell, disc, skipZero) {
		return this.game.enumScore(cell, disc, skipZero);
	},
	getScore: function(cell, disc, pos) {
		return this.game.getScore(cell, disc, pos);
	},

	/** 名前付きのセルの座標を取得
	 *
	 * KCABBACK
	 * CX    XC
	 * A      A
	 * B      B
	 * B      A
	 * A      A
	 * CX    XC
	 * KCABBACK
	 */
	getNamedCellPosition: function() {
		var w = this.cellSize - 1;
		return {
			// 角
			"K":		[	this.toPos(0,0),	this.toPos(w,0),
							this.toPos(0,w),	this.toPos(w,w)],
			// 角の隣(危険)
			"C":		[	this.toPos(1,0),	this.toPos(w-1,0),
							this.toPos(0,1),	this.toPos(w,1),
							this.toPos(0,w-1),	this.toPos(w,w-1),
							this.toPos(1,w),	this.toPos(w-1,w)],
			// 角の斜め隣(最も危険)
			"X":		[	this.toPos(1,1),	this.toPos(w-1,1),
							this.toPos(1,w-1),	this.toPos(w-1,w-1)],
			// Cの隣(様子見)
			"A":		[	this.toPos(2,0),	this.toPos(w-2,0),
							this.toPos(0,2),	this.toPos(w,2),
							this.toPos(0,w-2),	this.toPos(w,w-2),
							this.toPos(2,w),	this.toPos(w-2,w)],
			// Aの隣(取れるなら取っとけ)
			"B":		[	this.toPos(3,0),	this.toPos(w-3,0),
							this.toPos(0,3),	this.toPos(w,3),
							this.toPos(0,w-3),	this.toPos(w,w-3),
							this.toPos(3,w),	this.toPos(w-3,w)]
		};
	},

	/** サイドラインならtrue
	 * @param number	pos			discの位置を0以上の値で指定します。
	 */
	isSideLine: function(pos) {
		return this.isVerticalLine(pos) || this.isHorizontalLine(pos);
	},
	/** 垂直ラインならtrue
	 * @param number	pos			discの位置を0以上の値で指定します。
	 */
	isVerticalLine: function(pos) {
		var w = this.cellSize - 1;
		if ((pos % this.cellSize) == 0) { // pos: 8,16,24,32,40,48
			return true;
		}
		if ((pos % this.cellSize) == w) { // pos: 15,23,31,39,47,55
			return true;
		}
		return false;
	},
	/** 水平ラインならtrue
	 * @param number	pos			discの位置を0以上の値で指定します。
	 */
	isHorizontalLine: function(pos) {
		var w = this.cellSize - 1;
		if (pos <= w) {	// pos: 0～7
			return true;
		}
		if (pos >= this.cellSize * w) { // pos: 8*7 = 56～53
			return true;
		}
		return false;
	},
	inUpLine: function(pos) {
		var w = this.cellSize - 1;
		if (pos <= w) {	// pos: 0～7
			return true;
		}
		return false;
	},
	inBottomLine: function(pos) {
		if (pos >= this.cellSize * w) { // pos: 8*7 = 56～53
			return true;
		}
		return false;
	},
	inLeftLine: function(pos) {
		var w = this.cellSize - 1;
		if ((pos % this.cellSize) == 0) { // pos: 8,16,24,32,40,48
			return true;
		}
		return false;
	},
	inRightLine: function(pos) {
		if ((pos % this.cellSize) == w) { // pos: 15,23,31,39,47,55
			return true;
		}
		return false;
	},

	/** CPUロジック(Level1:最弱)
	 *
	 * 主要ロジック
	 * (1) 適当(ランダム)にdiscを設置
	 */
	level1: function(cell, turn) {
		var i, scores = this.enumScore(cell, this.toDisc(turn)); // 得点を列挙
		var candidate = [];
		for (i = 0; i < scores.length; ++i) {
			if (scores[i]) {
				candidate.push(i); // 得点可能な場所を候補として列挙
			}
		}
		// 列挙済みの候補からランダムに選定
		var pos = Math.floor(Math.random() * candidate.length);
		return candidate[pos];
	},

	/** CPUロジック(Level2)
	 *
	 * 主要ロジック
	 * (1) 盤面における各セルを事前に重み付け
	 * (2) 自分が打てる場所を増やし、相手が打てる場所を減らす
	 * (3) 重みが同じセルが複数ある場合は、ランダムに選択する
	 *
	 * 序盤は (2) + (3) の打ち方を行う
	 * 中盤や終盤は (2) の打ちかたを行う
	 * discの数を意識していないため詰めが甘い
	 */
	level2: function(cell, turn) {
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

		if (1) {
			// (1) K, A, B は高評価, C, X は低評価
			for (i = 0; i < candidate.length; ++i) {
				weight[i] = 20; // 重み20で初期化
				for (j = 0; j < named.K.length; ++j) { weight[i] += (named.K[j] == candidate[i][0]) ?  20 : 0; }
				for (j = 0; j < named.A.length; ++j) { weight[i] += (named.A[j] == candidate[i][0]) ?   2 : 0; }
				for (j = 0; j < named.B.length; ++j) { weight[i] += (named.B[j] == candidate[i][0]) ?   4 : 0; }
				for (j = 0; j < named.C.length; ++j) { weight[i] += (named.C[j] == candidate[i][0]) ? -10 : 0; }
				for (j = 0; j < named.X.length; ++j) { weight[i] += (named.X[j] == candidate[i][0]) ? -20 : 0; }
			}
			// (2) 自分が打てる場所を増やし、相手が打てる場所を減らす
			for (i = 0; i < candidate.length; ++i) {
				var nextCell = cell.copy(); // コピー

				virtualCandidate[0] = [ this.enumScore(cell, this.toDisc(turn), true).length,			// friend
										this.enumScore(cell, this.toDisc(turn+1), true).length ];		// enemy
				this.moveDisc(nextCell, this.toDisc(turn), candidate[i][0]); // 一手仮打
				virtualCandidate[1] = [ this.enumScore(nextCell, this.toDisc(turn), true).length,		// friend
										this.enumScore(nextCell, this.toDisc(turn+1), true).length ];	// enemy

				// 味方が打てる場所が増えているなら重み付け
				if (virtualCandidate[0][0] <= virtualCandidate[1][0]) {
					weight[i] += Math.abs(virtualCandidate[0][0] - virtualCandidate[1][0]);
				}
				// 敵が打てる場所が減っているなら重み付け
				if (virtualCandidate[0][1] > virtualCandidate[1][1]) {
					weight[i] += Math.abs(virtualCandidate[0][1] - virtualCandidate[1][1]);
				}
			}
			// (3) 重みが同じセルが複数ある場合は、ランダムに選択する
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
				pos = weight.firstMaxValuesIndex(); // 最も重みが高いセルの添え字を返す
			}
		}
		return candidate[pos][0];
	},

	/** CPUロジック(Level3)
	 *
	 * 主要ロジック
	 * (1) 盤面における各セルを事前に重み付け
	 * (2) 自分が打てる場所を増やし、相手が打てる場所を減らす
	 * (3) 取得可能なdisc数を評価する
	 * (4) サイドラインの得点を高く評価する
	 * (5) 序盤, 中盤, 終盤で打ちかたを変える
	 * (6) 重みが同じセルが複数ある場合は、ランダムに選択する
	 *
	 * 序盤は(2) + (6)の打ち方を行う
	 * 中盤は(2) + (4) + (6)の打ち方を行う
	 * 終盤は(2) + (3) + (4) + (6)の打ち方を行う
	 */
	level3: function(cell, turn) {
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

			virtualCandidate[0] = [ this.enumScore(cell, this.toDisc(turn), true).length,			// friend
									this.enumScore(cell, this.toDisc(turn+1), true).length ];		// enemy
			this.moveDisc(nextCell, this.toDisc(turn), candidate[i][0]); // 一手仮打
			virtualCandidate[1] = [ this.enumScore(nextCell, this.toDisc(turn), true).length,		// friend
									this.enumScore(nextCell, this.toDisc(turn+1), true).length ];	// enemy

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
			/* ▼ */
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
	},

	/** CPUロジック(Level4)
	 *
	 * 主要ロジック
	 * (1) 盤面における各セルを事前に重み付け
	 * (2) 自分が打てる場所を増やし、相手が打てる場所を減らす
	 * (3) 一石取りやパーフェクトムーブを高く評価する
	 * (4) 取得可能なdisc数を考慮する
	 * (5) 重みが同じセルが複数ある場合は、ランダムに選択する
	 * (6) 序盤, 中盤, 終盤で打ちかたを変える
	 *
	 * 序盤は(2) + (5)の打ち方を行う
	 * 中盤は(2) + (3)の打ち方を行う
	 * 終盤は(2) + (4)の打ち方を行う
	 */
	level4: function(cell, turn) {
		// 未実装
		return -1;
	}
};

