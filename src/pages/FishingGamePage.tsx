import React, { useState, useRef, useCallback } from 'react';
import { GameCanvas } from '../components/FishingGame/GameCanvas';
import { GameUI } from '../components/FishingGame/GameUI';
import { OrientationGuard } from '../components/FishingGame/OrientationGuard';
import { FishingEngine } from '../game/fishing/FishingEngine';
import { CONFIG } from '../game/fishing/Constants';

interface FishingGamePageProps {
    onExit: () => void;
}

const FishingGamePage: React.FC<FishingGamePageProps> = ({ onExit }) => {
    const engineRef = useRef<FishingEngine | null>(null);

    const [balance, setBalance] = useState(10000); // Default balance
    const [currentBet, setCurrentBet] = useState(10);

    const [isAutoFire, setIsAutoFire] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = useCallback((msg: string) => {
        setToastMessage(msg);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 2500);
    }, []);

    const handleEngineInit = (engine: FishingEngine) => {
        engineRef.current = engine;
        // Sync initial state if needed
        setBalance(engine.balance);
        setCurrentBet(engine.currentBet);
        showToast('歡迎來到捕魚遊戲！');
    };

    const handleEngineDestroy = () => {
        engineRef.current = null;
    };

    const handleCoinsChange = (coins: number) => {
        setBalance(coins);
    };



    const handleToggleAutoFire = () => {
        if (engineRef.current) {
            setIsAutoFire(engineRef.current.toggleAutoFire());
        }
    };

    const handleToggleLock = () => {
        if (engineRef.current) {
            setIsLocked(engineRef.current.toggleLock());
        }
    };

    const handleChangeBet = (delta: number) => {
        if (!engineRef.current) return;
        const steps = CONFIG.betSteps;
        const currentIndex = steps.indexOf(currentBet);
        let newIndex = currentIndex + delta;

        // Clamp index
        if (newIndex < 0) newIndex = 0;
        if (newIndex >= steps.length) newIndex = steps.length - 1;

        const newBet = steps[newIndex];
        if (newBet !== currentBet) {
            setCurrentBet(newBet);
            engineRef.current.setBet(newBet);
        }
    };



    return (
        <OrientationGuard>
            <div className="fixed inset-0 w-full h-full overflow-hidden bg-black z-[9998]">
                <GameCanvas
                    onEngineInit={handleEngineInit}
                    onEngineDestroy={handleEngineDestroy}
                    onCoinsChange={handleCoinsChange}
                    onToast={showToast}
                />
                <GameUI
                    balance={balance}
                    currentBet={currentBet}
                    isAutoFire={isAutoFire}
                    isLocked={isLocked}
                    onToggleAutoFire={handleToggleAutoFire}
                    onToggleLock={handleToggleLock}
                    onChangeBet={handleChangeBet}
                    onExit={onExit}
                    toastMessage={toastMessage}
                />
            </div>
        </OrientationGuard>
    );
};

export default FishingGamePage;
