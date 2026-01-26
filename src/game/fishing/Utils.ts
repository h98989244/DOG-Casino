export const Utils = {
    random: (a: number, b: number) => Math.random() * (b - a) + a,
    distance: (x1: number, y1: number, x2: number, y2: number) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
    lerp: (a: number, b: number, t: number) => a + (b - a) * t,
    bezier: (t: number, p0: number, p1: number, p2: number, p3: number) => {
        const m = 1 - t;
        return m * m * m * p0 + 3 * m * m * t * p1 + 3 * m * t * t * p2 + t * t * t * p3;
    },
    format: (n: number) => n.toLocaleString(),
    getScale: () => {
        if (typeof window === 'undefined') return 1;
        const w = window.innerWidth, h = window.innerHeight;
        const minDim = Math.min(w, h);
        if (minDim < 400) return 0.5;
        if (minDim < 500) return 0.6;
        if (minDim < 600) return 0.7;
        if (minDim < 800) return 0.85;
        return 1;
    }
};
