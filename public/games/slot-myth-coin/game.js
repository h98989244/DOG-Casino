// ==================== 遊戲配置 ====================
const CONFIG = {
    // RTP 設定
    RTP: 0.96,

    // 基本設定
    REELS: 5,
    ROWS: 3,
    WAYS: 243, // 3^5 = 243 ways

    // Symbol 定義(金額型)
    SYMBOLS: {
        GOLD_HIGH: { icon: '💰', values: [3500, 1400, 350, 70], weight: 5 },
        GOLD_MID: { icon: '🪙', values: [1400, 700, 175, 35], weight: 8 },
        GOLD_LOW: { icon: '🏆', values: [700, 350, 140, 28], weight: 12 },
        COIN_HIGH: { icon: '💎', values: [350, 175, 70, 14], weight: 15 },
        COIN_MID: { icon: '💵', values: [175, 88, 35, 7], weight: 20 },
        COIN_LOW: { icon: '🎁', values: [88, 44, 18, 4], weight: 25 },
        WILD: { icon: '⚡', values: [0, 0, 0, 0], weight: 8, isWild: true },
        SCATTER: { icon: '🔱', values: [0, 0, 0, 0], weight: 7, isScatter: true }
    },

    // Jackpot 初始值
    JACKPOT: {
        GRAND: 50000,
        MAJOR: 10000,
        MAXI: 5000,
        MINOR: 1000,
        MINI: 100
    },

    // Jackpot 增長速率(每次 Spin)
    JACKPOT_INCREMENT: {
        GRAND: 0.5,
        MAJOR: 0.3,
        MAXI: 0.2,
        MINOR: 0.1,
        MINI: 0.05
    },

    // Free Game 設定
    FREE_GAME: {
        TRIGGER_SCATTERS: 3,
        INITIAL_SPINS: 6,
        RESET_SPINS: 6
    },

    // 押注選項
    BET_OPTIONS: [10, 50, 100, 200, 500, 1000, 2000]
};

// ==================== 主遊戲類 ====================
class SlotGame {
    constructor() {
        this.balance = 10000;
        this.bet = 100;
        this.currentBetIndex = 2;
        this.isSpinning = false;
        this.isAutoSpin = false; // 自動旋轉狀態
        this.totalWin = 0;

        // Free Game 狀態
        this.inFreeGame = false;
        this.freeGameCurrent = 0;
        this.freeGameTotal = 0;
        this.lockedSymbols = []; // 5x3 陣列，記錄鎖定狀態

        // Jackpot
        this.jackpots = { ...CONFIG.JACKPOT };

        this.initReels();
        this.updateDisplay();
        this.startJackpotIncrement();
    }

    // 初始化轉軸
    initReels() {
        const container = document.getElementById('reelsContainer');
        container.innerHTML = '';

        this.lockedSymbols = [];

        for (let i = 0; i < CONFIG.REELS; i++) {
            this.lockedSymbols[i] = [null, null, null];

            const reel = document.createElement('div');
            reel.className = 'reel';

            const reelWindow = document.createElement('div');
            reelWindow.className = 'reel-window';

            const strip = document.createElement('div');
            strip.className = 'reel-strip';
            strip.id = `strip-${i}`;

            // 創建足夠的符號
            for (let j = 0; j < 30; j++) {
                strip.appendChild(this.createSymbolElement(this.getRandomSymbol()));
            }

            reelWindow.appendChild(strip);
            reel.appendChild(reelWindow);
            container.appendChild(reel);
        }
    }

