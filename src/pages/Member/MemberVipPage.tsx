import React from 'react';
import { Star } from 'lucide-react';
import MemberBackButton from '../../components/MemberBackButton';
import { useVipLevels } from '../../hooks/useVipLevels';
import { useUserVipInfo } from '../../hooks/useUserVipInfo';
import { useVipBenefits } from '../../hooks/useVipBenefits';
import { useUserProfile } from '../../hooks/useUserProfile';

interface MemberVipPageProps {
    setMemberSubPage: (page: string) => void;
}

const MemberVipPage: React.FC<MemberVipPageProps> = ({ setMemberSubPage }) => {
    const { profile } = useUserProfile();
    const { vipLevels, loading: levelsLoading } = useVipLevels();
    const { totalDeposit, currentLevelInfo, nextLevel, loading: vipInfoLoading } = useUserVipInfo();
    const { benefits, loading: benefitsLoading } = useVipBenefits(profile?.vip_level || null);

    const loading = levelsLoading || vipInfoLoading || benefitsLoading;

    if (loading) {
        return (
            <div className="space-y-4 pb-20">
                <MemberBackButton setMemberSubPage={setMemberSubPage} />
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="text-6xl mb-4 animate-bounce">🐶</div>
                        <p className="text-gray-600">載入中...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile || !currentLevelInfo) {
        return (
            <div className="space-y-4 pb-20">
                <MemberBackButton setMemberSubPage={setMemberSubPage} />
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="text-6xl mb-4">😢</div>
                        <p className="text-gray-600">無法載入 VIP 資訊</p>
                    </div>
                </div>
            </div>
        );
    }

    // 計算升級進度
    const upgradeProgress = nextLevel
        ? Math.min(((totalDeposit - currentLevelInfo.min_deposit) / (nextLevel.min_deposit - currentLevelInfo.min_deposit)) * 100, 100)
        : 100;

    const remainingDeposit = nextLevel ? Math.max(nextLevel.min_deposit - totalDeposit, 0) : 0;

    return (
        <div className="space-y-4 pb-20">
            <MemberBackButton setMemberSubPage={setMemberSubPage} />
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">👑</span>
                VIP 權益
            </h1>

            {/* 當前等級卡片 */}
            <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-3xl p-6 shadow-lg text-white">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-4xl mb-2">{currentLevelInfo.icon}</div>
                        <h2 className="text-2xl font-bold">{currentLevelInfo.name}</h2>
                        <p className="text-sm opacity-90">VIP Level {currentLevelInfo.level}</p>
                    </div>
                    <div className="text-6xl">👑</div>
                </div>

                {nextLevel ? (
                    <div className="bg-white bg-opacity-20 rounded-2xl p-4 mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm">升級進度</span>
                            <span className="text-sm font-bold">
                                ${totalDeposit.toLocaleString()} / ${nextLevel.min_deposit.toLocaleString()}
                            </span>
                        </div>
                        <div className="bg-white bg-opacity-30 rounded-full h-3 overflow-hidden">
                            <div className="bg-white h-full rounded-full" style={{ width: `${upgradeProgress}%` }}></div>
                        </div>
                        <p className="text-xs mt-2 opacity-90">
                            再儲值 NT$ {remainingDeposit.toLocaleString()} 即可升級至{nextLevel.name}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white bg-opacity-20 rounded-2xl p-4 mb-4">
                        <p className="text-sm text-center">🎉 您已達到最高等級!</p>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center">
                        <div className="font-bold text-lg">{(currentLevelInfo.cashback_rate * 100).toFixed(1)}%</div>
                        <div className="text-xs opacity-90">返水比例</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-lg">
                            {currentLevelInfo.daily_withdrawal_limit === -1
                                ? '無限'
                                : `${currentLevelInfo.daily_withdrawal_limit}次`}
                        </div>
                        <div className="text-xs opacity-90">每日提領</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-lg">專屬</div>
                        <div className="text-xs opacity-90">客服經理</div>
                    </div>
                </div>
            </div>

            {/* VIP 等級列表 */}
            <h2 className="font-bold text-gray-800 flex items-center">
                <Star size={20} className="mr-2 text-yellow-500" />
                所有等級權益
            </h2>

            {vipLevels.map(vip => {
                const isCurrent = vip.level === profile.vip_level;
                return (
                    <div
                        key={vip.level}
                        className={`rounded-2xl p-5 shadow-md transition-all ${isCurrent
                            ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400'
                            : 'bg-white'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                                <div className={`text-3xl ${isCurrent ? 'animate-bounce' : ''}`}>
                                    {isCurrent ? '👑' : '🐕'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 flex items-center">
                                        {vip.name}
                                        {isCurrent && (
                                            <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                                                當前等級
                                            </span>
                                        )}
                                    </h3>
                                    <div className="text-sm text-gray-600">{vip.icon}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">累計儲值</div>
                                <div className="font-bold text-gray-800">${vip.min_deposit.toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs bg-white bg-opacity-50 rounded-xl p-3">
                            <div className="text-center">
                                <div className="text-gray-500 mb-1">返水</div>
                                <div className="font-bold text-green-600">{(vip.cashback_rate * 100).toFixed(1)}%</div>
                            </div>
                            {/* <div className="text-center">
                                <div className="text-gray-500 mb-1">提領</div>
                                <div className="font-bold text-blue-600">
                                    {vip.daily_withdrawal_limit === -1 ? '無限制' : `${vip.daily_withdrawal_limit}次/日`}
                                </div>
                            </div> */}
                            <div className="text-center">
                                <div className="text-gray-500 mb-1">生日禮金</div>
                                <div className="font-bold text-pink-600">{vip.level * 500}</div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* VIP 專屬權益 */}
            <div className="bg-white rounded-2xl p-5 shadow-md">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">✨</span>
                    {currentLevelInfo.name}專屬權益
                </h3>
                {benefits.length > 0 ? (
                    <div className="space-y-3">
                        {benefits.map((benefit) => (
                            <div key={benefit.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                                <div className="text-2xl">{benefit.icon}</div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800 text-sm">{benefit.title}</h4>
                                    <p className="text-xs text-gray-500">{benefit.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm text-center py-4">暫無專屬權益資料</p>
                )}
            </div>
        </div>
    );
};

export default MemberVipPage;
