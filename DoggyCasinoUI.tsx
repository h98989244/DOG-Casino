import React, { useState } from 'react';
import { Home, Gamepad2, DollarSign, Gift, User, MessageCircle, Trophy, CreditCard, Clock, Star, ChevronRight, Menu, X } from 'lucide-react';

const DoggyCasinoUI = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isMobile, setIsMobile] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [memberSubPage, setMemberSubPage] = useState('main');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

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
      desc: '首次儲值即享100%紅利，最高贈送10,000元！',
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
      desc: '每天登入簽到，連續簽到獎勵翻倍！',
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
      desc: '推薦好友註冊，雙方都能獲得豐厚獎勵！',
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
      desc: '平台週年慶典，儲值滿千送千，上不封頂！',
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
      desc: '每週自動計算返水，虧損也有補償！',
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
      desc: '每日免費抽獎機會，大獎等你來拿！',
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

  // 登入/註冊頁面
  const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
      username: '',
      password: '',
      confirmPassword: '',
      phone: '',
      inviteCode: ''
    });

    const handleLogin = () => {
      // 這裡處理登入邏輯
      setIsLoggedIn(true);
      setShowLogin(false);
      setCurrentPage('home');
    };

    const handleLineLogin = () => {
      // 這裡處理 LINE 登入
      window.open('https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=YOUR_LINE_CHANNEL_ID&redirect_uri=YOUR_CALLBACK_URL&state=12345abcde&scope=profile%20openid', '_blank');
      // 模擬登入成功
      setTimeout(() => {
        setIsLoggedIn(true);
        setShowLogin(false);
        setCurrentPage('home');
      }, 2000);
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className={`w-full ${isMobile ? 'max-w-md' : 'max-w-lg'}`}>
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="text-7xl mb-4 animate-bounce">🐶</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">汪汪娛樂城</h1>
            <p className="text-gray-500">天天開心玩、狗狗陪你贏</p>
          </div>

          {/* 登入/註冊卡片 */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            {/* 切換標籤 */}
            <div className="flex bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${isLogin
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-500'
                  }`}
              >
                會員登入
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${!isLogin
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-500'
                  }`}
              >
                立即註冊
              </button>
            </div>

            {/* LINE 快速登入 */}
            <button
              onClick={handleLineLogin}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center space-x-3 transition-all hover:scale-105"
            >
              <MessageCircle size={24} />
              <span>使用 LINE 快速登入</span>
            </button>

            {/* 分隔線 */}
            <div className="flex items-center space-x-3">
              <div className="flex-1 border-t-2 border-gray-200"></div>
              <span className="text-gray-400 text-sm">或使用帳號密碼</span>
              <div className="flex-1 border-t-2 border-gray-200"></div>
            </div>

            {/* 登入表單 */}
            {isLogin ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    帳號
                  </label>
                  <input
                    type="text"
                    placeholder="請輸入帳號"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-400 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    密碼
                  </label>
                  <input
                    type="password"
                    placeholder="請輸入密碼"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-400 outline-none transition-all"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 text-gray-600">
                    <input type="checkbox" className="rounded" />
                    <span>記住我</span>
                  </label>
                  <button className="text-blue-500 font-bold hover:underline">
                    忘記密碼？
                  </button>
                </div>
                <button
                  onClick={handleLogin}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform"
                >
                  立即登入
                </button>
              </div>
            ) : (
              // 註冊表單
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    帳號
                  </label>
                  <input
                    type="text"
                    placeholder="6-12位英文或數字"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-400 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    密碼
                  </label>
                  <input
                    type="password"
                    placeholder="6-20位英文或數字"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-400 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    確認密碼
                  </label>
                  <input
                    type="password"
                    placeholder="請再次輸入密碼"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-400 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    手機號碼
                  </label>
                  <input
                    type="tel"
                    placeholder="請輸入手機號碼"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-400 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    邀請碼（非必填）
                  </label>
                  <input
                    type="text"
                    placeholder="請輸入邀請碼"
                    value={formData.inviteCode}
                    onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-400 outline-none transition-all"
                  />
                </div>
                <div className="flex items-start space-x-2 text-sm text-gray-600">
                  <input type="checkbox" className="mt-1" />
                  <span>我已閱讀並同意<span className="text-blue-500 font-bold">服務條款</span>及<span className="text-blue-500 font-bold">隱私政策</span></span>
                </div>
                <button
                  onClick={handleLogin}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform"
                >
                  立即註冊
                </button>
              </div>
            )}
          </div>

          {/* 其他登入方式 */}
          <div className="mt-6">
            <p className="text-center text-sm text-gray-500 mb-4">其他登入方式</p>
            <div className="flex justify-center space-x-4">
              <button className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                <span className="text-2xl">📱</span>
              </button>
              <button className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                <span className="text-2xl">📧</span>
              </button>
              <button className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                <span className="text-2xl">🔐</span>
              </button>
            </div>
          </div>

          {/* 客服提示 */}
          <div className="mt-6 bg-white rounded-2xl p-4 shadow-md text-center">
            <p className="text-sm text-gray-600 mb-2">遇到問題？</p>
            <a
              href="https://line.me/ti/p/@your-line-id"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-green-500 font-bold hover:underline"
            >
              <MessageCircle size={18} />
              <span>聯繫 LINE 客服</span>
            </a>
          </div>
        </div>
      </div>
    );
  };

  // 首頁內容
  const HomePage = () => (
    <div className="space-y-4 pb-20">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-yellow-300 via-yellow-200 to-blue-200 rounded-3xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 text-6xl opacity-20">🐕</div>
        <div className="relative z-10">
          <div className="text-4xl mb-2">🐶</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">汪汪娛樂城</h1>
          <p className="text-gray-700 text-sm mb-4">天天開心玩、狗狗陪你贏！</p>
          <button className="bg-blue-500 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
            立即開始
          </button>
        </div>
      </div>

      {/* 跑馬燈公告 */}
      <div className="bg-white rounded-2xl p-4 shadow-md flex items-center space-x-3">
        <div className="text-2xl">📢</div>
        <div className="flex-1 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap text-sm text-gray-700">
            🎉 恭喜會員 wang***88 贏得 $50,000 大獎！ | 💰 本週儲值享 8% 回饋 | 🎁 新會員首存雙倍送
          </div>
        </div>
      </div>

      {/* 快速入口 */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: <Gamepad2 size={24} />, label: '遊戲', page: 'games', bg: 'bg-blue-100' },
          { icon: <DollarSign size={24} />, label: '儲值', page: 'deposit', bg: 'bg-green-100' },
          { icon: <Gift size={24} />, label: '活動', page: 'activities', bg: 'bg-pink-100' },
          { icon: <User size={24} />, label: '我的', page: 'member', bg: 'bg-purple-100' }
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentPage(item.page)}
            className={`${item.bg} rounded-2xl p-4 flex flex-col items-center space-y-2 hover:scale-105 transition-transform shadow-md`}
          >
            <div className="text-gray-700">{item.icon}</div>
            <span className="text-xs font-bold text-gray-700">{item.label}</span>
          </button>
        ))}
      </div>

      {/* 熱門遊戲 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <span className="mr-2">🔥</span>
            熱門遊戲
          </h2>
          <button className="text-blue-500 text-sm flex items-center">
            更多 <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {gameCategories.slice(0, 4).map(game => (
            <div key={game.id} className={`${game.color} bg-opacity-20 rounded-2xl p-4 shadow-md hover:scale-105 transition-transform`}>
              <div className="text-3xl mb-2">{game.dog}</div>
              <div className="text-2xl mb-1">{game.icon}</div>
              <h3 className="font-bold text-gray-800 text-sm">{game.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 遊戲大廳
  const GamesPage = () => (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center">
        <span className="mr-2">🎮</span>
        遊戲大廳
      </h1>
      <div className="grid grid-cols-2 gap-4">
        {gameCategories.map(game => (
          <div
            key={game.id}
            className={`${game.color} bg-opacity-20 rounded-3xl p-6 shadow-lg hover:scale-105 transition-transform cursor-pointer`}
          >
            <div className="text-5xl mb-3 text-center">{game.dog}</div>
            <div className="text-3xl mb-2 text-center">{game.icon}</div>
            <h3 className="font-bold text-gray-800 text-center">{game.name}</h3>
            <div className="text-center mt-3">
              <span className="bg-white bg-opacity-70 px-3 py-1 rounded-full text-xs font-bold">
                立即遊玩
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 儲值/提領
  const DepositPage = () => (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center">
        <span className="mr-2">💰</span>
        儲值
      </h1>

      {/* 餘額卡片 */}
      <div className="bg-gradient-to-br from-yellow-400 to-orange-300 rounded-3xl p-6 shadow-lg text-white">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm opacity-90">當前餘額</span>
          <span className="text-2xl">🐕‍🦺</span>
        </div>
        <div className="text-4xl font-bold mb-2">NT$ 12,888</div>
        <div className="text-sm opacity-90">VIP 等級：🦴🦴🦴 金牌會員</div>
      </div>

      {/* 儲值選項 */}
      <div className="bg-white rounded-3xl p-5 shadow-md">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center">
          <CreditCard size={20} className="mr-2" />
          快速儲值
        </h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {['1000', '3000', '5000', '10000', '30000', '50000'].map(amount => (
            <button
              key={amount}
              className="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-2xl py-3 font-bold text-blue-600 transition-all hover:scale-105"
            >
              ${amount}
            </button>
          ))}
        </div>
        <button className="w-full bg-blue-500 text-white py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform">
          確認儲值
        </button>
      </div>

      {/* 提領 */}
      {/* <div className="bg-white rounded-3xl p-5 shadow-md">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center">
          <DollarSign size={20} className="mr-2" />
          提領申請
        </h3>
        <input
          type="text"
          placeholder="請輸入提領金額"
          className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 mb-3 focus:border-blue-400 outline-none"
        />
        <button className="w-full bg-green-500 text-white py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform">
          提交申請
        </button>
      </div> */}
    </div>
  );

  // 活動中心
  const ActivitiesPage = () => {
    // 如果選擇了活動，顯示活動詳情
    if (selectedActivity) {
      const activity = activities.find(a => a.id === selectedActivity);

      return (
        <div className="space-y-4 pb-20">
          {/* 返回按鈕 */}
          <button
            onClick={() => setSelectedActivity(null)}
            className="flex items-center text-blue-500 font-bold hover:scale-105 transition-transform"
          >
            <ChevronRight size={20} className="rotate-180" />
            返回活動列表
          </button>

          {/* 活動主視覺 */}
          <div className={`bg-gradient-to-br ${activity.color} rounded-3xl p-6 shadow-lg text-white relative overflow-hidden`}>
            <div className="absolute top-0 right-0 text-8xl opacity-20">{activity.icon}</div>
            <div className="relative z-10">
              <div className="text-6xl mb-3">{activity.icon}</div>
              <h1 className="text-2xl font-bold mb-2">{activity.title}</h1>
              <p className="text-sm opacity-90 mb-4">{activity.desc}</p>
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                  <span className="font-bold">{activity.bonus}</span>
                </div>
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full flex items-center">
                  <Clock size={16} className="mr-2" />
                  <span className="text-sm">{activity.time}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 獎勵金額 */}
          <div className="bg-white rounded-2xl p-6 shadow-md text-center">
            <div className="text-gray-500 text-sm mb-2">活動獎勵</div>
            <div className="text-4xl font-bold text-orange-500 mb-2">{activity.bonusAmount}</div>
            <div className="inline-block bg-green-100 text-green-600 px-4 py-1 rounded-full text-sm font-bold">
              立即參加領取獎勵
            </div>
          </div>

          {/* 參加步驟 */}
          <div className="bg-white rounded-2xl p-5 shadow-md">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📝</span>
              參加步驟
            </h3>
            <div className="space-y-3">
              {activity.steps.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-gray-700">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 活動規則 */}
          <div className="bg-white rounded-2xl p-5 shadow-md">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📋</span>
              活動規則
            </h3>
            <div className="space-y-2">
              {activity.rules.map((rule, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <p className="text-gray-600 text-sm flex-1">{rule}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 注意事項 */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
            <div className="flex items-start space-x-2">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 mb-2">重要提醒</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• 本活動僅限真實會員參加，禁止使用機器人或外掛</li>
                  <li>• 如發現任何作弊行為，平台有權取消資格並凍結帳戶</li>
                  <li>• 活動最終解釋權歸平台所有</li>
                  <li>• 若有疑問請聯繫LINE客服</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 立即參加按鈕 */}
          <button className={`w-full bg-gradient-to-r ${activity.color} text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:scale-105 transition-transform`}>
            🎁 立即參加活動
          </button>
        </div>
      );
    }

    // 活動列表頁面
    return (
      <div className="space-y-4 pb-20">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="mr-2">🎁</span>
          活動中心
        </h1>

        {/* 精選活動輪播 */}
        <div className="bg-gradient-to-br from-pink-300 to-purple-300 rounded-3xl p-6 shadow-lg text-white">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-xl font-bold mb-2">週年慶大放送</h2>
          <p className="text-sm mb-4 opacity-90">儲值滿千送千，最高贈送無上限</p>
          <button
            onClick={() => setSelectedActivity(4)}
            className="bg-white text-purple-600 px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform"
          >
            立即參加
          </button>
        </div>

        {/* 活動分類標籤 */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {['全部活動', '新手專區', '每日優惠', '限時活動', 'VIP專屬'].map(category => (
            <button
              key={category}
              className="px-4 py-2 bg-white rounded-full font-bold text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-500 whitespace-nowrap shadow-sm"
            >
              {category}
            </button>
          ))}
        </div>

        {/* 活動列表 */}
        {activities.map(activity => (
          <div
            key={activity.id}
            className="bg-white rounded-2xl p-5 shadow-md hover:scale-105 transition-transform cursor-pointer"
            onClick={() => setSelectedActivity(activity.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-3xl">{activity.icon}</span>
                  <h3 className="font-bold text-gray-800">{activity.title}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">{activity.desc}</p>
                <div className="flex items-center space-x-3 text-sm">
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold">
                    {activity.bonus}
                  </span>
                  <span className="text-orange-600 font-bold">
                    {activity.bonusAmount}
                  </span>
                  <span className="text-gray-500 flex items-center">
                    <Clock size={14} className="mr-1" />
                    {activity.time}
                  </span>
                </div>
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white py-2 rounded-xl font-bold shadow-md flex items-center justify-center">
              查看詳情
              <ChevronRight size={18} className="ml-1" />
            </button>
          </div>
        ))}

        {/* 客服提示卡片 */}
        <div className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center space-x-3 mb-3">
            <div className="text-3xl">🐕</div>
            <div className="flex-1">
              <h3 className="font-bold mb-1">有任何疑問？</h3>
              <p className="text-sm opacity-90">聯繫 LINE 客服為您詳細解答</p>
            </div>
          </div>
          <a
            href="https://line.me/ti/p/@your-line-id"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-white text-green-600 py-2 rounded-xl font-bold hover:scale-105 transition-transform flex items-center justify-center"
          >
            <MessageCircle size={18} className="mr-2" />
            聯繫客服
          </a>
        </div>
      </div>
    );
  };

  // 會員中心
  const MemberPage = () => {
    if (memberSubPage !== 'main') {
      return <MemberSubPages />;
    }

    return (
      <div className="space-y-4 pb-20">
        {/* 會員資訊卡 */}
        <div className="bg-gradient-to-br from-blue-400 to-purple-400 rounded-3xl p-6 shadow-lg text-white">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-4xl">
              🐕
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Wang***88</h2>
              <div className="flex items-center space-x-2 mt-1">
                <Star size={16} fill="gold" color="gold" />
                <span className="text-sm">VIP 3 金牌會員</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 bg-white bg-opacity-20 rounded-2xl p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">12,888</div>
              <div className="text-xs opacity-90">餘額</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">156</div>
              <div className="text-xs opacity-90">投注次數</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">🦴🦴🦴</div>
              <div className="text-xs opacity-90">狗骨頭</div>
            </div>
          </div>
        </div>

        {/* 功能選單 */}
        <div className="bg-white rounded-3xl shadow-md overflow-hidden">
          {[
            { id: 'profile', icon: <User />, label: '個人資料', color: 'text-blue-500' },
            { id: 'bets', icon: <Trophy />, label: '我的投注', color: 'text-purple-500' },
            { id: 'transactions', icon: <DollarSign />, label: '交易紀錄', color: 'text-green-500' },
            { id: 'promotions', icon: <Gift />, label: '優惠紀錄', color: 'text-pink-500' },
            { id: 'vip', icon: <Star />, label: 'VIP 權益', color: 'text-yellow-500' }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => setMemberSubPage(item.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <div className={item.color}>{item.icon}</div>
                <span className="font-bold text-gray-800">{item.label}</span>
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </button>
          ))}
        </div>
      </div>
    );
  };

  // 會員中心子頁面
  const MemberSubPages = () => {
    const BackButton = () => (
      <button
        onClick={() => setMemberSubPage('main')}
        className="flex items-center text-blue-500 font-bold mb-4 hover:scale-105 transition-transform"
      >
        <ChevronRight size={20} className="rotate-180" />
        返回
      </button>
    );

    // 個人資料
    if (memberSubPage === 'profile') {
      return (
        <div className="space-y-4 pb-20">
          <BackButton />
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-2">👤</span>
            個人資料
          </h1>

          <div className="bg-white rounded-3xl p-6 shadow-md space-y-4">
            <div className="text-center mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full mx-auto flex items-center justify-center text-5xl mb-3">
                🐕
              </div>
              <button className="text-blue-500 text-sm font-bold">更換頭像</button>
            </div>

            {[
              { label: '會員帳號', value: 'Wang***88', editable: false },
              { label: '真實姓名', value: '王小明', editable: true },
              { label: '手機號碼', value: '0912-345-678', editable: true },
              { label: '電子郵件', value: 'wang***@gmail.com', editable: true },
              { label: '銀行帳號', value: '822-***-***-123', editable: true },
              { label: '註冊時間', value: '2024-01-15', editable: false }
            ].map((field, idx) => (
              <div key={idx} className="border-b pb-3 last:border-b-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{field.label}</span>
                  {field.editable && (
                    <button className="text-blue-500 text-sm font-bold">編輯</button>
                  )}
                </div>
                <div className="font-bold text-gray-800 mt-1">{field.value}</div>
              </div>
            ))}

            <button className="w-full bg-blue-500 text-white py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform mt-4">
              儲存變更
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-md">
            <h3 className="font-bold text-gray-800 mb-3">安全設定</h3>
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors mb-2">
              <span className="font-bold text-gray-700">修改密碼</span>
              <ChevronRight className="text-gray-400" size={20} />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <span className="font-bold text-gray-700">雙重驗證</span>
              <ChevronRight className="text-gray-400" size={20} />
            </button>
          </div>
        </div>
      );
    }

    // 我的投注
    if (memberSubPage === 'bets') {
      const bets = [
        { id: '202401231234', game: '真人百家樂', amount: 1000, result: '贏', profit: 980, time: '2024-01-23 14:23', status: '已結算' },
        { id: '202401231156', game: '電子老虎機', amount: 500, result: '贏', profit: 1500, time: '2024-01-23 11:56', status: '已結算' },
        { id: '202401230945', game: '體育投注', amount: 2000, result: '輸', profit: -2000, time: '2024-01-23 09:45', status: '已結算' },
        { id: '202401221845', game: '捕魚達人', amount: 300, result: '贏', profit: 120, time: '2024-01-22 18:45', status: '已結算' }
      ];

      return (
        <div className="space-y-4 pb-20">
          <BackButton />
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-2">🎮</span>
            我的投注
          </h1>

          {/* 統計卡片 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl p-4 text-white shadow-lg">
              <div className="text-2xl font-bold">156</div>
              <div className="text-xs opacity-90">總投注</div>
            </div>
            <div className="bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl p-4 text-white shadow-lg">
              <div className="text-2xl font-bold">+2,680</div>
              <div className="text-xs opacity-90">總盈利</div>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl p-4 text-white shadow-lg">
              <div className="text-2xl font-bold">58%</div>
              <div className="text-xs opacity-90">勝率</div>
            </div>
          </div>

          {/* 篩選按鈕 */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {['全部', '今天', '本週', '本月'].map(filter => (
              <button
                key={filter}
                className="px-4 py-2 bg-white rounded-full font-bold text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-500 whitespace-nowrap shadow-sm"
              >
                {filter}
              </button>
            ))}
          </div>

          {/* 投注紀錄 */}
          {bets.map(bet => (
            <div key={bet.id} className="bg-white rounded-2xl p-4 shadow-md">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-800">{bet.game}</h3>
                  <p className="text-xs text-gray-500 mt-1">訂單號：{bet.id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${bet.result === '贏' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                  {bet.result}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                <div>
                  <div className="text-gray-500 text-xs">投注金額</div>
                  <div className="font-bold text-gray-800">NT$ {bet.amount}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">盈虧</div>
                  <div className={`font-bold ${bet.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {bet.profit > 0 ? '+' : ''}{bet.profit}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">狀態</div>
                  <div className="font-bold text-gray-800">{bet.status}</div>
                </div>
              </div>

              <div className="text-xs text-gray-400 flex items-center">
                <Clock size={12} className="mr-1" />
                {bet.time}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // 交易紀錄
    if (memberSubPage === 'transactions') {
      const transactions = [
        { id: 'T202401231545', type: '儲值', amount: 5000, status: '成功', time: '2024-01-23 15:45', method: '銀行轉帳' },
        { id: 'T202401231234', type: '提領', amount: -3000, status: '處理中', time: '2024-01-23 12:34', method: '銀行轉帳' },
        { id: 'T202401220956', type: '儲值', amount: 10000, status: '成功', time: '2024-01-22 09:56', method: '超商代碼' },
        { id: 'T202401211823', type: '提領', amount: -2000, status: '成功', time: '2024-01-21 18:23', method: '銀行轉帳' }
      ];

      return (
        <div className="space-y-4 pb-20">
          <BackButton />
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-2">💰</span>
            交易紀錄
          </h1>

          {/* 總覽卡片 */}
          <div className="bg-gradient-to-br from-yellow-300 to-orange-300 rounded-3xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm opacity-90">本月交易總額</span>
              <span className="text-2xl">💳</span>
            </div>
            <div className="text-3xl font-bold mb-2">NT$ 18,000</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>儲值：NT$ 15,000</div>
              <div>提領：NT$ 3,000</div>
            </div>
          </div>

          {/* 類型篩選 */}
          <div className="flex space-x-2">
            {['全部', '儲值', '提領'].map(type => (
              <button
                key={type}
                className="px-4 py-2 bg-white rounded-full font-bold text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-500 shadow-sm"
              >
                {type}
              </button>
            ))}
          </div>

          {/* 交易列表 */}
          {transactions.map(tx => (
            <div key={tx.id} className="bg-white rounded-2xl p-4 shadow-md">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === '儲值' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                    {tx.type === '儲值' ? '💵' : '🏦'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{tx.type}</h3>
                    <p className="text-xs text-gray-500">{tx.method}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-blue-600'
                    }`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${tx.status === '成功' ? 'bg-green-100 text-green-600' :
                      tx.status === '處理中' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                    }`}>
                    {tx.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t">
                <span>訂單號：{tx.id}</span>
                <span className="flex items-center">
                  <Clock size={12} className="mr-1" />
                  {tx.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // 優惠紀錄
    if (memberSubPage === 'promotions') {
      const promotions = [
        { id: 1, title: '首儲100%紅利', bonus: 5000, status: '已領取', date: '2024-01-15', expire: '已使用' },
        { id: 2, title: '每日簽到獎勵', bonus: 88, status: '已領取', date: '2024-01-23', expire: '2024-01-24' },
        { id: 3, title: '週年慶加碼', bonus: 1000, status: '可領取', date: '2024-01-20', expire: '2024-01-30' },
        { id: 4, title: 'VIP升級禮金', bonus: 3000, status: '已過期', date: '2024-01-10', expire: '2024-01-20' }
      ];

      return (
        <div className="space-y-4 pb-20">
          <BackButton />
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-2">🎁</span>
            優惠紀錄
          </h1>

          {/* 總獎勵卡片 */}
          <div className="bg-gradient-to-br from-pink-400 to-purple-400 rounded-3xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm opacity-90">累計獲得優惠</span>
              <span className="text-3xl">🎉</span>
            </div>
            <div className="text-4xl font-bold mb-2">NT$ 9,088</div>
            <div className="text-sm opacity-90">共參加 12 次活動</div>
          </div>

          {/* 狀態篩選 */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {['全部', '可領取', '已領取', '已過期'].map(status => (
              <button
                key={status}
                className="px-4 py-2 bg-white rounded-full font-bold text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-500 whitespace-nowrap shadow-sm"
              >
                {status}
              </button>
            ))}
          </div>

          {/* 優惠列表 */}
          {promotions.map(promo => (
            <div key={promo.id} className="bg-white rounded-2xl p-4 shadow-md">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-1">{promo.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-orange-500">
                      +NT$ {promo.bonus.toLocaleString()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${promo.status === '可領取' ? 'bg-green-100 text-green-600' :
                        promo.status === '已領取' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'
                      }`}>
                      {promo.status}
                    </span>
                  </div>
                </div>
                <div className="text-4xl">{promo.status === '可領取' ? '🎁' : '✨'}</div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                <span>發放日期：{promo.date}</span>
                <span>有效至：{promo.expire}</span>
              </div>

              {promo.status === '可領取' && (
                <button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 rounded-xl font-bold mt-3 hover:scale-105 transition-transform">
                  立即領取
                </button>
              )}
            </div>
          ))}
        </div>
      );
    }

    // VIP 權益
    if (memberSubPage === 'vip') {
      const vipLevels = [
        { level: 1, name: '銅牌會員', bone: '🦴', deposit: 1000, cashback: '0.3%', withdraw: '3次/日' },
        { level: 2, name: '銀牌會員', bone: '🦴🦴', deposit: 10000, cashback: '0.5%', withdraw: '5次/日' },
        { level: 3, name: '金牌會員', bone: '🦴🦴🦴', deposit: 50000, cashback: '0.8%', withdraw: '10次/日', current: true },
        { level: 4, name: '鑽石會員', bone: '🦴🦴🦴🦴', deposit: 200000, cashback: '1.2%', withdraw: '無限制' },
        { level: 5, name: '至尊會員', bone: '🦴🦴🦴🦴🦴', deposit: 1000000, cashback: '1.5%', withdraw: '無限制' }
      ];

      return (
        <div className="space-y-4 pb-20">
          <BackButton />
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-2">👑</span>
            VIP 權益
          </h1>

          {/* 當前等級卡片 */}
          <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-3xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-4xl mb-2">🦴🦴🦴</div>
                <h2 className="text-2xl font-bold">金牌會員</h2>
                <p className="text-sm opacity-90">VIP Level 3</p>
              </div>
              <div className="text-6xl">👑</div>
            </div>

            <div className="bg-white bg-opacity-20 rounded-2xl p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">升級進度</span>
                <span className="text-sm font-bold">52,000 / 200,000</span>
              </div>
              <div className="bg-white bg-opacity-30 rounded-full h-3 overflow-hidden">
                <div className="bg-white h-full rounded-full" style={{ width: '26%' }}></div>
              </div>
              <p className="text-xs mt-2 opacity-90">再儲值 NT$ 148,000 即可升級至鑽石會員</p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="text-center">
                <div className="font-bold text-lg">0.8%</div>
                <div className="text-xs opacity-90">返水比例</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">10次</div>
                <div className="text-xs opacity-90">每日提領</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">專屬</div>
                <div className="text-xs opacity-90">客服經理</div>
              </div>
            </div>
          </div>

          {/* VIP 等級列表 */}
          <h2 className="font-bold text-gray-800 flex items-center">
            <Star size={20} className="mr-2 text-yellow-500" />
            所有等級權益
          </h2>

          {vipLevels.map(vip => (
            <div
              key={vip.level}
              className={`rounded-2xl p-5 shadow-md transition-all ${vip.current
                  ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400'
                  : 'bg-white'
                }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`text-3xl ${vip.current ? 'animate-bounce' : ''}`}>
                    {vip.current ? '👑' : '🐕'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 flex items-center">
                      {vip.name}
                      {vip.current && (
                        <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                          當前等級
                        </span>
                      )}
                    </h3>
                    <div className="text-sm text-gray-600">{vip.bone}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">累計儲值</div>
                  <div className="font-bold text-gray-800">${vip.deposit.toLocaleString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs bg-white bg-opacity-50 rounded-xl p-3">
                <div className="text-center">
                  <div className="text-gray-500 mb-1">返水</div>
                  <div className="font-bold text-green-600">{vip.cashback}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 mb-1">提領</div>
                  <div className="font-bold text-blue-600">{vip.withdraw}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 mb-1">生日禮金</div>
                  <div className="font-bold text-pink-600">{vip.level * 500}</div>
                </div>
              </div>
            </div>
          ))}

          {/* VIP 專屬權益 */}
          <div className="bg-white rounded-2xl p-5 shadow-md">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">✨</span>
              金牌會員專屬權益
            </h3>
            <div className="space-y-3">
              {[
                { icon: '💰', title: '每週返水', desc: '最高 0.8% 無上限返水' },
                { icon: '🎁', title: '生日禮金', desc: 'NT$ 1,500 生日專屬紅包' },
                { icon: '⚡', title: '快速提領', desc: '專屬通道 10 分鐘到帳' },
                { icon: '👔', title: '專屬客服', desc: '1對1 VIP 客服經理' },
                { icon: '🎊', title: '專屬活動', desc: '每月限定高額回饋活動' },
                { icon: '🏆', title: '升級禮金', desc: 'NT$ 3,000 升級獎勵' }
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="text-2xl">{benefit.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-sm">{benefit.title}</h4>
                    <p className="text-xs text-gray-500">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // 底部導航欄
  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 shadow-lg z-50">
      <div className="max-w-md mx-auto flex items-center justify-around py-2">
        {[
          { page: 'home', icon: <Home size={24} />, label: '首頁' },
          { page: 'games', icon: <Gamepad2 size={24} />, label: '遊戲' },
          { page: 'deposit', icon: <DollarSign size={24} />, label: '儲值' },
          { page: 'activities', icon: <Gift size={24} />, label: '活動' },
          { page: 'member', icon: <User size={24} />, label: '我的' }
        ].map(item => (
          <button
            key={item.page}
            onClick={() => setCurrentPage(item.page)}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all ${currentPage === item.page
                ? 'text-blue-500 bg-blue-50'
                : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            {item.icon}
            <span className="text-xs font-bold">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // LINE 客服按鈕
  const LineButton = () => (
    <a
      href="https://line.me/ti/p/@your-line-id"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-4 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center justify-center"
    >
      <MessageCircle size={28} />
      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
        客服
      </div>
    </a>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-blue-50 to-pink-50">
      {/* 如果未登入，顯示登入頁面 */}
      {!isLoggedIn && showLogin ? (
        <LoginPage />
      ) : !isLoggedIn ? (
        // 未登入的訪客模式
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-8xl mb-6 animate-bounce">🐶</div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">歡迎來到汪汪娛樂城</h1>
            <p className="text-gray-600 mb-8">天天開心玩、狗狗陪你贏！</p>
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
          {/* 視圖切換器 */}
          <div className="fixed top-4 right-4 z-50 flex space-x-2">
            <button
              onClick={() => setIsMobile(true)}
              className={`px-3 py-2 rounded-lg font-bold text-sm ${isMobile ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
                }`}
            >
              📱 手機版
            </button>
            <button
              onClick={() => setIsMobile(false)}
              className={`px-3 py-2 rounded-lg font-bold text-sm ${!isMobile ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
                }`}
            >
              💻 網頁版
            </button>
            <button
              onClick={() => {
                setIsLoggedIn(false);
                setShowLogin(false);
                setCurrentPage('home');
              }}
              className="px-3 py-2 rounded-lg font-bold text-sm bg-red-500 text-white hover:bg-red-600"
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
                    <div className="text-3xl">🐶</div>
                    <div>
                      <h1 className="font-bold text-gray-800">汪汪娛樂城</h1>
                      <p className="text-xs text-gray-500">安全 · 快速 · 可靠</p>
                    </div>
                  </div>
                  <button className="text-gray-600">
                    <Menu size={24} />
                  </button>
                </div>

                {/* 頁面內容 */}
                {currentPage === 'home' && <HomePage />}
                {currentPage === 'games' && <GamesPage />}
                {currentPage === 'deposit' && <DepositPage />}
                {currentPage === 'activities' && <ActivitiesPage />}
                {currentPage === 'member' && <MemberPage />}

                {/* 底部導航 */}
                <BottomNav />

                {/* LINE 客服 */}
                <LineButton />
              </>
            ) : (
              // 網頁版佈局
              <div className="grid grid-cols-12 gap-6">
                {/* 左側選單 */}
                <div className="col-span-3 space-y-4">
                  <div className="bg-white rounded-3xl p-6 shadow-lg">
                    <div className="text-5xl mb-3 text-center">🐶</div>
                    <h1 className="text-xl font-bold text-center text-gray-800 mb-2">汪汪娛樂城</h1>
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
                  {currentPage === 'home' && <HomePage />}
                  {currentPage === 'games' && <GamesPage />}
                  {currentPage === 'deposit' && <DepositPage />}
                  {currentPage === 'activities' && <ActivitiesPage />}
                  {currentPage === 'member' && <MemberPage />}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* CSS 動畫 */}
      <style jsx>{`
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

export default DoggyCasinoUI;