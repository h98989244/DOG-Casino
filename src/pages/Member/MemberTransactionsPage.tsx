import React from 'react';
import { Clock } from 'lucide-react';
import MemberBackButton from '../../components/MemberBackButton';

interface MemberTransactionsPageProps {
    setMemberSubPage: (page: string) => void;
}

const MemberTransactionsPage: React.FC<MemberTransactionsPageProps> = ({ setMemberSubPage }) => {
    const transactions = [
        { id: 'T202401231545', type: '儲值', amount: 5000, status: '成功', time: '2024-01-23 15:45', method: '銀行轉帳' },
        { id: 'T202401231234', type: '提領', amount: -3000, status: '處理中', time: '2024-01-23 12:34', method: '銀行轉帳' },
        { id: 'T202401220956', type: '儲值', amount: 10000, status: '成功', time: '2024-01-22 09:56', method: '超商代碼' },
        { id: 'T202401211823', type: '提領', amount: -2000, status: '成功', time: '2024-01-21 18:23', method: '銀行轉帳' }
    ];

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
                <div className="text-3xl font-bold mb-2">NT$ 18,000</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>儲值:NT$ 15,000</div>
                    <div>提領:NT$ 3,000</div>
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
                        <span>訂單號:{tx.id}</span>
                        <span className="flex items-center">
                            <Clock size={12} className="mr-1" />
                            {tx.time}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MemberTransactionsPage;
