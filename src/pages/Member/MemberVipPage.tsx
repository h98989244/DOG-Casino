import React from 'react';
import { Star } from 'lucide-react';
import MemberBackButton from '../../components/MemberBackButton';

interface MemberVipPageProps {
    setMemberSubPage: (page: string) => void;
}

const MemberVipPage: React.FC<MemberVipPageProps> = ({ setMemberSubPage }) => {
    const vipLevels = [
        { level: 1, name: '銅牌會員', bone: '🦴', deposit: 1000, cashback: '0.3%', withdraw: '3次/日' },
        { level: 2, name: '銀牌會員', bone: '🦴🦴', deposit: 10000, cashback: '0.5%', withdraw: '5次/日' },
        { level: 3, name: '金牌會員', bone: '🦴🦴🦴', deposit: 50000, cashback: '0.8%', withdraw: '10次/日', current: true },
        { level: 4, name: '鑽石會員', bone: '🦴🦴🦴🦴', deposit: 200000, cashback: '1.2%', withdraw: '無限制' },
        { level: 5, name: '至尊會員', bone: '🦴🦴🦴🦴🦴', deposit: 1000000, cashback: '1.5%', withdraw: '無限制' }
    ];

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
                        <div className="text-4xl mb-2">🦴🦴🦴</div>
                        <h2 className="text-2xl font-bold">金牌會員</h2>
                        <p className="text-sm opacity-90">VIP Level 3</p>
                    </div>
                    <div className="text-6xl">👑</div>
                </div>

                <div className="bg-white bg-opacity-20 rounded-2xl p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">升級進度</span>
                        <span className="text-sm font-bold">52,000 / 200,000</span>
                    </div>
                    <div className="bg-white bg-opacity-30 rounded-full h-3 overflow-hidden">
                        <div className="bg-white h-full rounded-full" style={{ width: '26%' }}></div>
                    </div>
                    <p className="text-xs mt-2 opacity-90">再儲值 NT$ 148,000 即可升級至鑽石會員</p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center">
                        <div className="font-bold text-lg">0.8%</div>
                        <div className="text-xs opacity-90">返水比例</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-lg">10次</div>
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

            {vipLevels.map(vip => (
                <div
                    key={vip.level}
                    className={`rounded-2xl p-5 shadow-md transition-all ${vip.current
                            ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400'
                            : 'bg-white'
                        }`}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            <div className={`text-3xl ${vip.current ? 'animate-bounce' : ''}`}>
                                {vip.current ? '👑' : '🐕'}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 flex items-center">
                                    {vip.name}
                                    {vip.current && (
                                        <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                                            當前等級
                                        </span>
                                    )}
                                </h3>
                                <div className="text-sm text-gray-600">{vip.bone}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">累計儲值</div>
                            <div className="font-bold text-gray-800">${vip.deposit.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs bg-white bg-opacity-50 rounded-xl p-3">
                        <div className="text-center">
                            <div className="text-gray-500 mb-1">返水</div>
                            <div className="font-bold text-green-600">{vip.cashback}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-gray-500 mb-1">提領</div>
                            <div className="font-bold text-blue-600">{vip.withdraw}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-gray-500 mb-1">生日禮金</div>
                            <div className="font-bold text-pink-600">{vip.level * 500}</div>
                        </div>
                    </div>
                </div>
            ))}

            {/* VIP 專屬權益 */}
            <div className="bg-white rounded-2xl p-5 shadow-md">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">✨</span>
                    金牌會員專屬權益
                </h3>
                <div className="space-y-3">
                    {[
                        { icon: '💰', title: '每週返水', desc: '最高 0.8% 無上限返水' },
                        { icon: '🎁', title: '生日禮金', desc: 'NT$ 1,500 生日專屬紅包' },
                        { icon: '⚡', title: '快速提領', desc: '專屬通道 10 分鐘到帳' },
                        { icon: '👔', title: '專屬客服', desc: '1對1 VIP 客服經理' },
                        { icon: '🎊', title: '專屬活動', desc: '每月限定高額回饋活動' },
                        { icon: '🏆', title: '升級禮金', desc: 'NT$ 3,000 升級獎勵' }
                    ].map((benefit, idx) => (
                        <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                            <div className="text-2xl">{benefit.icon}</div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-800 text-sm">{benefit.title}</h4>
                                <p className="text-xs text-gray-500">{benefit.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MemberVipPage;
