import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useUserVipInfo } from '../hooks/useUserVipInfo';
import { useSearchParams } from 'react-router-dom';

const GGCARD_API_URL = import.meta.env.VITE_GGCARD_API_URL || 'https://ggcard-payment-api.log.tw';

const DepositPage: React.FC = () => {
    const { profile, loading: profileLoading } = useUserProfile();
    const { currentLevelInfo, loading: vipLoading } = useUserVipInfo();
    const [selectedAmount, setSelectedAmount] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();

    // 處理付款回調結果
    useEffect(() => {
        const result = searchParams.get('result');
        const tradeSeq = searchParams.get('tradeSeq');

        if (result) {
            if (result === '3') {
                setMessage({ type: 'success', text: `儲值成功！交易編號: ${tradeSeq || ''}` });
                setSearchParams({}, { replace: true });
                setTimeout(() => window.location.reload(), 2000);
                return;
            } else {
                const resultMap: Record<string, string> = {
                    '0': '交易失敗',
                    '1': '交易未完成',
                    '2': '交易處理中',
                };
                const resultText = resultMap[result] || `未知狀態 (${result})`;
                setMessage({ type: 'error', text: `儲值${resultText}，交易編號: ${tradeSeq || '無'}` });
            }
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const handleDeposit = async () => {
        if (!profile) {
            setMessage({ type: 'error', text: '請先登入' });
            return;
        }

        if (!selectedAmount) {
            setMessage({ type: 'error', text: '請選擇儲值金額' });
            return;
        }

        try {
            setSubmitting(true);
            setMessage(null);

            const response = await fetch(`${GGCARD_API_URL}/api/payment/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: Number(selectedAmount),
                    productName: '汪汪娛樂城儲值',
                    customerId: profile.id,
                    paymentType: '',
                    clientBackURL: `${window.location.origin}/deposit`,
                }),
            });

            const data = await response.json();

            if (data.success && data.data?.transactionUrl) {
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
                            onClick={() => setSelectedAmount(amount)}
                            disabled={submitting}
                            className={`border-2 rounded-2xl py-3 font-bold transition-all hover:scale-105 ${selectedAmount === amount
                                ? 'bg-blue-100 border-blue-500 text-blue-700'
                                : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600'
                                } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            ${amount}
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleDeposit}
                    disabled={submitting || !selectedAmount}
                    className={`w-full text-white py-3 rounded-2xl font-bold shadow-lg transition-transform flex items-center justify-center gap-2 ${submitting || !selectedAmount
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:scale-105'
                        }`}
                >
                    {submitting ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            導向付款頁面中...
                        </>
                    ) : '確認儲值'}
                </button>
            </div>
        </div>
    );
};

export default DepositPage;
