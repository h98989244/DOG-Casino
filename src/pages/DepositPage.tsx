import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useUserVipInfo } from '../hooks/useUserVipInfo';
import { useSearchParams } from 'react-router-dom';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const PAYMENT_PROXY_URL = `${SUPABASE_URL}/functions/v1/payment-proxy`;

const AMOUNT_OPTIONS = [100, 300, 500, 1000, 3000, 5000];

const DepositPage: React.FC = () => {
    const { profile, loading: profileLoading } = useUserProfile();
    const { currentLevelInfo, loading: vipLoading } = useUserVipInfo();
    const [submitting, setSubmitting] = useState(false);
    const [checking, setChecking] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const [amount, setAmount] = useState('');
    const [customAmount, setCustomAmount] = useState(false);

    // 用儲值金額更新 localStorage 裡的餘額
    const addToLocalBalance = (depositAmount: number) => {
        const stored = localStorage.getItem('userProfile');
        if (!stored) return;
        const user = JSON.parse(stored);
        user.balance = (user.balance || 0) + depositAmount;
        localStorage.setItem('userProfile', JSON.stringify(user));
    };

    // 從付款頁面回來後，主動查詢訂單狀態
    useEffect(() => {
        const pendingAuthCode = localStorage.getItem('pending_authCode');
        const pendingTradeSeq = localStorage.getItem('pending_tradeSeq');
        const pendingTime = localStorage.getItem('pending_time');

        // 超過 10 分鐘或無時間戳的待查訂單視為過期，靜默清除
        if (pendingAuthCode && (!pendingTime || Date.now() - Number(pendingTime) > 10 * 60 * 1000)) {
            localStorage.removeItem('pending_authCode');
            localStorage.removeItem('pending_tradeSeq');
            localStorage.removeItem('pending_time');
            return;
        }

        const result = searchParams.get('result');

        if (!pendingAuthCode) {
            // 沒有待查詢的訂單，檢查 URL 參數（來自 worker redirect）
            if (result) {
                if (result === '3') {
                    const amt = searchParams.get('amount');
                    const tradeSeq = searchParams.get('tradeSeq');
                    const amountText = amt ? ` NT$${Number(amt).toLocaleString()}` : '';
                    setMessage({ type: 'success', text: `儲值成功！${amountText}，交易編號: ${tradeSeq || ''}` });
                    setSearchParams({}, { replace: true });
                    if (amt) addToLocalBalance(Number(amt));
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    const resultMap: Record<string, string> = {
                        '0': '交易失敗',
                        '1': '交易未完成',
                        '2': '交易處理中',
                    };
                    const tradeSeq = searchParams.get('tradeSeq');
                    const resultText = resultMap[result] || `未知狀態 (${result})`;
                    setMessage({ type: 'error', text: `儲值${resultText}，交易編號: ${tradeSeq || '無'}` });
                    setSearchParams({}, { replace: true });
                }
            }
            return;
        }

        // 有待查詢的 authCode，主動查詢訂單狀態
        setSearchParams({}, { replace: true });
        setChecking(true);

        const queryOrder = async () => {
            try {
                const stored = localStorage.getItem('userProfile');
                const userId = stored ? JSON.parse(stored).id : '';

                const res = await fetch(PAYMENT_PROXY_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    },
                    body: JSON.stringify({
                        endpoint: '/api/payment/confirm-and-update',
                        authCode: pendingAuthCode,
                        userId,
                    }),
                });
                const data = await res.json();

                if (data.success && data.data?.payResult === '3') {
                    const amt = data.data.amount || '0';
                    setMessage({
                        type: 'success',
                        text: `儲值成功！NT$${Number(amt).toLocaleString()}，交易編號: ${pendingTradeSeq || data.data.facTradeSeq || ''}`,
                    });
                    localStorage.removeItem('pending_authCode');
                    localStorage.removeItem('pending_tradeSeq');
                    localStorage.removeItem('pending_time');
                    addToLocalBalance(Number(amt));
                    setTimeout(() => window.location.reload(), 1500);
                } else if (data.data?.returnCode === '006') {
                    setMessage({ type: 'error', text: '交易處理中，請稍候重新整理頁面確認結果' });
                } else {
                    setMessage({
                        type: 'error',
                        text: `儲值失敗：${data.message || '未知錯誤'}，交易編號: ${pendingTradeSeq || '無'}`,
                    });
                    localStorage.removeItem('pending_authCode');
                    localStorage.removeItem('pending_tradeSeq');
                    localStorage.removeItem('pending_time');
                }
            } catch (err) {
                console.error('查詢訂單失敗:', err);
                localStorage.removeItem('pending_authCode');
                localStorage.removeItem('pending_tradeSeq');
                localStorage.removeItem('pending_time');
            } finally {
                setChecking(false);
            }
        };

        const timer = setTimeout(queryOrder, 1000);
        return () => clearTimeout(timer);
    }, [searchParams, setSearchParams]);

    const handleDeposit = async () => {
        if (!profile) {
            setMessage({ type: 'error', text: '請先登入' });
            return;
        }

        const depositAmount = Number(amount);
        if (!depositAmount || depositAmount < 1) {
            setMessage({ type: 'error', text: '請輸入儲值金額' });
            return;
        }

        try {
            setSubmitting(true);
            setMessage(null);

            const response = await fetch(PAYMENT_PROXY_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                    endpoint: '/api/payment/create-order',
                    amount: depositAmount,
                    productName: '汪汪娛樂城儲值',
                    customerId: profile.id,
                    paymentType: 'CreditCard',
                    customAmount: true,
                    clientBackURL: `${window.location.origin}/deposit`,
                }),
            });

            const data = await response.json();

            if (data.success && data.data?.transactionUrl) {
                localStorage.setItem('pending_authCode', data.data.authCode);
                localStorage.setItem('pending_tradeSeq', data.data.facTradeSeq);
                localStorage.setItem('pending_time', String(Date.now()));
                window.location.href = data.data.transactionUrl;
            } else {
                throw new Error(data.error?.message || data.message || '建立訂單失敗');
            }
        } catch (err: any) {
            console.error('儲值失敗:', err);
            setMessage({ type: 'error', text: err.message || '儲值失敗，請稍後再試' });
            setSubmitting(false);
        }
    };

    const isLoading = profileLoading || vipLoading;

    return (
        <div className="space-y-4 pb-20">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">💰</span>
                儲值
            </h1>

            {/* 訊息提示 */}
            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    {message.text}
                </div>
            )}

            {checking && (
                <div className="p-4 rounded-xl flex items-center gap-2 bg-blue-100 text-blue-700">
                    <Loader2 size={20} className="animate-spin" />
                    正在查詢交易結果...
                </div>
            )}

            {/* 餘額卡片 */}
            <div className="bg-gradient-to-br from-yellow-400 to-orange-300 rounded-3xl p-6 shadow-lg text-white">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm opacity-90">當前餘額</span>
                    <span className="text-2xl">{currentLevelInfo?.icon || '🐕‍🦺'}</span>
                </div>
                <div className="text-4xl font-bold mb-2">
                    {isLoading ? 'Loading...' : `NT$ ${profile?.balance?.toLocaleString() || '0'}`}
                </div>
                <div className="text-sm opacity-90">
                    VIP 等級: {isLoading ? '...' : (currentLevelInfo?.name || `等級 ${profile?.vip_level}`)}
                </div>
            </div>

            {/* 儲值金額 */}
            <div className="bg-white rounded-3xl p-5 shadow-md space-y-4">
                <h2 className="text-lg font-bold text-gray-700">儲值金額</h2>

                {/* 快選金額 */}
                <div className="grid grid-cols-3 gap-3">
                    {AMOUNT_OPTIONS.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => { setAmount(String(opt)); setCustomAmount(false); }}
                            className={`py-3 rounded-2xl border-2 font-semibold text-sm transition-all ${amount === String(opt) && !customAmount
                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                        >
                            NT$ {opt.toLocaleString()}
                        </button>
                    ))}
                </div>

                {/* 自訂金額 */}
                <div>
                    <button
                        onClick={() => { setCustomAmount(true); setAmount(''); }}
                        className={`w-full text-left text-sm mb-2 ${customAmount ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}
                    >
                        自訂金額
                    </button>
                    {customAmount && (
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">NT$</span>
                            <input
                                type="number"
                                min="1"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="輸入金額"
                                className="w-full pl-14 pr-4 py-3 border-2 border-blue-300 rounded-2xl text-lg font-semibold focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    )}
                </div>

                <button
                    onClick={handleDeposit}
                    disabled={submitting || checking || !amount}
                    className={`w-full text-white py-4 rounded-2xl font-bold text-lg shadow-lg transition-transform flex items-center justify-center gap-3 ${submitting || checking || !amount
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:scale-105'
                        }`}
                >
                    {submitting ? (
                        <>
                            <Loader2 size={22} className="animate-spin" />
                            導向付款頁面中...
                        </>
                    ) : (
                        <>
                            <CreditCard size={22} />
                            {amount ? `信用卡儲值 NT$ ${Number(amount).toLocaleString()}` : '請選擇金額'}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default DepositPage;
