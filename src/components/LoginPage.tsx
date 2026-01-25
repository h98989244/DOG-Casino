import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';

interface LoginPageProps {
    isMobile: boolean;
    setIsLoggedIn: (value: boolean) => void;
    setShowLogin: (value: boolean) => void;
    setCurrentPage: (page: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ isMobile, setIsLoggedIn, setShowLogin, setCurrentPage }) => {
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
                                    忘記密碼?
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
                                    邀請碼(非必填)
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

                {/* 客服提示 */}
                <div className="mt-6 bg-white rounded-2xl p-4 shadow-md text-center">
                    <p className="text-sm text-gray-600 mb-2">遇到問題?</p>
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

export default LoginPage;
