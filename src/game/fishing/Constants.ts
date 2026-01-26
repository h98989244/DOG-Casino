import { FishType } from './Types';

export const CONFIG = {
    betSteps: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000],
    fireRate: 150,
    bulletSpeed: 12,
    fishTypes: [
        { name: '小魚', score: 10, speed: 2.5, size: 45, colors: ['#7CFC00', '#00FA9A', '#98FB98'], prob: 0.25, fins: 1, shape: 'normal' },
        { name: '中魚', score: 30, speed: 2, size: 60, colors: ['#00BFFF', '#1E90FF', '#87CEEB'], prob: 0.2, fins: 2, shape: 'normal' },
        { name: '河豚', score: 50, speed: 1.8, size: 55, colors: ['#FFC0CB', '#FFB6C1', '#FF69B4'], prob: 0.12, fins: 1, shape: 'puffer' },
        { name: '燈籠魚', score: 80, speed: 1.6, size: 50, colors: ['#00CED1', '#20B2AA', '#48D1CC'], prob: 0.1, fins: 1, shape: 'lantern', glow: true },
        { name: '大魚', score: 100, speed: 1.5, size: 80, colors: ['#DA70D6', '#BA55D3', '#9370DB'], prob: 0.1, fins: 2, shape: 'normal' },
        { name: '魔鬼魚', score: 150, speed: 1.3, size: 100, colors: ['#4B0082', '#8B008B', '#9400D3'], prob: 0.07, fins: 2, shape: 'manta' },
        { name: '劍魚', score: 200, speed: 2.2, size: 90, colors: ['#4169E1', '#1E90FF', '#00BFFF'], prob: 0.06, fins: 2, shape: 'sword' },
        { name: '金魚', score: 300, speed: 1.2, size: 90, colors: ['#FFD700', '#FFA500', '#FF8C00'], prob: 0.04, fins: 3, glow: true, shape: 'normal' },
        { name: '鯊魚', score: 500, speed: 1.0, size: 120, colors: ['#708090', '#778899', '#B0C4DE'], prob: 0.03, fins: 3, shape: 'shark' },
        { name: '龍王', score: 1000, speed: 0.8, size: 140, colors: ['#FF4500', '#FF0000', '#DC143C'], prob: 0.02, fins: 4, boss: true, shape: 'dragon' },
        { name: '海龜', score: 250, speed: 0.9, size: 95, colors: ['#2E8B57', '#3CB371', '#90EE90'], prob: 0.01, fins: 2, shape: 'turtle' }
    ] as FishType[]
};
