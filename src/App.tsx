import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

// Components
import BottomNav from './components/BottomNav';
import LineButton from './components/LineButton';
import LoginPage from './components/LoginPage';
import { LiffService, LiffUser } from './lib/liff';

// Pages
import HomePage from './pages/HomePage';
import GamesPage from './pages/GamesPage';
import DepositPage from './pages/DepositPage';

// Activities Pages
import ActivitiesListPage from './pages/Activities/ActivitiesListPage';
import ActivityDetailPage from './pages/Activities/ActivityDetailPage';

// Member Pages
import MemberMain from './pages/Member/MemberMain';
import MemberProfilePage from './pages/Member/MemberProfilePage';
import MemberBetsPage from './pages/Member/MemberBetsPage';
import MemberTransactionsPage from './pages/Member/MemberTransactionsPage';
import MemberPromotionsPage from './pages/Member/MemberPromotionsPage';
import MemberVipPage from './pages/Member/MemberVipPage';

import FishingGamePage from './pages/FishingGamePage';

const App = () => {
    // 從 localStorage 讀取登入狀態,如果沒有則預設為 false
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const saved = localStorage.getItem('isLoggedIn');
        return saved === 'true';
    });
    const [liffUser, setLiffUser] = useState<LiffUser | null>(null);
    const [showLogin, setShowLogin] = useState(false);

    // We can use hooks here because App is wrapped in BrowserRouter in main.tsx
    const navigate = useNavigate();
    const location = useLocation();

    // 自動偵測螢幕尺寸
    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 767px)');

        const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
            setIsMobile(e.matches);
        };

        // 初始化
        handleChange(mediaQuery);

        // 監聽變化
        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    // 初始化 LIFF 並檢查登入狀態
    useEffect(() => {
        const initLiff = async () => {
            try {
                // 檢查 URL 是否有推薦碼
                const urlParams = new URLSearchParams(window.location.search);
                const refCode = urlParams.get('ref');
                if (refCode) {
                    localStorage.setItem('referredBy', refCode);
                }

                const { isLoggedIn: liffIsLoggedIn } = await LiffService.init();
                if (liffIsLoggedIn) {
                    setIsLoggedIn(true);

                    // 1. 獲取 LINE 使用者資料
                    const profile = await LiffService.getProfile();
                    setLiffUser(profile);

                    // 2. 獲取 LINE ID Token
                    const idToken = window.liff?.getIDToken();

                    if (idToken && profile) {
                        try {
                            const response = await fetch(
                                'https://fsnlwfmlcxdznyduagrj.supabase.co/functions/v1/line-login',
                                {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
                                    },
                                    body: JSON.stringify({
                                        idToken: idToken,
                                        userId: profile.userId,
                                        displayName: profile.displayName,
                                        pictureUrl: profile.pictureUrl,
                                        referred_by: localStorage.getItem('referredBy') || null
                                    })
                                }
                            );

                            const responseData = await response.json();

                            if (!response.ok) {
                                console.error('❌ Edge Function 錯誤:', responseData.error);
                                alert(`登入失敗:\n${responseData.error}\n\n詳細資訊:\n${responseData.details}`);
                            } else {
                                if (responseData.user) {
                                    localStorage.setItem('userProfile', JSON.stringify(responseData.user));
                                }
                            }
                        } catch (fetchError) {
                            alert(`網路錯誤: ${fetchError}`);
                        }
                    }
                }
            } catch (error) {
                console.error('LIFF init error:', error);
            }
        };
        initLiff();
    }, []);

    // 持久化登入狀態到 localStorage
    useEffect(() => {
        localStorage.setItem('isLoggedIn', String(isLoggedIn));
    }, [isLoggedIn]);

    // 頁面定義用於側邊選單
    const pages = {
        home: { label: '首頁', path: '/' },
        games: { label: '遊戲大廳', path: '/games' },
        deposit: { label: '儲值', path: '/deposit' },
        activities: { label: '活動中心', path: '/activities' },
        member: { label: '會員中心', path: '/member' }
    };

    // 遊戲分類
    const gameCategories = [
        { id: 1, name: '體育博彩', icon: '⚽', color: 'bg-blue-400', dog: '🐕' },
        { id: 2, name: '真人娛樂', icon: '🎭', color: 'bg-pink-400', dog: '🐩' },
        { id: 3, name: '電子遊戲', icon: '🎰', color: 'bg-purple-400', dog: '🐶' },
        { id: 4, name: '捕魚遊戲', icon: '🎣', color: 'bg-cyan-400', dog: '🦮' },
        { id: 5, name: '棋牌遊戲', icon: '🃏', color: 'bg-green-400', dog: '🐕‍🦺' }
    ];

    const handleGameSelect = (game: any) => {
        if (game.id === 4) {
            navigate('/fishing');
        }
    };

    // 判斷當前頁面標識 for sidebar styling
    const getCurrentPageKey = () => {
        const path = location.pathname;
        if (path === '/') return 'home';
        if (path.startsWith('/games')) return 'games';
        if (path.startsWith('/deposit')) return 'deposit';
        if (path.startsWith('/activities')) return 'activities';
        if (path.startsWith('/member')) return 'member';
        return 'home';
    };
    const currentPageKey = getCurrentPageKey();

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-blue-50 to-pink-50">
            {/* 如果未登入,顯示登入頁面 */}
            {!isLoggedIn && showLogin ? (
                <LoginPage
                    isMobile={isMobile}
                    setIsLoggedIn={setIsLoggedIn}
                    setShowLogin={setShowLogin}
                    setCurrentPage={(page) => {
                        // Compatibility shim: LoginPage calls setCurrentPage('home')
                        if (page === 'home') navigate('/');
                    }}
                />
            ) : !isLoggedIn ? (
                // 未登入的訪客模式
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="text-center">
                        <div className="text-8xl mb-6 animate-bounce">🐶</div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">歡迎來到汪汪娛樂城</h1>
                        <p className="text-gray-600 mb-8">天天開心玩、狗狗陪你贏!</p>
                        <button
                            onClick={() => setShowLogin(true)}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-12 py-4 rounded-full text-xl font-bold shadow-2xl hover:scale-110 transition-transform"
                        >
                            立即登入/註冊
                        </button>
                    </div>
                </div>
            ) : (
                // 已登入的主要內容
                <>
                    {/* 登出按鈕 */}
                    <div className="fixed top-4 right-4 z-50">
                        <button
                            onClick={() => {
                                LiffService.logout();
                                setIsLoggedIn(false);
                                setLiffUser(null);
                                setShowLogin(false);
                                navigate('/');
                                localStorage.removeItem('isLoggedIn');
                            }}
                            className="px-4 py-2 rounded-lg font-bold text-sm bg-red-500 text-white hover:bg-red-600 shadow-md"
                        >
                            登出
                        </button>
                    </div>

                    {/* 主容器 */}
                    <div className={`${isMobile ? 'max-w-md mx-auto' : 'max-w-6xl mx-auto pt-20'} p-4`}>
                        {isMobile ? (
                            <>
                                {/* 手機版頂部 */}
                                <div className="mb-4 bg-white rounded-2xl p-4 shadow-md flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        {liffUser?.pictureUrl ? (
                                            <img src={liffUser.pictureUrl} alt={liffUser.displayName} className="w-10 h-10 rounded-full" />
                                        ) : (
                                            <div className="text-3xl">🐶</div>
                                        )}
                                        <div>
                                            <h1 className="font-bold text-gray-800">{liffUser ? liffUser.displayName : '汪汪娛樂城'}</h1>
                                            <p className="text-xs text-gray-500">安全 · 快速 · 可靠</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 頁面內容 */}
                                <Routes>
                                    <Route path="/" element={<HomePage setCurrentPage={(page) => { if (page === 'games') navigate('/games') }} gameCategories={gameCategories} onGameSelect={handleGameSelect} />} />
                                    <Route path="/games" element={<GamesPage gameCategories={gameCategories} onGameSelect={handleGameSelect} />} />
                                    <Route path="/deposit" element={<DepositPage />} />

                                    <Route path="/activities" element={<ActivitiesListPage />} />
                                    <Route path="/activities/:id" element={<ActivityDetailPage />} />

                                    <Route path="/member" element={<MemberMain setMemberSubPage={(sub) => navigate(`/member/${sub === 'main' ? '' : sub}`)} />} />
                                    <Route path="/member/profile" element={<MemberProfilePage setMemberSubPage={() => navigate('/member')} />} />
                                    <Route path="/member/bets" element={<MemberBetsPage setMemberSubPage={() => navigate('/member')} />} />
                                    <Route path="/member/transactions" element={<MemberTransactionsPage setMemberSubPage={() => navigate('/member')} />} />
                                    <Route path="/member/promotions" element={<MemberPromotionsPage setMemberSubPage={() => navigate('/member')} />} />
                                    <Route path="/member/vip" element={<MemberVipPage setMemberSubPage={() => navigate('/member')} />} />

                                    <Route path="/fishing" element={<FishingGamePage onExit={() => navigate('/games')} />} />

                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>

                                {/* 底部導航 */}
                                {/* Only show bottom nav if not in fishing game? Originally: if (currentPage === 'fishing') return FishingGamePage */}
                                {/* Now FishingGamePage is a route. But BottomNav is outside Routes. */}
                                {/* We should probably hide BottomNav on Fishing Page. */}
                                {location.pathname !== '/fishing' && (
                                    <>
                                        <BottomNav />
                                        <LineButton />
                                    </>
                                )}
                            </>
                        ) : (
                            // 網頁版佈局
                            <div className="grid grid-cols-12 gap-6">
                                {/* 左側選單 */}
                                <div className="col-span-3 space-y-4">
                                    <div className="bg-white rounded-3xl p-6 shadow-lg">
                                        <div className="flex justify-center mb-3">
                                            {liffUser?.pictureUrl ? (
                                                <img src={liffUser.pictureUrl} alt={liffUser.displayName} className="w-20 h-20 rounded-full object-cover border-4 border-blue-100" />
                                            ) : (
                                                <div className="text-5xl">🐶</div>
                                            )}
                                        </div>
                                        <h1 className="text-xl font-bold text-center text-gray-800 mb-2">{liffUser ? liffUser.displayName : '汪汪娛樂城'}</h1>
                                        <p className="text-xs text-center text-gray-500">天天開心玩、狗狗陪你贏</p>
                                    </div>

                                    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                                        {Object.entries(pages).map(([key, item]) => (
                                            <button
                                                key={key}
                                                onClick={() => navigate(item.path)}
                                                className={`w-full text-left px-6 py-4 font-bold transition-colors ${currentPageKey === key
                                                    ? 'bg-blue-500 text-white'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="bg-green-500 rounded-3xl p-4 text-white shadow-lg">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <MessageCircle size={24} />
                                            <span className="font-bold">LINE 客服</span>
                                        </div>
                                        <p className="text-sm mb-3 opacity-90">即時線上為您服務</p>
                                        <a
                                            href="https://line.me/ti/p/@your-line-id"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full bg-white text-green-600 py-2 rounded-xl font-bold hover:scale-105 transition-transform text-center"
                                        >
                                            立即聯繫
                                        </a>
                                    </div>
                                </div>

                                {/* 主內容區 */}
                                <div className="col-span-9">
                                    <Routes>
                                        <Route path="/" element={<HomePage setCurrentPage={(page) => { if (page === 'games') navigate('/games') }} gameCategories={gameCategories} onGameSelect={handleGameSelect} />} />
                                        <Route path="/games" element={<GamesPage gameCategories={gameCategories} onGameSelect={handleGameSelect} />} />
                                        <Route path="/deposit" element={<DepositPage />} />

                                        <Route path="/activities" element={<ActivitiesListPage />} />
                                        <Route path="/activities/:id" element={<ActivityDetailPage />} />

                                        <Route path="/member" element={<MemberMain setMemberSubPage={(sub) => navigate(`/member/${sub === 'main' ? '' : sub}`)} />} />
                                        <Route path="/member/profile" element={<MemberProfilePage setMemberSubPage={() => navigate('/member')} />} />
                                        <Route path="/member/bets" element={<MemberBetsPage setMemberSubPage={() => navigate('/member')} />} />
                                        <Route path="/member/transactions" element={<MemberTransactionsPage setMemberSubPage={() => navigate('/member')} />} />
                                        <Route path="/member/promotions" element={<MemberPromotionsPage setMemberSubPage={() => navigate('/member')} />} />
                                        <Route path="/member/vip" element={<MemberVipPage setMemberSubPage={() => navigate('/member')} />} />

                                        <Route path="/fishing" element={<FishingGamePage onExit={() => navigate('/games')} />} />

                                        <Route path="*" element={<Navigate to="/" replace />} />
                                    </Routes>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* CSS 動畫 */}
            <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
        </div>
    );
};

export default App;
