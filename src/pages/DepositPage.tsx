import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, Loader2, Landmark } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useUserVipInfo } from '../hooks/useUserVipInfo';
import { useSearchParams } from 'react-router-dom';

type PaymentMethod = 'CreditCard' | 'ATM';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const PAYMENT_PROXY_URL = `${SUPABASE_URL}/functions/v1/payment-proxy`;

const DepositPage: React.FC = () => {
    const { profile, loading: profileLoading } = useUserProfile();
    const { currentLevelInfo, loading: vipLoading } = useUserVipInfo();
    const [submitting, setSubmitting] = useState(false);
    const [checking, setChecking] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CreditCard');

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
                    const amount = searchParams.get('amount');
                    const tradeSeq = searchParams.get('tradeSeq');
                    const amountText = amount ? ` NT$${Number(amount).toLocaleString()}` : '';
                    setMessage({ type: 'success', text: `儲值成功！${amountText}，交易編號: ${tradeSeq || ''}` });
                    setSearchParams({}, { replace: true });
                    if (amount) addToLocalBalance(Number(amount));
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
                // 取得 userId
                const stored = localStorage.getItem('userProfile');
                const userId = stored ? JSON.parse(stored).id : '';

                // 呼叫 confirm-and-update：查詢 + 確認交易 + 更新 Supabase 一次完成
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
                    const amount = data.data.amount || '0';
                    setMessage({
                        type: 'success',
                        text: `儲值成功！NT$${Number(amount).toLocaleString()}，交易編號: ${pendingTradeSeq || data.data.facTradeSeq || ''}`,
                    });
                    localStorage.removeItem('pending_authCode');
                    localStorage.removeItem('pending_tradeSeq');
                    localStorage.removeItem('pending_time');
                    addToLocalBalance(Number(amount));
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
                // 查詢失敗時靜默清除，不顯示錯誤給使用者
                localStorage.removeItem('pending_authCode');
                localStorage.removeItem('pending_tradeSeq');
            } finally {
                setChecking(false);
            }
        };

        // 延遲 1 秒再查，讓 GGCard server callback 有時間處理
        const timer = setTimeout(queryOrder, 1000);
        return () => clearTimeout(timer);
    }, [searchParams, setSearchParams]);

    const handleDeposit = async () => {
        if (!profile) {
            setMessage({ type: 'error', text: '請先登入' });
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
                    amount: 1,
                    productName: '汪汪娛樂城儲值',
                    customerId: profile.id,
                    paymentType: paymentMethod,
                    customAmount: true,
                    clientBackURL: `${window.location.origin}/deposit`,
                }),
            });

            const data = await response.json();

            if (data.success && data.data?.transactionUrl) {
                // 保存 authCode 及時間戳供回來後查詢
                localStorage.setItem('pending_authCode', data.data.authCode);
                localStorage.setItem('pending_tradeSeq', data.data.facTradeSeq);
                localStorage.setItem('pending_time', String(Date.now()));
                // 導向 GGCard 付款頁面
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

            {/* 付款方式選擇 */}
            <div className="bg-white rounded-3xl p-5 shadow-md space-y-4">
                <h2 className="text-lg font-bold text-gray-700">選擇付款方式</h2>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setPaymentMethod('CreditCard')}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'CreditCard'
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                    >
                        <CreditCard size={24} />
                        <span className="text-sm font-semibold">信用卡</span>
                    </button>
                    <button
                        onClick={() => setPaymentMethod('ATM')}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'ATM'
                            ? 'border-green-500 bg-green-50 text-green-700 shadow-md'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                    >
                        <Landmark size={24} />
                        <span className="text-sm font-semibold">ATM 轉帳</span>
                    </button>
                </div>

                <button
                    onClick={handleDeposit}
                    disabled={submitting || checking}
                    className={`w-full text-white py-4 rounded-2xl font-bold text-lg shadow-lg transition-transform flex items-center justify-center gap-3 ${submitting || checking
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
                            前往儲值
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default DepositPage;
