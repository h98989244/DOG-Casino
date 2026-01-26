export interface Position {
    x: number;
    y: number;
}

export interface Vector {
    x: number;
    y: number;
}

export interface FishType {
    name: string;
    score: number;
    speed: number;
    size: number;
    colors: string[];
    prob: number;
    fins: number;
    shape: 'normal' | 'shark' | 'manta' | 'sword' | 'puffer' | 'lantern' | 'dragon' | 'turtle';
    glow?: boolean;
    boss?: boolean;
}

export interface GameState {
    coins: number;
    currentBet: number;
    autoFire: boolean;
    locked: boolean;
    vipLevel: number;
}

export type EventCallback = (event: string, data?: any) => void;
