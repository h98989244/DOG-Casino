import React, { useState, useEffect } from 'react'

interface OrientationGuardProps {
    children: React.ReactNode
}

/**
 * OrientationGuard 組件
 * 偵測行動裝置並強制要求橫向顯示
 * 直向時顯示全螢幕遮罩提示使用者旋轉裝置
 */
export const OrientationGuard: React.FC<OrientationGuardProps> = ({ children }) => {
    const [isMobile, setIsMobile] = useState(false)
    const [isPortrait, setIsPortrait] = useState(false)

    useEffect(() => {
        // 偵測是否為行動裝置
        const checkMobile = () => {
            const userAgent = navigator.userAgent.toLowerCase()
            const mobileKeywords = ['android', 'iphone', 'ipad', 'ipod', 'mobile']
            const isMobileDevice = mobileKeywords.some(keyword => userAgent.includes(keyword))

            // 也檢查螢幕寬度作為備用判斷
            const isSmallScreen = window.innerWidth <= 768

            setIsMobile(isMobileDevice || isSmallScreen)
        }

        // 偵測螢幕方向
        const checkOrientation = () => {
            // 使用 window.matchMedia 偵測方向
            const portrait = window.matchMedia('(orientation: portrait)').matches
            setIsPortrait(portrait)
        }

        // 初始化
        checkMobile()
        checkOrientation()

        // 監聽視窗大小變化
        window.addEventListener('resize', checkMobile)
        window.addEventListener('resize', checkOrientation)

        // 監聽方向變化 (部分瀏覽器支援)
        window.addEventListener('orientationchange', checkOrientation)

        return () => {
            window.removeEventListener('resize', checkMobile)
            window.removeEventListener('resize', checkOrientation)
            window.removeEventListener('orientationchange', checkOrientation)
        }
    }, [])

    // 如果是行動裝置且為直向,顯示旋轉提示
    if (isMobile && isPortrait) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center z-[9999] overflow-hidden">
                {/* 背景動畫效果 */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                {/* 主要內容 */}
                <div className="relative z-10 text-center px-8 max-w-md">
                    {/* 旋轉圖示動畫 */}
                    <div className="mb-8 flex justify-center">
                        <div className="relative">
                            {/* 手機圖示 */}
                            <div className="text-8xl animate-bounce">
                                📱
                            </div>
                            {/* 旋轉箭頭 */}
                            <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-5xl animate-spin-slow">
                                🔄
                            </div>
                        </div>
                    </div>

                    {/* 提示文字 */}
                    <h1 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
                        請旋轉您的裝置
                    </h1>
                    <p className="text-xl text-blue-100 mb-6 drop-shadow-md">
                        為了獲得最佳遊戲體驗
                    </p>
                    <p className="text-lg text-blue-200 drop-shadow-md">
                        請將手機旋轉為<span className="font-bold text-yellow-300">橫向</span>以開始遊戲
                    </p>

                    {/* 裝飾性元素 */}
                    <div className="mt-12 flex justify-center gap-2">
                        <div className="w-3 h-3 bg-blue-300 rounded-full animate-pulse"></div>
                        <div className="w-3 h-3 bg-blue-300 rounded-full animate-pulse delay-200"></div>
                        <div className="w-3 h-3 bg-blue-300 rounded-full animate-pulse delay-400"></div>
                    </div>
                </div>

                {/* 自訂動畫 */}
                <style>{`
                    @keyframes spin-slow {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .animate-spin-slow {
                        animation: spin-slow 3s linear infinite;
                    }
                    .delay-200 {
                        animation-delay: 0.2s;
                    }
                    .delay-400 {
                        animation-delay: 0.4s;
                    }
                    .delay-1000 {
                        animation-delay: 1s;
                    }
                `}</style>
            </div>
        )
    }

    // 桌機或橫向模式,正常顯示遊戲
    return <>{children}</>
}
