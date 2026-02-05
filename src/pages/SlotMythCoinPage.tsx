import React, { useEffect, useRef } from 'react';

interface SlotMythCoinPageProps {
    onExit?: () => void;
}

const SlotMythCoinPage: React.FC<SlotMythCoinPageProps> = ({ onExit }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        // 強制橫向模式提示
        const checkOrientation = () => {
            if (window.innerWidth < 768 && window.innerHeight > window.innerWidth) {
                // 手機直向模式，顯示提示
                console.log('建議橫向模式以獲得最佳體驗');
            }
        };

        checkOrientation();
        window.addEventListener('resize', checkOrientation);

        return () => {
            window.removeEventListener('resize', checkOrientation);
        };
    }, []);

    return (
        <div className="slot-myth-coin-page" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#000',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* 返回按鈕 */}
            {onExit && (
                <button
                    onClick={onExit}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        zIndex: 10000,
                        padding: '10px 20px',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: '#d4af37',
                        border: '2px solid #d4af37',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.2)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    ← 返回遊戲大廳
                </button>
            )}

            {/* 遊戲 iframe */}
            <iframe
                ref={iframeRef}
                src="/games/slot-myth-coin/index.html"
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block'
                }}
                title="神話金幣 Jackpot"
                allow="autoplay; fullscreen"
            />
        </div>
    );
};

export default SlotMythCoinPage;
