import React from 'react';
import { Clock } from 'lucide-react';
import MemberBackButton from '../../components/MemberBackButton';
import { useUserBets } from '../../hooks/useUserBets';
import { useUserStats } from '../../hooks/useUserStats';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

interface MemberBetsPageProps {
    setMemberSubPage: (page: string) => void;
}

const MemberBetsPage: React.FC<MemberBetsPageProps> = ({ setMemberSubPage }) => {
    const { bets, loading: betsLoading, error: betsError } = useUserBets({ limit: 50 });
    const { stats, loading: statsLoading } = useUserStats();

    const loading = betsLoading || statsLoading;
    const error = betsError;

    if (loading) {
        return <LoadingSpinner text="載入投注紀錄中..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    // 計算勝率
    const winRate = bets.length > 0
        ? Math.round((bets.filter(b => b.status === 'win').length / bets.length) * 100)
        : 0;

    // 計算總盈利
    const totalProfit = stats?.totalWinAmount && stats?.totalBetAmount
        ? stats.totalWinAmount - stats.totalBetAmount
        : 0;

    // 遊戲類型中文對照
    const gameTypeMap: Record<string, string> = {
        'sports': '體育投注',
        'live_casino': '真人百家樂',
        'slots': '電子老虎機',
        'fishing': '捕魚達人',
        'cards': '棋牌遊戲'
    };

    // 狀態中文對照
    const statusMap: Record<string, string> = {
        'pending': '進行中',
        'win': '贏',
        'lose': '輸',
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
                <span className="mr-2">🎮</span>
                我的投注
            </h1>

            {/* 統計卡片 */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl p-4 text-white shadow-lg">
                    <div className="text-2xl font-bold">{stats?.betCount || 0}</div>
                    <div className="text-xs opacity-90">總投注</div>
                </div>
                <div className={`bg-gradient-to-br ${totalProfit >= 0 ? 'from-green-400 to-emerald-400' : 'from-red-400 to-pink-400'} rounded-2xl p-4 text-white shadow-lg`}>
                    <div className="text-2xl font-bold">{totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString()}</div>
                    <div className="text-xs opacity-90">總盈利</div>
                </div>
                <div className="bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl p-4 text-white shadow-lg">
                    <div className="text-2xl font-bold">{winRate}%</div>
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
            {bets.length === 0 ? (
                <EmptyState
                    icon="🎮"
                    title="尚無投注紀錄"
                    description="開始遊戲,創造您的第一筆投注紀錄吧!"
                />
            ) : (
                bets.map(bet => {
                    const profit = bet.win_amount - bet.bet_amount;
                    const statusText = statusMap[bet.status] || bet.status;
                    const gameText = gameTypeMap[bet.game_type] || bet.game_name;

                    return (
                        <div key={bet.id} className="bg-white rounded-2xl p-4 shadow-md">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-800">{gameText}</h3>
                                    <p className="text-xs text-gray-500 mt-1">訂單號:{bet.id.substring(0, 16)}...</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${bet.status === 'win' ? 'bg-green-100 text-green-600' :
                                        bet.status === 'lose' ? 'bg-red-100 text-red-600' :
                                            bet.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                                'bg-gray-100 text-gray-600'
                                    }`}>
                                    {statusText}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                                <div>
                                    <div className="text-gray-500 text-xs">投注金額</div>
                                    <div className="font-bold text-gray-800">NT$ {bet.bet_amount.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500 text-xs">盈虧</div>
                                    <div className={`font-bold ${profit > 0 ? 'text-green-600' : profit < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                        {profit > 0 ? '+' : ''}{profit.toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-500 text-xs">狀態</div>
                                    <div className="font-bold text-gray-800">{statusText}</div>
                                </div>
                            </div>

                            <div className="text-xs text-gray-400 flex items-center">
                                <Clock size={12} className="mr-1" />
                                {formatTime(bet.created_at)}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default MemberBetsPage;
