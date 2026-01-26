import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useUserProfile } from '../hooks/useUserProfile';
import { useUserVipInfo } from '../hooks/useUserVipInfo';

const DepositPage: React.FC = () => {
    // 移除 useAuth，改用 useUserProfile 判斷登入狀態
    // const { user } = useAuth();
    const { profile, loading: profileLoading } = useUserProfile();
    const { currentLevelInfo, loading: vipLoading } = useUserVipInfo();
    const [selectedAmount, setSelectedAmount] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleDeposit = async () => {
        // 使用 profile 判斷是否登入
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

            // 獲取 LINE ID Token
            const idToken = window.liff?.getIDToken();
            if (!idToken) {
                // 如果沒有 idToken，嘗試重新登入或報錯
                // 在 LIFF 環境下通常會有，除非過期
                throw new Error('無法取得驗證資訊，請重新登入');
            }

            // 改用 Edge Function 建立交易，繞過 RLS 問題並進行伺服器端驗證
            const { data, error } = await supabase.functions.invoke('create-deposit', {
                body: {
                    idToken: idToken,
                    amount: Number(selectedAmount),
                    paymentMethod: 'quick_pay'
                }
            });

            if (error) {
                console.error('Edge Function Error:', error);
                throw new Error(error.message || '連線失敗');
            }

            if (!data.success) {
                throw new Error(data.error || '儲值申請失敗');
            }

            // 直接寫入 DB 的舊代碼 (已註解)
            /*
            const { error } = await supabase.from('transactions').insert({
                user_id: user.id,
                type: 'deposit',
                amount: Number(selectedAmount),
                status: 'pending', // 或是 completed，視業務邏輯而定，這裡先設為 pending
                payment_method: 'quick_pay',
                description: `快速儲值 ${selectedAmount}`
            });
            */

            setMessage({ type: 'success', text: '儲值申請已提交，請稍候' });
            setSelectedAmount('');
        } catch (err: any) {
            console.error('儲值失敗:', err);
            setMessage({ type: 'error', text: err.message || '儲值失敗，請稍後再試' });
        } finally {
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
                <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
                            className={`border-2 rounded-2xl py-3 font-bold transition-all hover:scale-105 ${selectedAmount === amount
                                ? 'bg-blue-100 border-blue-500 text-blue-700'
                                : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600'
                                }`}
                        >
                            ${amount}
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleDeposit}
                    disabled={submitting || !selectedAmount}
                    className={`w-full text-white py-3 rounded-2xl font-bold shadow-lg transition-transform ${submitting || !selectedAmount
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:scale-105'
                        }`}
                >
                    {submitting ? '處理中...' : '確認儲值'}
                </button>
            </div>
        </div>
    );
};

export default DepositPage;

