import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

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

// Game Pages
import FishingGamePage from './pages/FishingGamePage';

const App = () => {
    // 從 localStorage 讀取登入狀態,如果沒有則預設為 false
    const [currentPage, setCurrentPage] = useState(() => {
        const saved = localStorage.getItem('currentPage');
        return saved || 'home';
    });
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
    const [memberSubPage, setMemberSubPage] = useState('main');
    const [selectedActivity, setSelectedActivity] = useState<number | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const saved = localStorage.getItem('isLoggedIn');
        return saved === 'true';
    });
    const [liffUser, setLiffUser] = useState<LiffUser | null>(null);
    const [showLogin, setShowLogin] = useState(false);
    const [activeGame, setActiveGame] = useState<number | null>(null);

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
                        // 3. 呼叫 Supabase Edge Function 進行驗證與建立使用者
                        // console.log('Verifying with Supabase Edge Function...');
                        // console.log('Request data:', {
                        //     userId: profile.userId,
                        //     displayName: profile.displayName,
                        //     hasPictureUrl: !!profile.pictureUrl,
                        //     hasIdToken: !!idToken
                        // });

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

                            // console.log('Response status:', response.status);
                            // console.log('Response data:', responseData);

                            if (!response.ok) {
                                console.error('❌ Edge Function 錯誤:');
                                console.error('狀態碼:', response.status);
                                console.error('錯誤訊息:', responseData.error);
                                console.error('詳細資訊:', responseData.details);
                                alert(`登入失敗:\n${responseData.error}\n\n詳細資訊:\n${responseData.details}`);
                            } else {
                                // console.log('✅ Edge Function 登入成功:', responseData);
                                if (responseData.user) {
                                    // console.log('使用者資料:', responseData.user);
                                    // 將使用者資料存入 localStorage
                                    localStorage.setItem('userProfile', JSON.stringify(responseData.user));
                                }
                            }
                        } catch (fetchError) {
                            // console.error('❌ Fetch 錯誤:', fetchError);
                            alert(`網路錯誤: ${fetchError}`);
                        }
                    } else {
                        // console.error('No ID token or profile found');
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

    // 持久化當前頁面到 localStorage
    useEffect(() => {
        localStorage.setItem('currentPage', currentPage);
    }, [currentPage]);

    // 遊戲點擊處理
    const handleGameClick = (gameId: number) => {
        if (gameId === 4) { // 捕魚遊戲的 ID
            setActiveGame(gameId);
        } else {
            // 其他遊戲暫時顯示提示
            alert('此遊戲即將推出,敬請期待!');
        }
    };

    // 返回遊戲大廳
    const handleBackToGames = () => {
        setActiveGame(null);
    };

    // 頁面切換
    const pages = {
        home: '首頁',
        games: '遊戲大廳',
        deposit: '儲值',
        activities: '活動中心',
        member: '會員中心'
    };

    // 遊戲分類
    const gameCategories = [
        { id: 1, name: '體育博彩', icon: '⚽', color: 'bg-blue-400', dog: '🐕' },
        { id: 2, name: '真人娛樂', icon: '🎭', color: 'bg-pink-400', dog: '🐩' },
        { id: 3, name: '電子遊戲', icon: '🎰', color: 'bg-purple-400', dog: '🐶' },
        { id: 4, name: '捕魚遊戲', icon: '🎣', color: 'bg-cyan-400', dog: '🦮' },
        { id: 5, name: '棋牌遊戲', icon: '🃏', color: 'bg-green-400', dog: '🐕‍🦺' }
    ];

    // 活動列表
    const activities = [
        {
            id: 1,
            title: '新會員首儲優惠',
            bonus: '100%',
            bonusAmount: '最高 $10,000',
            time: '長期活動',
            desc: '首次儲值即享100%紅利,最高贈送10,000元!',
            rules: [
                '僅限新會員首次儲值',
                '最低儲值金額 $1,000',
                '紅利需完成 20 倍流水',
                '活動長期有效'
            ],
            steps: [
                '完成會員註冊',
                '進行首次儲值',
                '系統自動發放紅利',
                '開始遊戲享受優惠'
            ],
            icon: '🎉',
            color: 'from-pink-400 to-rose-400'
        },
        {
            id: 2,
            title: '每日簽到送彩金',
            bonus: '每日領',
            bonusAmount: '最高 $888',
            time: '24小時',
            desc: '每天登入簽到,連續簽到獎勵翻倍!',
            rules: [
                '每日00:00重置簽到',
                '連續簽到7天可獲得額外獎勵',
                '中斷簽到則重新計算',
                '彩金需完成 5 倍流水'
            ],
            steps: [
                '每日登入平台',
                '點擊簽到按鈕',
                '領取當日獎勵',
                '連續簽到獲得更多'
            ],
            icon: '📅',
            color: 'from-blue-400 to-cyan-400'
        },
        {
            id: 3,
            title: '推薦好友送獎金',
            bonus: '雙重送',
            bonusAmount: '最高 $5,000',
            time: '限時3天',
            desc: '推薦好友註冊,雙方都能獲得豐厚獎勵!',
            rules: [
                '好友需使用您的推薦碼註冊',
                '好友完成首儲後雙方獲得獎勵',
                '推薦人最高可獲得 $5,000',
                '被推薦人可獲得 $500 紅利'
            ],
            steps: [
                '複製您的專屬推薦碼',
                '分享給好友註冊使用',
                '好友完成首次儲值',
                '雙方自動獲得獎勵'
            ],
            icon: '👥',
            color: 'from-purple-400 to-indigo-400'
        },
        {
            id: 4,
            title: '週年慶大放送',
            bonus: '200%',
            bonusAmount: '無上限',
            time: '限時7天',
            desc: '平台週年慶典,儲值滿千送千,上不封頂!',
            rules: [
                '活動期間內不限次數參加',
                '單筆儲值滿 $1,000 即享優惠',
                '紅利需完成 15 倍流水',
                '2024-01-20 至 2024-01-27'
            ],
            steps: [
                '於活動期間內儲值',
                '單筆滿 $1,000',
                '自動獲得雙倍紅利',
                '可重複參加'
            ],
            icon: '🎊',
            color: 'from-yellow-400 to-orange-400'
        },
        {
            id: 5,
            title: '每週返水優惠',
            bonus: '1.2%',
            bonusAmount: '無上限',
            time: '每週結算',
            desc: '每週自動計算返水,虧損也有補償!',
            rules: [
                '每週一自動結算上週返水',
                '返水比例依據VIP等級',
                '無需申請自動發放',
                '返水無流水限制'
            ],
            steps: [
                '正常進行遊戲投注',
                '系統自動記錄流水',
                '每週一計算返水',
                '直接發放至帳戶'
            ],
            icon: '💰',
            color: 'from-green-400 to-emerald-400'
        },
        {
            id: 6,
            title: '幸運轉盤抽獎',
            bonus: '天天抽',
            bonusAmount: '最高 $88,888',
            time: '每日3次',
            desc: '每日免費抽獎機會,大獎等你來拿!',
            rules: [
                '每日可免費抽獎 3 次',
                '儲值可獲得額外抽獎次數',
                '獎品包含現金、紅利、實體獎品',
                '中獎後即時發放'
            ],
            steps: [
                '進入轉盤抽獎頁面',
                '點擊開始抽獎',
                '等待轉盤停止',
                '獲得獎勵'
            ],
            icon: '🎰',
            color: 'from-red-400 to-pink-400'
        }
    ];

    // 活動中心頁面
    const ActivitiesPage = () => {
        // 如果選擇了活動,顯示活動詳情
        if (selectedActivity) {
            const activity = activities.find(a => a.id === selectedActivity);
            if (activity) {
                return <ActivityDetailPage activity={activity} setSelectedActivity={setSelectedActivity} />;
            }
        }

        // 活動列表頁面
        return <ActivitiesListPage activities={activities} setSelectedActivity={setSelectedActivity} />;
    };

    // 會員中心頁面
    const MemberPage = () => {
        if (memberSubPage === 'profile') {
            return <MemberProfilePage setMemberSubPage={setMemberSubPage} />;
        }
        if (memberSubPage === 'bets') {
            return <MemberBetsPage setMemberSubPage={setMemberSubPage} />;
        }
        if (memberSubPage === 'transactions') {
            return <MemberTransactionsPage setMemberSubPage={setMemberSubPage} />;
        }
        if (memberSubPage === 'promotions') {
            return <MemberPromotionsPage setMemberSubPage={setMemberSubPage} />;
        }
        if (memberSubPage === 'vip') {
            return <MemberVipPage setMemberSubPage={setMemberSubPage} />;
        }

        return <MemberMain setMemberSubPage={setMemberSubPage} />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-blue-50 to-pink-50">
            {/* 如果未登入,顯示登入頁面 */}
            {!isLoggedIn && showLogin ? (
                <LoginPage
                    isMobile={isMobile}
                    setIsLoggedIn={setIsLoggedIn}
                    setShowLogin={setShowLogin}
                    setCurrentPage={setCurrentPage}
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
                    {/* 如果正在遊玩遊戲,顯示遊戲頁面 */}
                    {activeGame === 4 ? (
                        <FishingGamePage onBack={handleBackToGames} />
                    ) : (
                        <>
                            {/* 登出按鈕 */}
                            <div className="fixed top-4 right-4 z-50">
                                <button
                                    onClick={() => {
                                        LiffService.logout(); // LIFF 登出
                                        setIsLoggedIn(false);
                                        setLiffUser(null);
                                        setShowLogin(false);
                                        setCurrentPage('home');
                                        // 清除 localStorage 中的登入狀態
                                        localStorage.removeItem('isLoggedIn');
                                        localStorage.removeItem('currentPage');
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
                                        {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} gameCategories={gameCategories} />}
                                        {currentPage === 'games' && <GamesPage gameCategories={gameCategories} onGameClick={handleGameClick} />}
                                        {currentPage === 'deposit' && <DepositPage />}
                                        {currentPage === 'activities' && <ActivitiesPage />}
                                        {currentPage === 'member' && <MemberPage />}

                                        {/* 底部導航 */}
                                        <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />

                                        {/* LINE 客服 */}
                                        <LineButton />
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
                                                {Object.entries(pages).map(([key, label]) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => setCurrentPage(key)}
                                                        className={`w-full text-left px-6 py-4 font-bold transition-colors ${currentPage === key
                                                            ? 'bg-blue-500 text-white'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* LINE 客服 */}
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
                                            {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} gameCategories={gameCategories} />}
                                            {currentPage === 'games' && <GamesPage gameCategories={gameCategories} onGameClick={handleGameClick} />}
                                            {currentPage === 'deposit' && <DepositPage />}
                                            {currentPage === 'activities' && <ActivitiesPage />}
                                            {currentPage === 'member' && <MemberPage />}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
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