    // 創建符號元素
    createSymbolElement(symbolData) {
        const symbol = document.createElement('div');
        symbol.className = 'symbol';

        const icon = document.createElement('div');
        icon.className = 'symbol-icon';
        icon.textContent = symbolData.icon;

        const value = document.createElement('div');
        value.className = 'symbol-value';

        // 只有非特殊符號顯示數值
        if (!symbolData.isWild && !symbolData.isScatter && symbolData.values) {
            // 隨機選擇一個數值(從最高到最低)
            const randomValue = symbolData.values[Math.floor(Math.random() * symbolData.values.length)];
            value.textContent = randomValue;
            symbol.dataset.value = randomValue;
        } else {
            value.textContent = symbolData.isWild ? 'WILD' : symbolData.isScatter ? 'SCATTER' : '';
        }

        symbol.dataset.type = symbolData.icon;
        symbol.appendChild(icon);
        symbol.appendChild(value);

        return symbol;
    }

    // 根據權重獲取隨機符號
    getRandomSymbol() {
        const weightedSymbols = [];
        Object.values(CONFIG.SYMBOLS).forEach(symbol => {
            for (let i = 0; i < symbol.weight; i++) {
                weightedSymbols.push(symbol);
            }
        });
        return weightedSymbols[Math.floor(Math.random() * weightedSymbols.length)];
    }

    // 押注控制
    increaseBet() {
        if (this.isSpinning || this.inFreeGame || this.isAutoSpin) return;
        if (this.currentBetIndex < CONFIG.BET_OPTIONS.length - 1) {
            this.currentBetIndex++;
            this.bet = CONFIG.BET_OPTIONS[this.currentBetIndex];
            this.updateDisplay();
        }
    }

    decreaseBet() {
        if (this.isSpinning || this.inFreeGame || this.isAutoSpin) return;
        if (this.currentBetIndex > 0) {
            this.currentBetIndex--;
            this.bet = CONFIG.BET_OPTIONS[this.currentBetIndex];
            this.updateDisplay();
        }
    }

    // 更新顯示
    updateDisplay() {
        document.getElementById('balance').textContent = Math.floor(this.balance);
        document.getElementById('current-bet').textContent = this.bet;
        document.getElementById('betDisplay').textContent = this.bet;
        document.getElementById('total-win').textContent = Math.floor(this.totalWin);

        // 更新 Jackpot 顯示
        Object.keys(this.jackpots).forEach(key => {
            const el = document.getElementById(`jackpot-${key.toLowerCase()}`);
            if (el) {
                this.animateNumber(el, this.jackpots[key]);
            }
        });

        // Free Game 計數器
        if (this.inFreeGame) {
            document.getElementById('freeGameCounter').classList.add('active');
            document.getElementById('freeGameValue').textContent =
                `${this.freeGameCurrent} / ${this.freeGameTotal}`;
        } else {
            document.getElementById('freeGameCounter').classList.remove('active');
        }
    }

