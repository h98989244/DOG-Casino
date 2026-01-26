import React from 'react';
import { Clock } from 'lucide-react';
import MemberBackButton from '../../components/MemberBackButton';
import { useUserTransactions } from '../../hooks/useUserTransactions';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

interface MemberTransactionsPageProps {
    setMemberSubPage: (page: string) => void;
}

const MemberTransactionsPage: React.FC<MemberTransactionsPageProps> = ({ setMemberSubPage }) => {
    const { transactions, loading, error } = useUserTransactions({ limit: 50 });

    if (loading) {
        return <LoadingSpinner text="載入交易紀錄中..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    // 計算本月交易總額
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.created_at);
        return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    const monthlyDeposit = monthlyTransactions
        .filter(tx => tx.type === 'deposit' && tx.status === 'completed')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const monthlyTotal = monthlyDeposit;

    // 類型中文對照
    const typeMap: Record<string, string> = {
        'deposit': '儲值',
        'withdrawal': '提領',
        'bonus': '紅利',
        'refund': '退款'
    };

    // 狀態中文對照
    const statusMap: Record<string, string> = {
        'pending': '處理中',
        'completed': '成功',
        'failed': '失敗',
        'cancelled': '已取消'
    };

    // 格式化時間
    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-4 pb-20">
            <MemberBackButton setMemberSubPage={setMemberSubPage} />
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
                <div className="text-3xl font-bold mb-2">NT$ {monthlyTotal.toLocaleString()}</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>儲值:NT$ {monthlyDeposit.toLocaleString()}</div>

                </div>
            </div>

            {/* 類型篩選 */}
            <div className="flex space-x-2">
                {['全部', '儲值'].map(type => (
                    <button
                        key={type}
                        className="px-4 py-2 bg-white rounded-full font-bold text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-500 shadow-sm"
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* 交易列表 */}
            {transactions.length === 0 ? (
                <EmptyState
                    icon="💰"
                    title="尚無交易紀錄"
                /*description="開始進行儲值或提領交易吧!"*/
                />
            ) : (
                transactions.map(tx => {
                    const typeText = typeMap[tx.type] || tx.type;
                    const statusText = statusMap[tx.status] || tx.status;
                    const isDeposit = tx.type === 'deposit' || tx.type === 'bonus';

                    return (
                        <div key={tx.id} className="bg-white rounded-2xl p-4 shadow-md">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDeposit ? 'bg-green-100' : 'bg-blue-100'
                                        }`}>
                                        {isDeposit ? '💵' : '🏦'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{typeText}</h3>
                                        <p className="text-xs text-gray-500">{tx.payment_method || '系統'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-lg font-bold ${isDeposit ? 'text-green-600' : 'text-blue-600'
                                        }`}>
                                        {isDeposit ? '+' : '-'}{Math.abs(tx.amount).toLocaleString()}
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${tx.status === 'completed' ? 'bg-green-100 text-green-600' :
                                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-red-100 text-red-600'
                                        }`}>
                                        {statusText}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t">
                                <span>訂單號:{tx.transaction_id || tx.id.substring(0, 16)}</span>
                                <span className="flex items-center">
                                    <Clock size={12} className="mr-1" />
                                    {formatTime(tx.created_at)}
                                </span>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default MemberTransactionsPage;
