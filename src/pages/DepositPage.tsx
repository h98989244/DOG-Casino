import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useUserVipInfo } from '../hooks/useUserVipInfo';
import { useSearchParams } from 'react-router-dom';

const GGCARD_API_URL = import.meta.env.VITE_GGCARD_API_URL || 'https://ggcard-payment-api.log.tw';

const DepositPage: React.FC = () => {
    const { profile, loading: profileLoading } = useUserProfile();
    const { currentLevelInfo, loading: vipLoading } = useUserVipInfo();
    const [submitting, setSubmitting] = useState(false);
    const [checking, setChecking] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();

    // 用儲值金額更新 localStorage 裡的餘額
    const addToLocalBalance = (depositAmount: number) => {
        const stored = localStorage.getItem('userProfile');
        if (!stored) return;
        const user = JSON.parse(stored);
        user.balance = (user.balance || 0) + depositAmount;
        localStorage.setItem('userProfile', JSON.stringify(user));
    };

    // 從 GGCard 回來後，主動查詢訂單狀態
    useEffect(() => {
        const pendingAuthCode = localStorage.getItem('pending_authCode');
        const pendingTradeSeq = localStorage.getItem('pending_tradeSeq');

        // 有 URL 參數或有待查詢的 authCode 時處理
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
                const res = await fetch(`${GGCARD_API_URL}/api/payment/query`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ authCode: pendingAuthCode }),
                });
                const data = await res.json();

                if (data.data?.payResult === '3') {
                    const amount = data.data.amount || '0';
                    setMessage({
                        type: 'success',
                        text: `儲值成功！NT$${Number(amount).toLocaleString()}，交易編號: ${pendingTradeSeq || data.data.facTradeSeq || ''}`,
                    });
                    localStorage.removeItem('pending_authCode');
                    localStorage.removeItem('pending_tradeSeq');
                    addToLocalBalance(Number(amount));
                    setTimeout(() => window.location.reload(), 1500);
                } else if (data.data?.returnCode === '006') {
                    // 授權成功但尚未交易完成，等一下再查
                    setMessage({ type: 'error', text: '交易處理中，請稍候重新整理頁面確認結果' });
                    // 不清除 localStorage，下次重整還能查
                } else {
                    setMessage({
                        type: 'error',
                        text: `儲值失敗：${data.data?.returnMsg || '未知錯誤'}，交易編號: ${pendingTradeSeq || '無'}`,
                    });
                    localStorage.removeItem('pending_authCode');
                    localStorage.removeItem('pending_tradeSeq');
                }
            } catch (err) {
                console.error('查詢訂單失敗:', err);
                setMessage({ type: 'error', text: '查詢訂單狀態失敗，請稍後重新整理頁面' });
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

            const response = await fetch(`${GGCARD_API_URL}/api/payment/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 1,
                    productName: '汪汪娛樂城儲值',
                    customerId: profile.id,
                    paymentType: 'TestSNo',
                    customAmount: true,
                    clientBackURL: `${window.location.origin}/deposit`,
                }),
            });

            const data = await response.json();

            if (data.success && data.data?.transactionUrl) {
                // 保存 authCode 供回來後查詢
                localStorage.setItem('pending_authCode', data.data.authCode);
                localStorage.setItem('pending_tradeSeq', data.data.facTradeSeq);
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

            {/* 快速儲值 */}
            <div className="bg-white rounded-3xl p-5 shadow-md">
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
                            快速儲值
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default DepositPage;
