import React from 'react';
import { ChevronRight, Clock } from 'lucide-react';

interface Activity {
    id: number;
    title: string;
    bonus: string;
    bonusAmount: string;
    time: string;
    desc: string;
    rules: string[];
    steps: string[];
    icon: string;
    color: string;
}

interface ActivityDetailPageProps {
    activity: Activity;
    setSelectedActivity: (id: number | null) => void;
}

const ActivityDetailPage: React.FC<ActivityDetailPageProps> = ({ activity, setSelectedActivity }) => {
    return (
        <div className="space-y-4 pb-20">
            {/* 返回按鈕 */}
            <button
                onClick={() => setSelectedActivity(null)}
                className="flex items-center text-blue-500 font-bold hover:scale-105 transition-transform"
            >
                <ChevronRight size={20} className="rotate-180" />
                返回活動列表
            </button>

            {/* 活動主視覺 */}
            <div className={`bg-gradient-to-br ${activity.color} rounded-3xl p-6 shadow-lg text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 text-8xl opacity-20">{activity.icon}</div>
                <div className="relative z-10">
                    <div className="text-6xl mb-3">{activity.icon}</div>
                    <h1 className="text-2xl font-bold mb-2">{activity.title}</h1>
                    <p className="text-sm opacity-90 mb-4">{activity.desc}</p>
                    <div className="flex items-center space-x-4">
                        <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                            <span className="font-bold">{activity.bonus}</span>
                        </div>
                        <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full flex items-center">
                            <Clock size={16} className="mr-2" />
                            <span className="text-sm">{activity.time}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 獎勵金額 */}
            <div className="bg-white rounded-2xl p-6 shadow-md text-center">
                <div className="text-gray-500 text-sm mb-2">活動獎勵</div>
                <div className="text-4xl font-bold text-orange-500 mb-2">{activity.bonusAmount}</div>
                <div className="inline-block bg-green-100 text-green-600 px-4 py-1 rounded-full text-sm font-bold">
                    立即參加領取獎勵
                </div>
            </div>

            {/* 參加步驟 */}
            <div className="bg-white rounded-2xl p-5 shadow-md">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">📝</span>
                    參加步驟
                </h3>
                <div className="space-y-3">
                    {activity.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                {idx + 1}
                            </div>
                            <div className="flex-1 pt-1">
                                <p className="text-gray-700">{step}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 活動規則 */}
            <div className="bg-white rounded-2xl p-5 shadow-md">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">📋</span>
                    活動規則
                </h3>
                <div className="space-y-2">
                    {activity.rules.map((rule, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <p className="text-gray-600 text-sm flex-1">{rule}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 注意事項 */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
                <div className="flex items-start space-x-2">
                    <span className="text-2xl">⚠️</span>
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-800 mb-2">重要提醒</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                            <li>• 本活動僅限真實會員參加,禁止使用機器人或外掛</li>
                            <li>• 如發現任何作弊行為,平台有權取消資格並凍結帳戶</li>
                            <li>• 活動最終解釋權歸平台所有</li>
                            <li>• 若有疑問請聯繫LINE客服</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* 立即參加按鈕 */}
            <button className={`w-full bg-gradient-to-r ${activity.color} text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:scale-105 transition-transform`}>
                🎁 立即參加活動
            </button>
        </div>
    );
};

export default ActivityDetailPage;
