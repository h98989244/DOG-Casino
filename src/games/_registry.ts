// 遊戲註冊表 - 統一管理所有遊戲資訊

export interface GameInfo {
    id: string;
    name: string;
    type: 'slot' | 'fishing' | 'sports' | 'live' | 'card';
    path: string;
    description?: string;
    icon?: string;
    color?: string;
    dog?: string;
}

export const games: GameInfo[] = [
    {
        id: "slot-myth-coin",
        name: "神話金幣 Jackpot",
        type: "slot",
        path: "/games/slot-myth-coin",
        description: "243 Ways 拉霸",
        icon: "🎰",
        color: "bg-purple-400",
        dog: "🐶"
    }
];

// 根據 ID 獲取遊戲資訊
export function getGameById(id: string): GameInfo | undefined {
    return games.find(game => game.id === id);
}

// 根據類型獲取遊戲列表
export function getGamesByType(type: GameInfo['type']): GameInfo[] {
    return games.filter(game => game.type === type);
}

// 獲取所有遊戲
export function getAllGames(): GameInfo[] {
    return games;
}
