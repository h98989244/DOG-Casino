import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
    isMobile: boolean;
    setIsLoggedIn: (value: boolean) => void;
    setShowLogin: (value: boolean) => void;
    setCurrentPage: (page: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ isMobile, setIsLoggedIn, setShowLogin, setCurrentPage }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        inviteCode: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setError('');
        setLoading(true);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (authError) {
                setError(authError.message);
                return;
            }

            if (data.user) {
                setIsLoggedIn(true);
                setShowLogin(false);
                setCurrentPage('home');
            }
        } catch (err: any) {
            setError(err.message || '登入失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('密碼不一致');
            return;
        }

        if (formData.password.length < 6) {
            setError('密碼至少需要 6 個字元');
            return;
        }

        setLoading(true);

        try {
            const { data, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        phone: formData.phone,
                        invite_code: formData.inviteCode
                    }
                }
            });

            if (authError) {
                setError(authError.message);
                return;
            }

            if (data.user) {
                setIsLoggedIn(true);
                setShowLogin(false);
                setCurrentPage('home');
            }
        } catch (err: any) {
            setError(err.message || '註冊失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleLineLogin = () => {
        window.open('https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=YOUR_LINE_CHANNEL_ID&redirect_uri=YOUR_CALLBACK_URL&state=12345abcde&scope=profile%20openid', '_blank');
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
                            onClick={() => {
                                setIsLogin(true);
                                setError('');
                            }}
                            className={`flex-1 py-3 rounded-xl font-bold transition-all ${isLogin
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'text-gray-500'
                                }`}
                        >
                            會員登入
                        </button>
                        <button
                            onClick={() => {
                                setIsLogin(false);
                                setError('');
                            }}
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

                    {/* 錯誤訊息 */}
                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* 登入表單 */}
                    {isLogin ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="請輸入 Email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-400 outline-none transition-all text-gray-900 bg-white"
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
                                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-400 outline-none transition-all text-gray-900 bg-white"
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
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? '登入中...' : '立即登入'}
                            </button>
                        </div>
                    ) : (
                        // 註冊表單
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="請輸入 Email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-400 outline-none transition-all text-gray-900 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    密碼
                                </label>
                                <input
                                    type="password"
                                    placeholder="至少 6 個字元"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-400 outline-none transition-all text-gray-900 bg-white"
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
                                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-400 outline-none transition-all text-gray-900 bg-white"
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
                                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-400 outline-none transition-all text-gray-900 bg-white"
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
                                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-400 outline-none transition-all text-gray-900 bg-white"
                                />
                            </div>
                            <div className="flex items-start space-x-2 text-sm text-gray-600">
                                <input type="checkbox" className="mt-1" />
                                <span>我已閱讀並同意<span className="text-blue-500 font-bold">服務條款</span>及<span className="text-blue-500 font-bold">隱私政策</span></span>
                            </div>
                            <button
                                onClick={handleRegister}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? '註冊中...' : '立即註冊'}
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
