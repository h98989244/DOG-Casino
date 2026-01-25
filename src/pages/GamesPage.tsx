import React from 'react';

interface GameCategory {
    id: number;
    name: string;
    icon: string;
    color: string;
    dog: string;
}

interface GamesPageProps {
    gameCategories: GameCategory[];
}

const GamesPage: React.FC<GamesPageProps> = ({ gameCategories }) => {
    return (
        <div className="space-y-4 pb-20">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">🎮</span>
                遊戲大廳
            </h1>
            <div className="grid grid-cols-2 gap-4">
                {gameCategories.map(game => (
                    <div
                        key={game.id}
                        className={`${game.color} bg-opacity-20 rounded-3xl p-6 shadow-lg hover:scale-105 transition-transform cursor-pointer`}
                    >
                        <div className="text-5xl mb-3 text-center">{game.dog}</div>
                        <div className="text-3xl mb-2 text-center">{game.icon}</div>
                        <h3 className="font-bold text-gray-800 text-center">{game.name}</h3>
                        <div className="text-center mt-3">
                            <span className="bg-white bg-opacity-70 px-3 py-1 rounded-full text-xs font-bold">
                                立即遊玩
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GamesPage;
