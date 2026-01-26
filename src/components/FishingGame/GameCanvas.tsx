import React, { useEffect, useRef } from 'react';
import { FishingEngine } from '../../game/fishing/FishingEngine';

interface GameCanvasProps {
    onEngineInit: (engine: FishingEngine) => void;
    onEngineDestroy: () => void;
    onCoinsChange: (coins: number) => void;
    onToast: (msg: string) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
    onEngineInit,
    onEngineDestroy,
    onCoinsChange,
    onToast
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const engine = new FishingEngine({
            canvas: canvasRef.current,
            onCoinsChange,
            onToast
        });

        onEngineInit(engine);

        const handleResize = () => engine.resize();
        window.addEventListener('resize', handleResize);

        // Mouse and Touch events are handled, but we need to bridge them to engine if needed
        // Actually engine handles its own events directly on canvas in constructor?
        // Let's check FishingEngine.ts... 
        // Wait, I didn't add event listeners in FishingEngine constructor!
        // I need to add them. Let me check my previous output for FishingEngine.ts
        // ...
        // I MISSED adding event listeners in FishingEngine constructor!
        // I implemented update/render but forgot to hook up mouse/touch events to `setTarget` and `fire`.
        // I must fix FishingEngine.ts first.

        return () => {
            window.removeEventListener('resize', handleResize);
            engine.destroy();
            onEngineDestroy();
        };
    }, []); // Run once on mount

    return (
        <canvas
            ref={canvasRef}
            className="block w-full h-full absolute top-0 left-0 bg-[#000814]"
            style={{ touchAction: 'none' }}
        />
    );
};
