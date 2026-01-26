import { Utils } from './Utils';
import { CONFIG } from './Constants';
import { Bullet, Fish, Coin, Particle } from './Entities';

export interface FishingEngineOptions {
    canvas: HTMLCanvasElement;
    onCoinsChange?: (coins: number) => void;
    onToast?: (msg: string) => void;
}

interface Bubble {
    x: number;
    y: number;
    size: number;
    speed: number;
    wobble: number;
    shimmer: number;
}

export class FishingEngine {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    w: number = 0;
    h: number = 0;

    // Game Objects
    bullets: Bullet[] = [];
    fishes: Fish[] = [];
    coins: Coin[] = [];
    particles: Particle[] = [];
    bubbles: Bubble[] = [];
    bgFishes: any[] = [];
    rocks: any[] = [];
    corals: any[] = [];
    seaweeds: any[] = [];
    caustics: any[] = [];

    // State
    time: number = 0;
    balance: number = 10000;
    currentBet: number = 10;
    autoFire: boolean = false;
    locked: boolean = false;
    lockedFish: Fish | null = null;
    turretAngle: number = -Math.PI / 2;
    lastFireTime: number = 0;

    // Background
    bgImage: HTMLImageElement;
    bgLoaded: boolean = false;

    // Callbacks
    onCoinsChange?: (coins: number) => void;
    onToast?: (msg: string) => void;

    animationFrameId: number | null = null;
    running: boolean = false;

    constructor(options: FishingEngineOptions) {
        this.canvas = options.canvas;
        const ctx = this.canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');
        this.ctx = ctx;

        this.onCoinsChange = options.onCoinsChange;
        this.onToast = options.onToast;

        this.bgImage = new Image();
        this.bgImage.src = '/assets/fishing/bg.png';
        this.bgImage.onload = () => { this.bgLoaded = true; };

        this.resize();
        this.initBackground();

        // Event Listeners
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleTouch = this.handleTouch.bind(this);

        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('click', this.handleClick);
        this.canvas.addEventListener('touchstart', this.handleTouch, { passive: false });

        // Start loop
        this.running = true;
        this.loop();

        // Bubble spawner
        setInterval(() => this.spawnBubble(), 180);
    }

    resize() {
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        this.canvas.width = this.w;
        this.canvas.height = this.h;
        // Re-init background elements that depend on size if necessary
        if (this.seaweeds.length > 0) this.initBackground();
    }

    destroy() {
        this.running = false;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('click', this.handleClick);
        this.canvas.removeEventListener('touchstart', this.handleTouch);
    }

    handleMouseMove(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.setTarget(x, y);
    }

    handleClick(_e: MouseEvent) {
        if (!this.autoFire) {
            this.fire();
        }
    }

