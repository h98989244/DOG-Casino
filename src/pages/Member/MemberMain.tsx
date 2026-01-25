import React from 'react';
import { User, Trophy, DollarSign, Gift, Star, ChevronRight } from 'lucide-react';

interface MemberMainProps {
    setMemberSubPage: (page: string) => void;
}

const MemberMain: React.FC<MemberMainProps> = ({ setMemberSubPage }) => {
    return (
        <div className="space-y-4 pb-20">
            {/* 會員資訊卡 */}
            <div className="bg-gradient-to-br from-blue-400 to-purple-400 rounded-3xl p-6 shadow-lg text-white">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-4xl">
                        🐕
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold">Wang***88</h2>
                        <div className="flex items-center space-x-2 mt-1">
                            <Star size={16} fill="gold" color="gold" />
                            <span className="text-sm">VIP 3 金牌會員</span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3 bg-white bg-opacity-20 rounded-2xl p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold">12,888</div>
                        <div className="text-xs opacity-90">餘額</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">156</div>
                        <div className="text-xs opacity-90">投注次數</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">🦴🦴🦴</div>
                        <div className="text-xs opacity-90">狗骨頭</div>
                    </div>
                </div>
            </div>

            {/* 功能選單 */}
            <div className="bg-white rounded-3xl shadow-md overflow-hidden">
                {[
                    { id: 'profile', icon: <User />, label: '個人資料', color: 'text-blue-500' },
                    { id: 'bets', icon: <Trophy />, label: '我的投注', color: 'text-purple-500' },
                    { id: 'transactions', icon: <DollarSign />, label: '交易紀錄', color: 'text-green-500' },
                    { id: 'promotions', icon: <Gift />, label: '優惠紀錄', color: 'text-pink-500' },
                    { id: 'vip', icon: <Star />, label: 'VIP 權益', color: 'text-yellow-500' }
                ].map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => setMemberSubPage(item.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b last:border-b-0"
                    >
                        <div className="flex items-center space-x-3">
                            <div className={item.color}>{item.icon}</div>
                            <span className="font-bold text-gray-800">{item.label}</span>
                        </div>
                        <ChevronRight className="text-gray-400" size={20} />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MemberMain;
