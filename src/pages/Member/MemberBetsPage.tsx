import React from 'react';
import { Clock } from 'lucide-react';
import MemberBackButton from '../../components/MemberBackButton';

interface MemberBetsPageProps {
    setMemberSubPage: (page: string) => void;
}

const MemberBetsPage: React.FC<MemberBetsPageProps> = ({ setMemberSubPage }) => {
    const bets = [
        { id: '202401231234', game: '真人百家樂', amount: 1000, result: '贏', profit: 980, time: '2024-01-23 14:23', status: '已結算' },
        { id: '202401231156', game: '電子老虎機', amount: 500, result: '贏', profit: 1500, time: '2024-01-23 11:56', status: '已結算' },
        { id: '202401230945', game: '體育投注', amount: 2000, result: '輸', profit: -2000, time: '2024-01-23 09:45', status: '已結算' },
        { id: '202401221845', game: '捕魚達人', amount: 300, result: '贏', profit: 120, time: '2024-01-22 18:45', status: '已結算' }
    ];

    return (
        <div className="space-y-4 pb-20">
            <MemberBackButton setMemberSubPage={setMemberSubPage} />
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
                            <p className="text-xs text-gray-500 mt-1">訂單號:{bet.id}</p>
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
};

export default MemberBetsPage;