    handleTouch(e: TouchEvent) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const t = e.touches[0];
        const x = t.clientX - rect.left;
        const y = t.clientY - rect.top;
        this.setTarget(x, y);
        this.fire();
    }

    initBackground() {
        // Initialization logic transplanted from game.js
        this.rocks = [];
        for (let i = 0; i < 8; i++) {
            this.rocks.push({
                x: Utils.random(30, this.w - 30), y: this.h - Utils.random(20, 80),
                width: Utils.random(60, 140), height: Utils.random(40, 90),
                color1: `hsl(${Utils.random(20, 50)}, ${Utils.random(15, 30)}%, ${Utils.random(25, 40)}%)`,
                color2: `hsl(${Utils.random(20, 50)}, ${Utils.random(10, 20)}%, ${Utils.random(15, 25)}%)`,
                points: Math.floor(Utils.random(5, 8))
            });
        }

        this.corals = [];
        const coralColors: [string, string, string][] = [
            ['#FF6B6B', '#FF8E8E', '#FFB4B4'], ['#FF69B4', '#FF85C1', '#FFB6D9'],
            ['#FFA500', '#FFB733', '#FFCC66'], ['#9370DB', '#A78BDB', '#BBA6DB'],
            ['#20B2AA', '#4DC9C1', '#7ADFD8'], ['#FF4500', '#FF6A33', '#FF8F66']
        ];
        for (let i = 0; i < 10; i++) {
            const colors = coralColors[Math.floor(Math.random() * coralColors.length)];
            this.corals.push({
                x: Utils.random(50, this.w - 50), y: this.h - Utils.random(10, 50),
                type: Math.floor(Math.random() * 3),
                size: Utils.random(40, 80), colors: colors,
                sway: Math.random() * Math.PI * 2, swaySpeed: Utils.random(0.01, 0.025)
            });
        }

        this.seaweeds = [];
        for (let i = 0; i < 15; i++) {
            this.seaweeds.push({
                x: Utils.random(50, this.w - 50), baseY: this.h, height: Utils.random(100, 250),
                segments: Math.floor(Utils.random(8, 14)), color: `hsl(${Utils.random(90, 160)}, ${Utils.random(60, 80)}%, ${Utils.random(25, 45)}%)`,
                phase: Math.random() * Math.PI * 2, speed: Utils.random(0.02, 0.04)
            });
        }

        this.bgFishes = [];
        for (let i = 0; i < 20; i++) {
            this.bgFishes.push({
                x: Utils.random(0, this.w), y: Utils.random(100, this.h - 200),
                size: Utils.random(8, 18), speed: Utils.random(0.3, 1),
                color: `hsla(${Utils.random(180, 220)}, 60%, 60%, 0.4)`, dir: Math.random() > 0.5 ? 1 : -1
            });
        }

        this.caustics = [];
        for (let i = 0; i < 10; i++) {
            this.caustics.push({ x: Utils.random(0, this.w), y: Utils.random(0, this.h), size: Utils.random(100, 250), phase: Math.random() * Math.PI * 2 });
        }
    }

    setTurretAngle(angle: number) {
        this.turretAngle = angle;
    }

    // Calculate turret angle based on mouse/touch position
    setTarget(x: number, y: number) {
        this.turretAngle = Math.atan2(y - (this.h - 100), x - this.w / 2);
    }

    setBet(bet: number) {
        if (CONFIG.betSteps.includes(bet)) {
            this.currentBet = bet;
        }
    }

    toggleAutoFire() {
        this.autoFire = !this.autoFire;
        return this.autoFire;
    }

    toggleLock() {
        this.locked = !this.locked;
        this.lockedFish = null;
        return this.locked;
    }

    fire() {
        const now = Date.now();
        if (now - this.lastFireTime < CONFIG.fireRate) return;
        if (this.balance < this.currentBet) {
            if (this.onToast) this.onToast('金幣不足！');
            return;
        }

        this.lastFireTime = now;
        this.balance -= this.currentBet;
        if (this.onCoinsChange) this.onCoinsChange(this.balance);

        const scale = Utils.getScale();
        const tx = this.w / 2;
        const ty = this.h - 60 * scale - 40;
        const x = tx + Math.cos(this.turretAngle) * 80 * scale;
        const y = ty + Math.sin(this.turretAngle) * 80 * scale;

        this.bullets.push(new Bullet(x, y, this.turretAngle, this.currentBet));
        for (let i = 0; i < 12; i++) {
            this.particles.push(new Particle(x, y, '#FFA500', 's'));
        }
    }

    spawnBubble() {
        this.bubbles.push({
            x: Utils.random(0, this.w), y: this.h + 20,
            size: Utils.random(3, 28), speed: Utils.random(0.6, 3.5),
            wobble: Math.random() * Math.PI * 2, shimmer: Math.random()
        });
        if (this.bubbles.length > 60) this.bubbles.shift();
    }

    spawnFish() {
        if (this.fishes.length < 16) {
            this.fishes.push(new Fish(this.w, this.h));
        }
    }

    checkCollisions() {
        for (const b of this.bullets) {
            if (!b.active) continue;
            for (const f of this.fishes) {
                if (!f.active) continue;
                if (Utils.distance(b.x, b.y, f.x, f.y) < f.size * 0.5) {
                    const chance = Math.min(0.95, (b.bet / f.score) * 0.35); // Using bullet bet stored in bullet
                    if (Math.random() < chance || this.locked) {
                        f.active = false;
                        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFD700', '#FF8C00'];
                        for (let i = 0; i < 35; i++) {
                            this.particles.push(new Particle(f.x, f.y, colors[Math.floor(Math.random() * colors.length)]));
                        }
                        for (let i = 0; i < 20; i++) {
                            this.particles.push(new Particle(f.x, f.y, '#FFD700', 's'));
                        }
                        const cnt = Math.ceil(f.score / 60);
                        for (let i = 0; i < cnt; i++) {
                            setTimeout(() => this.coins.push(new Coin(
                                f.x + (Math.random() - 0.5) * 70,
                                f.y + (Math.random() - 0.5) * 70,
                                Math.ceil(f.score / cnt),
                                this.w / 2, this.h - 100
                            )), i * 35);
                        }

                        // Jackpot notification
                        if (f.score >= 300) {
                            if (this.onToast) this.onToast(`大獎！ +${Utils.format(f.score)}`);
                        }
                    } else {
                        f.flash = 1;
                        for (let i = 0; i < 8; i++) {
                            this.particles.push(new Particle(f.x, f.y, '#FFF', 's'));
                        }
                    }
                    b.active = false;
                    break;
                }
            }
        }
    }

    update() {
        this.time++;
        if (this.time % 20 === 0) this.spawnFish();

        this.bullets.forEach(b => b.update(this.w, this.h, this.lockedFish));
        this.fishes.forEach(f => f.update());
        this.particles.forEach(p => p.update());

        this.coins.forEach(c => {
            if (c.update()) {
                this.balance += c.value;
                if (this.onCoinsChange) this.onCoinsChange(this.balance);
            }
        });

        this.bubbles.forEach(b => {
            b.y -= b.speed;
            b.x += Math.sin(b.wobble + this.time * 0.04) * 0.6;
        });
        this.bubbles = this.bubbles.filter(b => b.y > -50);

        this.checkCollisions();

        this.bullets = this.bullets.filter(b => b.active);
        this.fishes = this.fishes.filter(f => f.active);
        this.particles = this.particles.filter(p => p.life > 0);
        this.coins = this.coins.filter(c => c.active);

        if (this.autoFire && Date.now() - this.lastFireTime > CONFIG.fireRate) {
            this.fire();
        }

        if (this.locked && (!this.lockedFish || !this.lockedFish.active)) {
            this.lockedFish = this.fishes.reduce((a: Fish | null, f) => {
                const distToCenter = Utils.distance(this.w / 2, this.h - 100, f.x, f.y);
                if (!a) return f;
                const aDist = Utils.distance(this.w / 2, this.h - 100, a.x, a.y);
                return distToCenter < aDist ? f : a;
            }, null);
        }
    }

    drawBg() {
        const ctx = this.ctx;

        if (this.bgLoaded) {
            ctx.drawImage(this.bgImage, 0, 0, this.w, this.h);
        } else {
            const g = ctx.createLinearGradient(0, 0, 0, this.h);
            g.addColorStop(0, '#000814'); g.addColorStop(0.3, '#001d3d'); g.addColorStop(0.6, '#003566'); g.addColorStop(1, '#005588');
            ctx.fillStyle = g; ctx.fillRect(0, 0, this.w, this.h);
        }

        // Light rays
        ctx.save(); ctx.globalAlpha = 0.08;
        for (let i = 0; i < 5; i++) {
            const x = (this.w / 6) * (i + 1) + Math.sin(this.time * 0.006 + i * 0.8) * 80;
            const gr = ctx.createLinearGradient(x, 0, x, this.h);
            gr.addColorStop(0, 'rgba(255,255,200,0.5)'); gr.addColorStop(0.3, 'rgba(255,255,200,0.15)'); gr.addColorStop(1, 'transparent');
            ctx.fillStyle = gr; ctx.beginPath();
            ctx.moveTo(x - 60, 0); ctx.lineTo(x + 60, 0);
            ctx.lineTo(x + 180, this.h); ctx.lineTo(x - 180, this.h); ctx.fill();
        }
        ctx.restore();

        // Bubbles
        ctx.save();
        this.bubbles.forEach(b => {
            const shimmer = 0.3 + Math.sin(this.time * 0.05 + b.shimmer * 10) * 0.15;
            const bg = ctx.createRadialGradient(b.x - b.size * 0.3, b.y - b.size * 0.3, 0, b.x, b.y, b.size);
            bg.addColorStop(0, `rgba(255,255,255,${shimmer + 0.3})`); bg.addColorStop(0.3, `rgba(200,230,255,${shimmer})`); bg.addColorStop(0.7, `rgba(150,200,255,${shimmer * 0.5})`); bg.addColorStop(1, 'rgba(100,150,200,0.05)');
            ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = `rgba(255,255,255,${shimmer + 0.1})`; ctx.lineWidth = 1; ctx.stroke();
            ctx.fillStyle = `rgba(255,255,255,${shimmer + 0.2})`;
            ctx.beginPath(); ctx.ellipse(b.x - b.size * 0.3, b.y - b.size * 0.3, b.size * 0.2, b.size * 0.15, -0.5, 0, Math.PI * 2); ctx.fill();
        });
        ctx.restore();

        // Floating particles
        ctx.save(); ctx.globalAlpha = 0.5;
        for (let i = 0; i < 40; i++) {
            const px = (i * 97 + this.time * 0.15) % this.w;
            const py = (i * 73 + Math.sin(this.time * 0.008 + i) * 60) % this.h;
            const ps = 1.5 + Math.sin(i + this.time * 0.02) * 0.8;
            ctx.fillStyle = `hsla(${180 + i * 4}, 80%, 85%, 0.7)`;
            ctx.beginPath(); ctx.arc(px, py, ps, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }

    drawTurret() {
        const ctx = this.ctx;
        const scale = Utils.getScale();
        const x = this.w / 2;
        const y = this.h - 60 * scale - 40;

        ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);

        // Base glow
        ctx.shadowColor = '#00BFFF'; ctx.shadowBlur = 50;
        const baseG = ctx.createRadialGradient(0, 0, 0, 0, 0, 85);
        baseG.addColorStop(0, 'rgba(0,191,255,0.4)'); baseG.addColorStop(0.5, 'rgba(0,100,200,0.2)'); baseG.addColorStop(1, 'transparent');
        ctx.fillStyle = baseG; ctx.beginPath(); ctx.arc(0, 0, 85, 0, Math.PI * 2); ctx.fill();

        // Base
        const plateG = ctx.createRadialGradient(0, 0, 0, 0, 0, 55);
        plateG.addColorStop(0, '#4a4a6a'); plateG.addColorStop(0.7, '#2a2a4a'); plateG.addColorStop(1, '#1a1a2a');
        ctx.fillStyle = plateG; ctx.beginPath(); ctx.arc(0, 0, 55, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#00BFFF'; ctx.lineWidth = 3; ctx.stroke();

        // Ring
        ctx.save(); ctx.rotate(this.time * 0.02);
        ctx.strokeStyle = 'rgba(0,191,255,0.5)'; ctx.lineWidth = 2; ctx.setLineDash([10, 15]);
        ctx.beginPath(); ctx.arc(0, 0, 45, 0, Math.PI * 2); ctx.stroke(); ctx.restore();

        // Barrel
        ctx.rotate(this.turretAngle + Math.PI / 2);
        const barrelG = ctx.createLinearGradient(-18, 0, 18, 0);
        barrelG.addColorStop(0, '#3a3a5a'); barrelG.addColorStop(0.3, '#6a6a8a'); barrelG.addColorStop(0.7, '#5a5a7a'); barrelG.addColorStop(1, '#2a2a4a');
        ctx.fillStyle = barrelG;
        // Note: roundRect might not be available in all TS lib versions or contexts, check support
        if (ctx.roundRect) {
            ctx.beginPath(); ctx.roundRect(-18, -85, 36, 85, 5); ctx.fill();
        } else {
            ctx.fillRect(-18, -85, 36, 85);
        }
        ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2; ctx.stroke();

        // Barrel Decorations
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-12, -90, 24, 8);
        ctx.fillRect(-15, -70, 30, 4);
        ctx.fillRect(-15, -50, 30, 4);

        // Core
        const coreG = ctx.createRadialGradient(0, -30, 0, 0, -30, 15);
        coreG.addColorStop(0, '#FFF'); coreG.addColorStop(0.3, '#00BFFF'); coreG.addColorStop(1, 'rgba(0,100,200,0)');
        ctx.fillStyle = coreG; ctx.beginPath(); ctx.arc(0, -30, 15, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    drawLock() {
        if (!this.locked || !this.lockedFish || !this.lockedFish.active) return;
        const ctx = this.ctx, f = this.lockedFish;

        ctx.save(); ctx.translate(f.x, f.y);

        ctx.strokeStyle = '#FF0000'; ctx.lineWidth = 3; ctx.shadowColor = '#FF0000'; ctx.shadowBlur = 25;
        ctx.rotate(this.time * 0.04);
        ctx.beginPath(); for (let i = 0; i < 4; i++) ctx.arc(0, 0, f.size + 25, i * Math.PI / 2 + 0.15, (i + 1) * Math.PI / 2 - 0.15); ctx.stroke();

        ctx.setLineDash([8, 4]); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-f.size - 35, 0); ctx.lineTo(f.size + 35, 0); ctx.moveTo(0, -f.size - 35); ctx.lineTo(0, f.size + 35); ctx.stroke();
        ctx.restore();

        ctx.save(); ctx.strokeStyle = 'rgba(255,0,0,0.5)'; ctx.lineWidth = 2; ctx.setLineDash([15, 8]);
        ctx.beginPath(); ctx.moveTo(this.w / 2, this.h - 100); ctx.lineTo(f.x, f.y); ctx.stroke(); ctx.restore();
    }

    render() {
        this.ctx.clearRect(0, 0, this.w, this.h);
        this.drawBg();
        this.fishes.forEach(f => f.draw(this.ctx));
        this.bullets.forEach(b => b.draw(this.ctx));
        this.coins.forEach(c => c.draw(this.ctx));
        this.particles.forEach(p => p.draw(this.ctx));
        this.drawTurret();
        this.drawLock();
    }

    loop() {
        if (!this.running) return;
        this.update();
        this.render();
        this.animationFrameId = requestAnimationFrame(() => this.loop());
    }
}
