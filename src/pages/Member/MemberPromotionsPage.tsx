import React from 'react';
import MemberBackButton from '../../components/MemberBackButton';

interface MemberPromotionsPageProps {
    setMemberSubPage: (page: string) => void;
}

const MemberPromotionsPage: React.FC<MemberPromotionsPageProps> = ({ setMemberSubPage }) => {
    const promotions = [
        { id: 1, title: '首儲100%紅利', bonus: 5000, status: '已領取', date: '2024-01-15', expire: '已使用' },
        { id: 2, title: '每日簽到獎勵', bonus: 88, status: '已領取', date: '2024-01-23', expire: '2024-01-24' },
        { id: 3, title: '週年慶加碼', bonus: 1000, status: '可領取', date: '2024-01-20', expire: '2024-01-30' },
        { id: 4, title: 'VIP升級禮金', bonus: 3000, status: '已過期', date: '2024-01-10', expire: '2024-01-20' }
    ];

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
                <div className="text-4xl font-bold mb-2">NT$ 9,088</div>
                <div className="text-sm opacity-90">共參加 12 次活動</div>
            </div>

            {/* 狀態篩選 */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
                {['全部', '可領取', '已領取', '已過期'].map(status => (
                    <button
                        key={status}
                        className="px-4 py-2 bg-white rounded-full font-bold text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-500 whitespace-nowrap shadow-sm"
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* 優惠列表 */}
            {promotions.map(promo => (
                <div key={promo.id} className="bg-white rounded-2xl p-4 shadow-md">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-800 mb-1">{promo.title}</h3>
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl font-bold text-orange-500">
                                    +NT$ {promo.bonus.toLocaleString()}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${promo.status === '可領取' ? 'bg-green-100 text-green-600' :
                                        promo.status === '已領取' ? 'bg-blue-100 text-blue-600' :
                                            'bg-gray-100 text-gray-600'
                                    }`}>
                                    {promo.status}
                                </span>
                            </div>
                        </div>
                        <div className="text-4xl">{promo.status === '可領取' ? '🎁' : '✨'}</div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                        <span>發放日期:{promo.date}</span>
                        <span>有效至:{promo.expire}</span>
                    </div>

                    {promo.status === '可領取' && (
                        <button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 rounded-xl font-bold mt-3 hover:scale-105 transition-transform">
                            立即領取
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MemberPromotionsPage;
