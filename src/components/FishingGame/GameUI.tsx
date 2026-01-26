import React, { useState } from 'react';
import { Utils } from '../../game/fishing/Utils';

interface GameUIProps {
    balance: number;
    currentBet: number;
    vipLevel: number;
    isAutoFire: boolean;
    isLocked: boolean;
    onToggleAutoFire: () => void;
    onToggleLock: () => void;
    onChangeBet: (delta: number) => void;
    onRecharge: (amount: number) => void;
    onClaimDaily: () => void;
    onExit: () => void;
    toastMessage: string | null;
}

export const GameUI: React.FC<GameUIProps> = ({
    balance,
    currentBet,
    vipLevel,
    isAutoFire,
    isLocked,
    onToggleAutoFire,
    onToggleLock,
    onChangeBet,
    onRecharge,
    onClaimDaily,
    onExit,
    toastMessage
}) => {
    const [activeModal, setActiveModal] = useState<string | null>(null);

    // Settings mock state
    const [bgmVolume, setBgmVolume] = useState(70);
    const [sfxVolume, setSfxVolume] = useState(80);

    // Recharge Packages Mock
    const packages = [
        { id: 1, coins: 6000, price: 30, bonus: 0 },
        { id: 2, coins: 30000, price: 150, bonus: 2000, isPopular: true },
        { id: 3, coins: 98000, price: 490, bonus: 10000 },
        { id: 4, coins: 198000, price: 990, bonus: 30000, isVip: true },
        { id: 5, coins: 648000, price: 3290, bonus: 100000, isVip: true },
        { id: 6, coins: 1280000, price: 6490, bonus: 250000, isVip: true },
    ];

    const closeModal = () => setActiveModal(null);

    return (
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden font-sans">

            {/* Top UI */}
            <div className="absolute top-0 left-0 right-0 h-16 flex justify-between items-start p-4 pointer-events-auto z-10">

                {/* Activity Bar */}
                <div className="flex items-center gap-2 max-w-[60%]">
                    <button
                        onClick={onExit}
                        className="bg-red-600 text-white px-3 py-1 rounded border border-red-400 font-bold hover:bg-red-700 active:scale-95 transition-all text-sm shadow-md"
                    >
                        退出
                    </button>
                    <div className="flex items-center bg-black/60 rounded-full px-4 py-1 border border-[#ffd70066] overflow-hidden flex-1">
                        <span className="text-xl mr-2">📢</span>
                        <div className="text-[#ffd700] text-sm whitespace-nowrap overflow-hidden text-ellipsis animate-pulse">
                            限時活動：雙倍金幣週末！立即充值享額外獎勵
                        </div>
                    </div>
                </div>

                {/* Top Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveModal('settings')}
                        className="flex items-center gap-1 bg-[#1a365d] text-white px-3 py-1.5 rounded-lg border border-[#4a5568] shadow-lg hover:bg-[#2a4365] active:scale-95 transition-all text-sm font-bold"
                    >
                        ⚙️ 設定
                    </button>
                    <button
                        onClick={() => setActiveModal('gift')}
                        className="flex items-center gap-1 bg-[#d97706] text-white px-3 py-1.5 rounded-lg border border-[#f59e0b] shadow-lg hover:bg-[#b45309] active:scale-95 transition-all text-sm font-bold animate-[bounce_2s_infinite]"
                    >
                        🎁 禮包
                    </button>
                </div>
            </div>

            {/* Left UI */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 pointer-events-auto z-10">
                <button
                    onClick={() => setActiveModal('recharge')}
                    className="relative w-16 h-16 rounded-full bg-gradient-to-b from-[#fbbf24] to-[#d97706] border-2 border-[#fff7ed] shadow-[0_0_15px_#f59e0b] flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-transform group"
                >
                    <span className="text-2xl drop-shadow-md group-hover:rotate-12 transition-transform">🪙</span>
                    <span className="text-xs font-bold text-white drop-shadow">充值</span>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border border-white"></div>
                </button>

                <div className="bg-black/60 rounded-lg p-2 border border-[#4a5568]">
                    <div className="text-[#94a3b8] text-[10px] text-center mb-0.5">VIP等級</div>
                    <div
                        id="vip-level"
                        className="text-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] via-[#fbfb22] to-[#ffd700] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
                        style={{ fontFamily: 'Impact, sans-serif' }}
                    >
                        VIP {vipLevel}
                    </div>
                </div>
            </div>

            {/* Right UI */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto z-10">
                <div className="bg-black/60 rounded-lg p-2 border border-[#4a5568] flex flex-col items-center gap-2">
                    <div className="text-white text-xs font-bold text-center">每日登入</div>
                    <button
                        onClick={onClaimDaily}
                        className="bg-gradient-to-b from-[#22c55e] to-[#15803d] text-white text-[10px] py-1 px-3 rounded shadow-md border border-[#4ade80] hover:brightness-110 active:scale-95 transition-all"
                    >
                        領取 1000
                    </button>
                </div>
            </div>

            {/* Bottom UI */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/90 to-transparent flex items-end justify-between px-4 pb-2 pointer-events-auto z-10">

                {/* Coin Display */}
                <div className="flex items-center bg-black/70 rounded-full pl-2 pr-6 py-1.5 border border-[#4a5568] min-w-[160px]">
                    <span className="text-2xl mr-2 filter drop-shadow-[0_0_5px_#ffd700]">🪙</span>
                    <span className="text-[#ffd700] font-mono text-xl font-bold tracking-wider">{Utils.format(balance)}</span>
                </div>

                {/* Controls */}
                <div className="absolute left-1/2 bottom-3 -translate-x-1/2 flex items-center gap-4">
                    <button
                        onClick={() => onChangeBet(-1)}
                        className="w-10 h-10 rounded-full bg-[#1e293b] border border-[#475569] text-[#94a3b8] hover:text-white hover:border-white active:bg-[#334155] transition-all flex items-center justify-center font-bold text-xl"
                    >
                        −
                    </button>

                    <div className="bg-black/60 px-6 py-2 rounded-lg border border-[#ffd700] flex flex-col items-center min-w-[100px]">
                        <span className="text-[#94a3b8] text-[10px] uppercase tracking-widest">倍率</span>
                        <span className="text-[#ffd700] font-bold text-xl">{currentBet}</span>
                    </div>

                    <button
                        onClick={() => onChangeBet(1)}
                        className="w-10 h-10 rounded-full bg-[#1e293b] border border-[#475569] text-[#94a3b8] hover:text-white hover:border-white active:bg-[#334155] transition-all flex items-center justify-center font-bold text-xl"
                    >
                        +
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onToggleAutoFire}
                        className={`flex flex-col items-center justify-center w-14 h-14 rounded-full border-2 transition-all ${isAutoFire ? 'bg-[#ef4444] border-[#fca5a5] shadow-[0_0_15px_#ef4444]' : 'bg-[#1e293b] border-[#475569] hover:bg-[#334155]'}`}
                    >
                        <span className={`text-2xl mb-[-4px] ${isAutoFire ? 'animate-spin' : ''}`}>🔄</span>
                        <span className="text-[10px] font-bold text-white">自動</span>
                    </button>

                    <button
                        onClick={onToggleLock}
                        className={`flex flex-col items-center justify-center w-14 h-14 rounded-full border-2 transition-all ${isLocked ? 'bg-[#3b82f6] border-[#93c5fd] shadow-[0_0_15px_#3b82f6]' : 'bg-[#1e293b] border-[#475569] hover:bg-[#334155]'}`}
                    >
                        <span className="text-2xl mb-[-4px]">🎯</span>
                        <span className="text-[10px] font-bold text-white">鎖定</span>
                    </button>
                </div>
            </div>

            {/* Settings Modal */}
            {activeModal === 'settings' && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 pointer-events-auto backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#1e293b] border border-[#475569] rounded-xl w-[90%] max-w-sm p-6 shadow-2xl relative">
                        <h2 className="text-center text-xl font-bold text-white mb-6 border-b border-[#334155] pb-4">遊戲設定</h2>
                        <button onClick={closeModal} className="absolute top-4 right-4 text-[#94a3b8] hover:text-white text-2xl">&times;</button>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-white text-sm mb-2">
                                    <span>背景音樂</span>
                                    <span>{bgmVolume}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="100"
                                    value={bgmVolume}
                                    onChange={(e) => setBgmVolume(parseInt(e.target.value))}
                                    className="w-full h-2 bg-[#0f172a] rounded-lg appearance-none cursor-pointer accent-[#3b82f6]"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between text-white text-sm mb-2">
                                    <span>音效音量</span>
                                    <span>{sfxVolume}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="100"
                                    value={sfxVolume}
                                    onChange={(e) => setSfxVolume(parseInt(e.target.value))}
                                    className="w-full h-2 bg-[#0f172a] rounded-lg appearance-none cursor-pointer accent-[#3b82f6]"
                                />
                            </div>
                        </div>

                        <div className="mt-8 text-center text-[#64748b] text-xs">
                            Version 1.0.0
                        </div>
                    </div>
                </div>
            )}

            {/* Recharge Modal */}
            {activeModal === 'recharge' && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 pointer-events-auto backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#1e293b] border border-[#475569] rounded-xl w-[95%] max-w-4xl max-h-[90vh] p-6 shadow-2xl relative flex flex-col">
                        <h2 className="text-center text-2xl font-bold text-[#ffd700] mb-6 border-b border-[#334155] pb-4">充值中心</h2>
                        <button onClick={closeModal} className="absolute top-4 right-4 text-[#94a3b8] hover:text-white text-2xl">&times;</button>

                        <div className="overflow-y-auto flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 p-2">
                            {packages.map(pkg => (
                                <div
                                    key={pkg.id}
                                    onClick={() => { onRecharge(pkg.coins + pkg.bonus); closeModal(); }}
                                    className={`relative bg-[#0f172a] border-2 rounded-xl p-4 flex flex-col items-center cursor-pointer hover:bg-[#1a2234] transition-colors group
                    ${pkg.isVip ? 'border-[#a855f7]' : 'border-[#334155]'}
                  `}
                                >
                                    {pkg.isPopular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ef4444] text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap">
                                            🔥 熱銷
                                        </div>
                                    )}
                                    {pkg.isVip && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#a855f7] text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap">
                                            👑 VIP
                                        </div>
                                    )}

                                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                                        {pkg.isVip ? '👑' : '🪙'}
                                    </div>
                                    <div className="text-[#ffd700] font-bold text-xl mb-1">{Utils.format(pkg.coins)}</div>
                                    <div className="text-white font-bold bg-[#3b82f6] px-4 py-1 rounded-full text-sm">
                                        NT$ {pkg.price}
                                    </div>
                                    {pkg.bonus > 0 && (
                                        <div className="text-[#4ade80] text-xs font-bold mt-2">
                                            +{Utils.format(pkg.bonus)} 贈送
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 text-center text-[#fca5a5] text-sm font-bold animate-pulse">
                            🎉 首充雙倍活動進行中！
                        </div>
                    </div>
                </div>
            )}

            {/* Gift Modal */}
            {activeModal === 'gift' && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 pointer-events-auto backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#1e293b] border border-[#475569] rounded-xl w-[90%] max-w-md p-6 shadow-2xl relative">
                        <h2 className="text-center text-xl font-bold text-white mb-6 border-b border-[#334155] pb-4">超值禮包</h2>
                        <button onClick={closeModal} className="absolute top-4 right-4 text-[#94a3b8] hover:text-white text-2xl">&times;</button>

                        <div className="space-y-4">
                            <div className="bg-[#0f172a] rounded-lg p-4 flex justify-between items-center border border-[#334155]">
                                <div>
                                    <div className="text-white font-bold">每日登入禮包</div>
                                    <div className="text-[#94a3b8] text-xs">每日登入領取 1,000 金幣</div>
                                </div>
                                <button
                                    onClick={() => { onClaimDaily(); closeModal(); }}
                                    className="bg-[#d97706] hover:bg-[#b45309] text-white font-bold px-4 py-2 rounded shadow-lg text-sm"
                                >
                                    領取
                                </button>
                            </div>

                            <div className="bg-[#0f172a] rounded-lg p-4 flex justify-between items-center border border-[#334155] opacity-50 grayscale">
                                <div>
                                    <div className="text-white font-bold">新手禮包</div>
                                    <div className="text-[#94a3b8] text-xs">僅限註冊 7 天內領取</div>
                                </div>
                                <button disabled className="bg-[#475569] text-white/50 font-bold px-4 py-2 rounded shadow-lg text-sm cursor-not-allowed">
                                    已領取
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toastMessage && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-3 rounded-xl shadow-2xl border border-white/20 z-[100] animate-fade-in-up text-lg font-bold pointer-events-none backdrop-blur-md">
                    {toastMessage}
                </div>
            )}
        </div>
    );
};
