import React from 'react';
import MemberBackButton from '../../components/MemberBackButton';
import { useUserPromotions } from '../../hooks/useUserPromotions';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

interface MemberPromotionsPageProps {
    setMemberSubPage: (page: string) => void;
}

const MemberPromotionsPage: React.FC<MemberPromotionsPageProps> = ({ setMemberSubPage }) => {
    const { promotions, loading, error } = useUserPromotions();

    if (loading) {
        return <LoadingSpinner text="載入優惠紀錄中..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    // 計算累計獲得優惠
    const totalBonus = promotions.reduce((sum, promo) => sum + promo.bonus_received, 0);
    const totalCount = promotions.length;

    // 狀態中文對照
    const statusMap: Record<string, string> = {
        'active': '進行中',
        'completed': '已完成',
        'expired': '已過期',
        'cancelled': '已取消'
    };

    // 格式化日期
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('zh-TW');
    };

    return (
        <div className="space-y-4 pb-20">
            <MemberBackButton setMemberSubPage={setMemberSubPage} />
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">🎁</span>
                優惠紀錄
            </h1>

            {/* 總獎勵卡片 */}
            <div className="bg-gradient-to-br from-pink-400 to-purple-400 rounded-3xl p-6 shadow-lg text-white">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm opacity-90">累計獲得優惠</span>
                    <span className="text-3xl">🎉</span>
                </div>
                <div className="text-4xl font-bold mb-2">NT$ {totalBonus.toLocaleString()}</div>
                <div className="text-sm opacity-90">共參加 {totalCount} 次活動</div>
            </div>

            {/* 狀態篩選 */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
                {['全部', '進行中', '已完成', '已過期'].map(status => (
                    <button
                        key={status}
                        className="px-4 py-2 bg-white rounded-full font-bold text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-500 whitespace-nowrap shadow-sm"
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* 優惠列表 */}
            {promotions.length === 0 ? (
                <EmptyState
                    icon="🎁"
                    title="尚無優惠紀錄"
                    description="參加優惠活動,獲得更多獎勵!"
                />
            ) : (
                promotions.map(promo => {
                    const statusText = statusMap[promo.status] || promo.status;
                    const promotion = promo.promotion;

                    return (
                        <div key={promo.id} className="bg-white rounded-2xl p-4 shadow-md">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 mb-1">{promotion.title}</h3>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-2xl font-bold text-orange-500">
                                            +NT$ {promo.bonus_received.toLocaleString()}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${promo.status === 'active' ? 'bg-green-100 text-green-600' :
                                                promo.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                                                    'bg-gray-100 text-gray-600'
                                            }`}>
                                            {statusText}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-4xl">
                                    {promo.status === 'active' ? '🎁' : '✨'}
                                </div>
                            </div>

                            {/* 流水進度 */}
                            {promo.wagering_required && promo.wagering_required > 0 && (
                                <div className="mb-3">
                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                        <span>流水進度</span>
                                        <span>{promo.wagering_completed.toLocaleString()} / {promo.wagering_required.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all"
                                            style={{
                                                width: `${Math.min((promo.wagering_completed / promo.wagering_required) * 100, 100)}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                                <span>領取日期:{formatDate(promo.claimed_at)}</span>
                                {promo.completed_at && (
                                    <span>完成日期:{formatDate(promo.completed_at)}</span>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default MemberPromotionsPage;
