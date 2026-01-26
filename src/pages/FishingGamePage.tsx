import React, { useEffect } from 'react'

interface FishingGamePageProps {
    onBack: () => void
}

const FishingGamePage: React.FC<FishingGamePageProps> = ({ onBack }) => {
    useEffect(() => {
        // 載入遊戲時自動全螢幕
        const requestFullscreen = () => {
            const elem = document.documentElement
            if (elem.requestFullscreen) {
                elem.requestFullscreen().catch(err => {
                    console.log('無法進入全螢幕:', err)
                })
            }
        }

        // 延遲一下再請求全螢幕,避免被瀏覽器阻擋
        const timer = setTimeout(requestFullscreen, 500)

        return () => {
            clearTimeout(timer)
            // 離開遊戲時退出全螢幕
            if (document.fullscreenElement) {
                document.exitFullscreen()
            }
        }
    }, [])

    return (
        <div className="fixed inset-0 z-50 bg-black">
            {/* 返回按鈕 */}
            <button
                onClick={onBack}
                className="absolute top-4 left-4 z-[60] bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all"
            >
                ← 返回遊戲大廳
            </button>

            {/* 遊戲 iframe */}
            <iframe
                src="/fishing-game/index.html"
                className="w-full h-full border-0"
                title="捕魚遊戲"
                allow="fullscreen"
            />
        </div>
    )
}

export default FishingGamePage
