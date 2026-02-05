import React, { useState } from 'react';
import { Utils } from '../../game/fishing/Utils';

interface GameUIProps {
    balance: number;
    currentBet: number;
    isAutoFire: boolean;
    isLocked: boolean;
    onToggleAutoFire: () => void;
    onToggleLock: () => void;
    onChangeBet: (delta: number) => void;
    onExit: () => void;
    toastMessage: string | null;
}

export const GameUI: React.FC<GameUIProps> = ({
    balance,
    currentBet,
    isAutoFire,
    isLocked,
    onToggleAutoFire,
    onToggleLock,
    onChangeBet,
    onExit,
    toastMessage
}) => {
    const [activeModal, setActiveModal] = useState<string | null>(null);

    // Settings mock state
    const [bgmVolume, setBgmVolume] = useState(70);
    const [sfxVolume, setSfxVolume] = useState(80);

    // Recharge Packages Mock


    const closeModal = () => setActiveModal(null);

    return (
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden font-sans">

            {/* Top UI */}
            <div className="absolute top-0 left-0 right-0 h-16 flex justify-between items-start p-4 pointer-events-auto z-10">

                {/* Activity Bar */}
                <div className="flex items-center gap-2 max-w-[60%]">
                    <button
                        onClick={onExit}
                        className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg border-2 border-red-400 font-bold hover:from-red-700 hover:to-red-800 active:scale-95 transition-all text-sm shadow-lg hover:shadow-xl"
                    >
                        ← 退出遊戲
                    </button>
                    {/* Activity Bar Removed */}
                </div>

                {/* Top Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveModal('settings')}
                        className="flex items-center gap-1 bg-[#1a365d] text-white px-3 py-1.5 rounded-lg border border-[#4a5568] shadow-lg hover:bg-[#2a4365] active:scale-95 transition-all text-sm font-bold"
                    >
                        ⚙️ 設定
                    </button>
                </div>
            </div>

            {/* Left UI Removed */}

            {/* Right UI Removed */}

            {/* Bottom UI */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-black/70 to-transparent flex items-end justify-between px-6 pb-3 pointer-events-auto z-10">

                {/* Coin Display */}
                <div className="flex items-center bg-black/70 rounded-full pl-3 pr-6 py-2 border-2 border-[#4a5568] min-w-[180px] shadow-lg">
                    <span className="text-3xl mr-2 filter drop-shadow-[0_0_5px_#ffd700]">🪙</span>
                    <span className="text-[#ffd700] font-mono text-2xl font-bold tracking-wider">{Utils.format(balance)}</span>
                </div>

                {/* Controls */}
                <div className="absolute left-1/2 bottom-4 -translate-x-1/2 flex items-center gap-5">
                    <button
                        onClick={() => onChangeBet(-1)}
                        className="w-12 h-12 rounded-full bg-[#1e293b] border-2 border-[#475569] text-[#94a3b8] hover:text-white hover:border-white active:bg-[#334155] transition-all flex items-center justify-center font-bold text-2xl shadow-lg"
                    >
                        −
                    </button>

                    <div className="bg-black/70 px-8 py-3 rounded-lg border-2 border-[#ffd700] flex flex-col items-center min-w-[120px] shadow-lg">
                        <span className="text-[#94a3b8] text-xs uppercase tracking-widest">倍率</span>
                        <span className="text-[#ffd700] font-bold text-2xl">{currentBet}</span>
                    </div>

                    <button
                        onClick={() => onChangeBet(1)}
                        className="w-12 h-12 rounded-full bg-[#1e293b] border-2 border-[#475569] text-[#94a3b8] hover:text-white hover:border-white active:bg-[#334155] transition-all flex items-center justify-center font-bold text-2xl shadow-lg"
                    >
                        +
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={onToggleAutoFire}
                        className={`flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 transition-all shadow-lg ${isAutoFire ? 'bg-[#ef4444] border-[#fca5a5] shadow-[0_0_20px_#ef4444]' : 'bg-[#1e293b] border-[#475569] hover:bg-[#334155]'}`}
                    >
                        <span className={`text-3xl mb-[-4px] ${isAutoFire ? 'animate-spin' : ''}`}>🔄</span>
                        <span className="text-[10px] font-bold text-white">自動</span>
                    </button>

                    <button
                        onClick={onToggleLock}
                        className={`flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 transition-all shadow-lg ${isLocked ? 'bg-[#3b82f6] border-[#93c5fd] shadow-[0_0_20px_#3b82f6]' : 'bg-[#1e293b] border-[#475569] hover:bg-[#334155]'}`}
                    >
                        <span className="text-3xl mb-[-4px]">🎯</span>
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



            {/* Toast */}
            {toastMessage && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-3 rounded-xl shadow-2xl border border-white/20 z-[100] animate-fade-in-up text-lg font-bold pointer-events-none backdrop-blur-md">
                    {toastMessage}
                </div>
            )}
        </div>
    );
};
