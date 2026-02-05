import React from 'react';
import { MessageCircle } from 'lucide-react';
import ActivityCard from '../../components/ActivityCard';
import { useNavigate } from 'react-router-dom';
import { activities } from '../../data/activities';

const ActivitiesListPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-4 pb-20">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">🎁</span>
                活動中心
            </h1>

            {/* 精選活動輪播 */}
            <div className="bg-gradient-to-br from-pink-300 to-purple-300 rounded-3xl p-6 shadow-lg text-white">
                <div className="text-5xl mb-3">🎉</div>
                <h2 className="text-xl font-bold mb-2">週年慶大放送</h2>
                <p className="text-sm mb-4 opacity-90">儲值滿千送千,最高贈送無上限</p>
                <button
                    onClick={() => navigate('/activities/4')}
                    className="bg-white text-purple-600 px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform"
                >
                    立即參加
                </button>
            </div>

            {/* 活動分類標籤 */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
                {['全部活動', '新手專區', '每日優惠', '限時活動', 'VIP專屬'].map(category => (
                    <button
                        key={category}
                        className="px-4 py-2 bg-white rounded-full font-bold text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-500 whitespace-nowrap shadow-sm"
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* 活動列表 */}
            {activities.map(activity => (
                <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onClick={(id) => navigate(`/activities/${id}`)}
                />
            ))}

            {/* 客服提示卡片 */}
            <div className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="text-3xl">🐕</div>
                    <div className="flex-1">
                        <h3 className="font-bold mb-1">有任何疑問?</h3>
                        <p className="text-sm opacity-90">聯繫 LINE 客服為您詳細解答</p>
                    </div>
                </div>
                <a
                    href="https://line.me/ti/p/@386qduvb"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-white text-green-600 py-2 rounded-xl font-bold hover:scale-105 transition-transform flex items-center justify-center"
                >
                    <MessageCircle size={18} className="mr-2" />
                    聯繫客服
                </a>
            </div>
        </div>
    );
};

export default ActivitiesListPage;
