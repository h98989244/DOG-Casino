import React from 'react';
import { Gamepad2, DollarSign, Gift, User, ChevronRight } from 'lucide-react';

interface GameCategory {
    id: number;
    name: string;
    icon: string;
    color: string;
    dog: string;
}

interface HomePageProps {
    setCurrentPage: (page: string) => void;
    gameCategories: GameCategory[];
    onGameSelect?: (game: GameCategory) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setCurrentPage, gameCategories, onGameSelect }) => {
    return (
        <div className="space-y-4 pb-20">
            {/* Hero Banner */}
            <div className="bg-gradient-to-br from-yellow-300 via-yellow-200 to-blue-200 rounded-3xl p-6 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 text-6xl opacity-20">🐕</div>
                <div className="relative z-10">
                    <div className="text-4xl mb-2">🐶</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">汪汪娛樂城</h1>
                    <p className="text-gray-700 text-sm mb-4">天天開心玩、狗狗陪你贏!</p>
                    <button className="bg-blue-500 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
                        立即開始
                    </button>
                </div>
            </div>

            {/* 跑馬燈公告 */}
            <div className="bg-white rounded-2xl p-4 shadow-md flex items-center space-x-3">
                <div className="text-2xl">📢</div>
                <div className="flex-1 overflow-hidden">
                    <div className="animate-marquee whitespace-nowrap text-sm text-gray-700">
                        🎉 恭喜會員 wang***88 贏得 $50,000 大獎! | 💰 本週儲值享 8% 回饋 | 🎁 新會員首存雙倍送
                    </div>
                </div>
            </div>

            {/* 快速入口 */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    { icon: <Gamepad2 size={24} />, label: '遊戲', page: 'games', bg: 'bg-blue-100' },
                    { icon: <DollarSign size={24} />, label: '儲值', page: 'deposit', bg: 'bg-green-100' },
                    { icon: <Gift size={24} />, label: '活動', page: 'activities', bg: 'bg-pink-100' },
                    { icon: <User size={24} />, label: '我的', page: 'member', bg: 'bg-purple-100' }
                ].map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentPage(item.page)}
                        className={`${item.bg} rounded-2xl p-4 flex flex-col items-center space-y-2 hover:scale-105 transition-transform shadow-md`}
                    >
                        <div className="text-gray-700">{item.icon}</div>
                        <span className="text-xs font-bold text-gray-700">{item.label}</span>
                    </button>
                ))}
            </div>

            {/* 熱門遊戲 */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                        <span className="mr-2">🔥</span>
                        熱門遊戲
                    </h2>
                    <button className="text-blue-500 text-sm flex items-center">
                        更多 <ChevronRight size={16} />
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {gameCategories.slice(0, 4).map(game => (
                        <div
                            key={game.id}
                            onClick={() => onGameSelect?.(game)}
                            className={`${game.color} bg-opacity-20 rounded-2xl p-4 shadow-md hover:scale-105 transition-transform cursor-pointer`}
                        >
                            <div className="text-3xl mb-2">{game.dog}</div>
                            <div className="text-2xl mb-1">{game.icon}</div>
                            <h3 className="font-bold text-gray-800 text-sm">{game.name}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