    // 數字動畫
    animateNumber(element, targetValue, duration = 500) {
        const start = parseFloat(element.textContent) || 0;
        const end = targetValue;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const current = start + (end - start) * progress;
            element.textContent = Math.floor(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    // Jackpot 自動增長
    startJackpotIncrement() {
        setInterval(() => {
            Object.keys(this.jackpots).forEach(key => {
                this.jackpots[key] += CONFIG.JACKPOT_INCREMENT[key] * this.bet / 100;
            });
            this.updateDisplay();
        }, 1000);
    }

    // 主旋轉函數
    async spin() {
        if (this.isSpinning) return;

        // 檢查餘額
        if (!this.inFreeGame && this.balance < this.bet) {
            alert('餘額不足！');
            return;
        }

        this.isSpinning = true;
        document.getElementById('spinBtn').disabled = true;

        // 扣除押注(Free Game 除外)
        if (!this.inFreeGame) {
            this.balance -= this.bet;
            this.totalWin = 0;
            this.updateDisplay();
        }

        // 開始旋轉動畫
        await this.startSpinAnimation();

        // 生成結果
        const result = this.generateResult();

        // 顯示結果
        await this.showResult(result);

        // 計算獎金(243 WAYS)
        const winData = this.calculateWays(result);

        if (winData.totalWin > 0) {
            await this.showWin(winData);
        }

        // 檢查 Scatter(觸發 Free Game)
        const scatterCount = this.countScatters(result);
        if (scatterCount >= CONFIG.FREE_GAME.TRIGGER_SCATTERS && !this.inFreeGame) {
            await this.triggerFreeGame();
        }

        // Free Game 邏輯
        if (this.inFreeGame) {
            await this.handleFreeGameLogic(result);
        }

        this.isSpinning = false;
        document.getElementById('spinBtn').disabled = false;

        // 自動旋轉邏輯
        if (this.isAutoSpin && !this.inFreeGame && this.balance >= this.bet) {
            setTimeout(() => this.spin(), 1000);
        } else if (this.isAutoSpin && (this.balance < this.bet)) {
            // 餘額不足，自動停止
            this.toggleAuto();
        }
    }

    // 旋轉動畫
    async startSpinAnimation() {
        const strips = document.querySelectorAll('.reel-strip');

        // 只旋轉未鎖定的軸
        strips.forEach((strip, index) => {
            if (this.inFreeGame) {
                // 檢查此軸是否有任何鎖定
                const hasLocked = this.lockedSymbols[index].some(s => s !== null);
                if (hasLocked) return; // 跳過有鎖定符號的軸
            }
            strip.classList.add('spinning');
        });

        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // 生成結果
    generateResult() {
        const result = [];
        for (let i = 0; i < CONFIG.REELS; i++) {
            const reelSymbols = [];
            for (let j = 0; j < CONFIG.ROWS; j++) {
                // Free Game：使用鎖定的符號或生成新符號
                if (this.inFreeGame && this.lockedSymbols[i][j]) {
                    reelSymbols.push(this.lockedSymbols[i][j]);
                } else {
                    const symbolData = this.getRandomSymbol();
                    const symbolElement = this.createSymbolElement(symbolData);
                    reelSymbols.push({
                        icon: symbolData.icon,
                        value: symbolElement.dataset.value || 0,
                        isWild: symbolData.isWild,
                        isScatter: symbolData.isScatter
                    });
                }
            }
            result.push(reelSymbols);
        }
        return result;
    }

    // 顯示結果
    async showResult(result) {
        for (let i = 0; i < CONFIG.REELS; i++) {
            const strip = document.getElementById(`strip-${i}`);
            strip.classList.remove('spinning');

            const symbols = strip.querySelectorAll('.symbol');
            for (let j = 0; j < CONFIG.ROWS; j++) {
                const symbolData = result[i][j];

                if (symbols[j]) {
                    symbols[j].querySelector('.symbol-icon').textContent = symbolData.icon;
                    symbols[j].querySelector('.symbol-value').textContent =
                        symbolData.isWild ? 'WILD' :
                            symbolData.isScatter ? 'SCATTER' :
                                symbolData.value || '';
                    symbols[j].dataset.type = symbolData.icon;
                    symbols[j].dataset.value = symbolData.value || 0;
                    symbols[j].classList.remove('winning', 'locked');

                    // 顯示鎖定標記
                    if (this.lockedSymbols[i][j]) {
                        symbols[j].classList.add('locked');
                        const lockIndicator = symbols[j].querySelector('.lock-indicator') ||
                            document.createElement('div');
                        lockIndicator.className = 'lock-indicator';
                        lockIndicator.textContent = '🔒';
                        if (!symbols[j].querySelector('.lock-indicator')) {
                            symbols[j].appendChild(lockIndicator);
                        }
                    }
                }
            }

            strip.style.transform = 'translateY(0)';
            await new Promise(resolve => setTimeout(resolve, 150));
        }
    }

    // 計算 243 WAYS 獎金
    calculateWays(result) {
        let totalWin = 0;
        const winningSymbols = [];

        // 從第一軸開始，計算所有可能的連線
        const firstReelSymbols = new Set();
        result[0].forEach(sym => {
            if (!sym.isScatter) {
                firstReelSymbols.add(sym.isWild ? 'WILD' : sym.icon);
            }
        });

        firstReelSymbols.forEach(baseSymbol => {
            let consecutiveReels = 1;
            const matchedPositions = [[0, 1, 2]]; // 第一軸所有位置

            // 檢查後續軸
            for (let reel = 1; reel < CONFIG.REELS; reel++) {
                const matchingRows = [];

                result[reel].forEach((sym, row) => {
                    if (sym.isWild || (!sym.isScatter && sym.icon === baseSymbol)) {
                        matchingRows.push(row);
                    }
                });

                if (matchingRows.length > 0) {
                    consecutiveReels++;
                    matchedPositions.push(matchingRows);
                } else {
                    break;
                }
            }

            // 至少 3 軸才算中獎
            if (consecutiveReels >= 3) {
                // 計算所有 ways 的組合數
                let ways = 1;
                matchedPositions.forEach(positions => {
                    ways *= positions.length;
                });

                // 計算此連線的總獎金
                const symbolValue = this.getSymbolValue(result, baseSymbol, matchedPositions);
                const lineWin = symbolValue * ways;
                totalWin += lineWin;

                // 記錄中獎位置
                matchedPositions.forEach((rows, reelIndex) => {
                    rows.forEach(row => {
                        winningSymbols.push({ reel: reelIndex, row });
                    });
                });
            }
        });

        return { totalWin, winningSymbols };
    }

    // 獲取符號數值(從實際盤面)
    getSymbolValue(result, baseSymbol, matchedPositions) {
        let totalValue = 0;
        let count = 0;

        matchedPositions.forEach((rows, reelIndex) => {
            rows.forEach(row => {
                const sym = result[reelIndex][row];
                if (!sym.isWild && !sym.isScatter) {
                    totalValue += parseFloat(sym.value) || 0;
                    count++;
                }
            });
        });

        return count > 0 ? totalValue / count : 0;
    }

    // 計算 Scatter 數量
    countScatters(result) {
        let count = 0;
        result.forEach(reel => {
            reel.forEach(sym => {
                if (sym.isScatter) count++;
            });
        });
        return count;
    }

    // 顯示獎金
    async showWin(winData) {
        const { totalWin, winningSymbols } = winData;

        // 標記中獎符號
        winningSymbols.forEach(({ reel, row }) => {
            const strip = document.getElementById(`strip-${reel}`);
            const symbols = strip.querySelectorAll('.symbol');
            if (symbols[row]) {
                symbols[row].classList.add('winning');
            }
        });

        // 動畫累加獎金
        const finalWin = totalWin * this.bet;
        this.totalWin += finalWin;
        this.balance += finalWin;

        await this.animateWinAmount(finalWin);
        this.updateDisplay();

        // 檢查大獎
        if (finalWin >= this.bet * 50) {
            await this.showEvent('BIG WIN', 'bigwin');
            this.createParticles('coin');
        }

        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Win 金額動畫
    async animateWinAmount(amount) {
        const el = document.getElementById('winAmount');
        const duration = 1000;
        const steps = 30;
        const increment = amount / steps;

        for (let i = 0; i <= steps; i++) {
            el.textContent = `+${Math.floor(increment * i)}`;
            await new Promise(resolve => setTimeout(resolve, duration / steps));
        }

        el.textContent = `+${Math.floor(amount)}`;
    }

    // 顯示事件 Overlay
    async showEvent(text, className) {
        const overlay = document.getElementById('eventOverlay');
        const eventText = document.getElementById('eventText');

        eventText.textContent = text;
        eventText.className = `event-text ${className}`;
        overlay.classList.add('show');

        document.getElementById('slotMachine').classList.add('shake');
        this.createParticles('lightning');

        await new Promise(resolve => setTimeout(resolve, 3000));

        overlay.classList.remove('show');
        document.getElementById('slotMachine').classList.remove('shake');
    }

    // 創建粒子效果
    createParticles(type) {
        const particleCount = type === 'coin' ? 30 : 15;
        const particleIcon = type === 'coin' ? '💰' : '⚡';

        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = `particle ${type}`;
                particle.textContent = particleIcon;
                particle.style.left = (Math.random() * window.innerWidth) + 'px';
                particle.style.top = (window.innerHeight / 2) + 'px';
                document.body.appendChild(particle);

                setTimeout(() => particle.remove(), 2000);
            }, i * 100);
        }
    }

    // 觸發 Free Game
    async triggerFreeGame() {
        this.inFreeGame = true;
        this.freeGameCurrent = CONFIG.FREE_GAME.INITIAL_SPINS;
        this.freeGameTotal = CONFIG.FREE_GAME.INITIAL_SPINS;

        await this.showEvent('FREE GAME!', 'major');
        this.updateDisplay();
    }

    // Free Game 邏輯
    async handleFreeGameLogic(result) {
        // 檢查是否有新的金額符號
        let hasNewValues = false;

        result.forEach((reel, reelIndex) => {
            reel.forEach((sym, row) => {
                if (!sym.isWild && !sym.isScatter && sym.value > 0) {
                    if (!this.lockedSymbols[reelIndex][row]) {
                        this.lockedSymbols[reelIndex][row] = sym;
                        hasNewValues = true;
                    }
                }
            });
        });

        // 如果有新金額，重置回合數
        if (hasNewValues) {
            this.freeGameCurrent = CONFIG.FREE_GAME.RESET_SPINS;
            this.freeGameTotal = CONFIG.FREE_GAME.RESET_SPINS;
        }

        this.freeGameCurrent--;
        this.updateDisplay();

        // Free Game 結束
        if (this.freeGameCurrent <= 0) {
            await this.endFreeGame();
        }
    }

    // 結束 Free Game
    async endFreeGame() {
        // 計算所有鎖定符號的總金額
        let totalValue = 0;
        this.lockedSymbols.forEach(reel => {
            reel.forEach(sym => {
                if (sym && sym.value) {
                    totalValue += parseFloat(sym.value);
                }
            });
        });

        const finalWin = totalValue * this.bet;
        this.balance += finalWin;
        this.totalWin += finalWin;

        await this.showEvent(`TOTAL WIN: ${Math.floor(finalWin)}`, 'bigwin');

        // 檢查 Jackpot 觸發
        await this.checkJackpotTrigger(totalValue);

        // 重置
        this.inFreeGame = false;
        this.lockedSymbols = [];
        this.initReels();
        this.updateDisplay();
    }

    // 檢查 Jackpot 觸發
    async checkJackpotTrigger(totalValue) {
        // 簡單機率判定(可自行調整)
        const rand = Math.random();

        if (totalValue >= 10000 && rand < 0.1) {
            await this.triggerJackpot('GRAND');
        } else if (totalValue >= 5000 && rand < 0.2) {
            await this.triggerJackpot('MAJOR');
        } else if (totalValue >= 2000 && rand < 0.3) {
            await this.triggerJackpot('MAXI');
        }
    }

    // 觸發 Jackpot
    async triggerJackpot(level) {
        const amount = this.jackpots[level];
        this.balance += amount;

        await this.showEvent(`${level} JACKPOT!`, level.toLowerCase());

        // 重置 Jackpot
        this.jackpots[level] = CONFIG.JACKPOT[level];
        this.updateDisplay();
    }

    // 切換自動旋轉
    toggleAuto() {
        if (this.isSpinning || this.inFreeGame) return;

        this.isAutoSpin = !this.isAutoSpin;
        const btn = document.getElementById('autoBtn');

        if (this.isAutoSpin) {
            btn.classList.add('active');
            btn.textContent = '停止自動';
            // 立即開始第一次旋轉
            if (!this.isSpinning) {
                this.spin();
            }
        } else {
            btn.classList.remove('active');
            btn.textContent = '自動旋轉';
        }
    }
}

// ==================== 初始化遊戲 ====================
// 全域變數，供 HTML 使用
let game;

// 初始化函數
function initGame() {
    game = new SlotGame();
}

// 防止右鍵
document.addEventListener('contextmenu', e => e.preventDefault());
