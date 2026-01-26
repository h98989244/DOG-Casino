import { Utils } from './Utils';
import { CONFIG } from './Constants';
import { FishType } from './Types';

interface Point {
    x: number;
    y: number;
    a?: number;
}

export class Bullet {
    x: number;
    y: number;
    angle: number;
    bet: number;
    speed: number;
    size: number;
    active: boolean;
    vx: number;
    vy: number;
    trail: Point[];
    rot: number;

    constructor(x: number, y: number, angle: number, bet: number) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.bet = bet;
        this.speed = CONFIG.bulletSpeed;
        const betIndex = CONFIG.betSteps.indexOf(bet);
        const scale = Utils.getScale();
        this.size = (5 + (betIndex / (CONFIG.betSteps.length - 1)) * 45) * scale;
        this.active = true;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.trail = [];
        this.rot = 0;
    }

    update(w: number, h: number, lockedFish?: Fish | null) {
        this.trail.push({ x: this.x, y: this.y, a: 1 });
        if (this.trail.length > 15) this.trail.shift();
        this.trail.forEach(t => t.a! *= 0.88);
        this.x += this.vx;
        this.y += this.vy;
        this.rot += 0.2;

        if (this.x < -this.size || this.x > w + this.size || this.y < -this.size || this.y > h + this.size) {
            this.active = false;
        }

        if (lockedFish && lockedFish.active) {
            const a = Math.atan2(lockedFish.y - this.y, lockedFish.x - this.x);
            this.angle = Utils.lerp(this.angle, a, 0.1);
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        for (let i = 0; i < this.trail.length; i++) {
            const t = this.trail[i];
            const sz = (i / this.trail.length) * this.size;
            ctx.globalAlpha = (t.a || 0) * 0.7;
            const g = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, sz);
            g.addColorStop(0, '#FFF');
            g.addColorStop(0.3, '#FFD700');
            g.addColorStop(1, 'rgba(255,150,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(t.x, t.y, sz, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 25;
        const bg = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        bg.addColorStop(0, '#FFF');
        bg.addColorStop(0.2, '#FFD700');
        bg.addColorStop(0.6, '#FFA500');
        bg.addColorStop(1, 'rgba(255,100,0,0.5)');
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFF';
        ctx.globalAlpha = 0.9;
        for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 4);
            ctx.beginPath();
            ctx.ellipse(0, 0, 3, this.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

export class Fish {
    w: number;
    h: number;
    scale: number;
    type: FishType;
    score: number;
    size: number;
    colors: string[];
    x: number;
    y: number;
    cp: Point[];
    t: number;
    speed: number;
    angle: number;
    active: boolean;
    flash: number;
    tailAngle: number;
    finAngle: number;

    constructor(w: number, h: number) {
        this.w = w;
        this.h = h;
        this.scale = Utils.getScale();
        let r = Math.random(), c = 0;
        this.type = CONFIG.fishTypes[0];
        for (const t of CONFIG.fishTypes) {
            c += t.prob;
            if (r < c) {
                this.type = t;
                break;
            }
        }
        this.score = this.type.score;
        this.size = this.type.size * this.scale;
        this.colors = this.type.colors;

        const side = Math.floor(Math.random() * 4);
        let startX = 0, startY = 0, endX = 0, endY = 0;

        if (side === 0) { // Top
            startX = Utils.random(100, w - 100); startY = -this.size * 2;
            endX = Utils.random(100, w - 100); endY = h + this.size * 2;
        } else if (side === 1) { // Right
            startX = w + this.size * 2; startY = Utils.random(100, h - 100);
            endX = -this.size * 2; endY = Utils.random(100, h - 100);
        } else if (side === 2) { // Bottom
            startX = Utils.random(100, w - 100); startY = h + this.size * 2;
            endX = Utils.random(100, w - 100); endY = -this.size * 2;
        } else { // Left
            startX = -this.size * 2; startY = Utils.random(100, h - 100);
            endX = w + this.size * 2; endY = Utils.random(100, h - 100);
        }

        this.x = startX;
        this.y = startY;
        const midX = (startX + endX) / 2 + (Math.random() - 0.5) * w * 0.3;
        const midY = (startY + endY) / 2 + (Math.random() - 0.5) * h * 0.3;

        this.cp = [
            { x: startX, y: startY },
            { x: startX + (midX - startX) * 0.5, y: startY + (midY - startY) * 0.5 },
            { x: midX + (endX - midX) * 0.5, y: midY + (endY - midY) * 0.5 },
            { x: endX, y: endY }
        ];

        this.t = 0;
        this.speed = this.type.speed * 0.0015;
        this.angle = 0;
        this.active = true;
        this.flash = 0;
        this.tailAngle = 0;
        this.finAngle = 0;
    }

    update() {
        if (!this.active) return;
        this.t += this.speed;
        const ox = this.x, oy = this.y;
        this.x = Utils.bezier(this.t, this.cp[0].x, this.cp[1].x, this.cp[2].x, this.cp[3].x);
        this.y = Utils.bezier(this.t, this.cp[0].y, this.cp[1].y, this.cp[2].y, this.cp[3].y);
        this.angle = Math.atan2(this.y - oy, this.x - ox);
        this.tailAngle = Math.sin(Date.now() * 0.015) * 0.4;
        this.finAngle = Math.sin(Date.now() * 0.012) * 0.3;
        if (this.flash > 0) this.flash -= 0.06;

        if (this.t >= 1 || this.x < -this.size * 3 || this.x > this.w + this.size * 3 || this.y < -this.size * 3 || this.y > this.h + this.size * 3) {
            this.active = false;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!this.active) return;
        const s = this.size, c = this.colors, shape = this.type.shape || 'normal';
        ctx.save();
        ctx.translate(this.x, this.y);
        const flipX = Math.cos(this.angle) < 0 ? -1 : 1;
        ctx.scale(flipX, 1);

        if (this.type.glow || this.type.boss) {
            ctx.shadowColor = c[0];
            ctx.shadowBlur = 30 + Math.sin(Date.now() * 0.008) * 15;
        }
        if (this.flash > 0) {
            ctx.shadowColor = '#FFF';
            ctx.shadowBlur = 40;
        }

        if (this.type.boss) {
            ctx.save();
            ctx.rotate(Date.now() * 0.003);
            ctx.strokeStyle = `rgba(255,69,0,${0.3 + Math.sin(Date.now() * 0.005) * 0.2})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                ctx.arc(0, 0, s * 0.7, i * Math.PI / 4 + 0.1, (i + 1) * Math.PI / 4 - 0.1);
            }
            ctx.stroke();
            ctx.restore();
        }

        if (shape === 'shark') this.drawShark(ctx, s, c);
        else if (shape === 'manta') this.drawManta(ctx, s, c);
        else if (shape === 'sword') this.drawSwordfish(ctx, s, c);
        else if (shape === 'puffer') this.drawPuffer(ctx, s, c);
        else if (shape === 'lantern') this.drawLantern(ctx, s, c);
        else if (shape === 'dragon') this.drawDragon(ctx, s, c);
        else if (shape === 'turtle') this.drawTurtle(ctx, s, c);
        else this.drawNormalFish(ctx, s, c);

        ctx.restore();
    }

    drawNormalFish(ctx: CanvasRenderingContext2D, s: number, c: string[]) {
        // Tail
        ctx.save(); ctx.rotate(this.tailAngle);
        const tailG = ctx.createLinearGradient(-s * 0.3, 0, -s * 0.7, 0);
        tailG.addColorStop(0, c[0]); tailG.addColorStop(1, c[2]);
        ctx.fillStyle = tailG; ctx.beginPath();
        ctx.moveTo(-s * 0.3, 0); ctx.quadraticCurveTo(-s * 0.5, -s * 0.3, -s * 0.7, -s * 0.25);
        ctx.quadraticCurveTo(-s * 0.55, 0, -s * 0.7, s * 0.25);
        ctx.quadraticCurveTo(-s * 0.5, s * 0.3, -s * 0.3, 0);
        ctx.fill(); ctx.restore();

        // Fin
        ctx.save(); ctx.rotate(this.finAngle * 0.5);
        ctx.fillStyle = c[1]; ctx.beginPath();
        ctx.moveTo(-s * 0.1, -s * 0.15); ctx.quadraticCurveTo(0, -s * 0.4, s * 0.15, -s * 0.15);
        ctx.lineTo(-s * 0.1, -s * 0.15); ctx.fill(); ctx.restore();

        // Body
        const bodyG = ctx.createRadialGradient(s * 0.1, -s * 0.05, 0, 0, 0, s * 0.5);
        bodyG.addColorStop(0, '#FFF'); bodyG.addColorStop(0.3, c[0]); bodyG.addColorStop(0.7, c[1]); bodyG.addColorStop(1, c[2]);
        ctx.fillStyle = bodyG; ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.4, s * 0.22, 0, 0, Math.PI * 2); ctx.fill();

        // Scales
        ctx.globalAlpha = 0.3; ctx.strokeStyle = c[2]; ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-s * 0.1 + i * s * 0.1, 0, s * 0.08, 0, Math.PI * 2); ctx.stroke(); }
        ctx.globalAlpha = 1;

        // Pectoral Fin
        ctx.save(); ctx.translate(s * 0.05, s * 0.12); ctx.rotate(this.finAngle);
        ctx.fillStyle = c[1]; ctx.beginPath();
        ctx.ellipse(0, s * 0.1, s * 0.06, s * 0.15, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.restore();

        // Eye
        ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(s * 0.2, -s * 0.03, s * 0.08, 0, Math.PI * 2); ctx.fill();
        const eyeG = ctx.createRadialGradient(s * 0.22, -s * 0.04, 0, s * 0.2, -s * 0.03, s * 0.05);
        eyeG.addColorStop(0, '#000'); eyeG.addColorStop(0.7, '#222'); eyeG.addColorStop(1, '#000');
        ctx.fillStyle = eyeG; ctx.beginPath(); ctx.arc(s * 0.22, -s * 0.03, s * 0.05, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(s * 0.24, -s * 0.05, s * 0.015, 0, Math.PI * 2); ctx.fill();
    }

    drawShark(ctx: CanvasRenderingContext2D, s: number, c: string[]) {
        // 鯊魚尾巴
        ctx.save(); ctx.rotate(this.tailAngle * 0.7);
        ctx.fillStyle = c[1]; ctx.beginPath();
        ctx.moveTo(-s * 0.35, 0); ctx.lineTo(-s * 0.7, -s * 0.35); ctx.lineTo(-s * 0.5, 0); ctx.lineTo(-s * 0.7, s * 0.2);
        ctx.closePath(); ctx.fill(); ctx.restore();
        // 背鰭（標誌性）
        ctx.fillStyle = c[0]; ctx.beginPath();
        ctx.moveTo(-s * 0.05, -s * 0.15); ctx.lineTo(s * 0.05, -s * 0.45); ctx.lineTo(s * 0.2, -s * 0.15);
        ctx.closePath(); ctx.fill();
        // 身體（流線型）
        const bodyG = ctx.createLinearGradient(0, -s * 0.2, 0, s * 0.2);
        bodyG.addColorStop(0, c[0]); bodyG.addColorStop(0.6, c[1]); bodyG.addColorStop(1, '#FFF');
        ctx.fillStyle = bodyG; ctx.beginPath();
        ctx.moveTo(s * 0.5, 0); ctx.quadraticCurveTo(s * 0.3, -s * 0.2, -s * 0.35, -s * 0.12);
        ctx.lineTo(-s * 0.35, s * 0.1); ctx.quadraticCurveTo(s * 0.3, s * 0.18, s * 0.5, 0);
        ctx.fill();
        // 胸鰭
        ctx.fillStyle = c[1]; ctx.beginPath();
        ctx.ellipse(s * 0.05, s * 0.12, s * 0.18, s * 0.06, 0.4, 0, Math.PI * 2); ctx.fill();
        // 鰓裂
        ctx.strokeStyle = c[2]; ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(s * 0.2 + i * s * 0.05, -s * 0.08); ctx.lineTo(s * 0.2 + i * s * 0.05, s * 0.08); ctx.stroke(); }
        // 眼睛（小而兇狠）
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(s * 0.35, -s * 0.05, s * 0.035, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(s * 0.36, -s * 0.06, s * 0.01, 0, Math.PI * 2); ctx.fill();
    }

    drawManta(ctx: CanvasRenderingContext2D, s: number, c: string[]) {
        // 魔鬼魚（魟魚）
        ctx.save(); ctx.rotate(this.tailAngle * 0.3);
        // 長尾巴
        ctx.strokeStyle = c[2]; ctx.lineWidth = 3; ctx.beginPath();
        ctx.moveTo(-s * 0.3, 0); ctx.quadraticCurveTo(-s * 0.5, s * 0.1, -s * 0.8, s * 0.05);
        ctx.stroke(); ctx.restore();
        // 身體（扁平菱形）
        const bodyG = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.5);
        bodyG.addColorStop(0, c[0]); bodyG.addColorStop(0.5, c[1]); bodyG.addColorStop(1, c[2]);
        ctx.fillStyle = bodyG; ctx.beginPath();
        ctx.moveTo(s * 0.35, 0); ctx.quadraticCurveTo(s * 0.2, -s * 0.15, 0, -s * 0.35);
        ctx.quadraticCurveTo(-s * 0.2, -s * 0.15, -s * 0.3, 0);
        ctx.quadraticCurveTo(-s * 0.2, s * 0.15, 0, s * 0.35);
        ctx.quadraticCurveTo(s * 0.2, s * 0.15, s * 0.35, 0); ctx.fill();
        // 翼鰭擺動
        ctx.save(); ctx.rotate(this.finAngle);
        ctx.fillStyle = c[1]; ctx.beginPath();
        ctx.ellipse(0, -s * 0.25, s * 0.45, s * 0.12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, s * 0.25, s * 0.45, s * 0.12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // 斑紋
        ctx.globalAlpha = 0.3; ctx.fillStyle = '#FFF';
        ctx.beginPath(); ctx.ellipse(s * 0.05, -s * 0.08, s * 0.08, s * 0.04, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(s * 0.05, s * 0.08, s * 0.08, s * 0.04, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        // 眼睛
        ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(s * 0.18, -s * 0.12, s * 0.04, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(s * 0.19, -s * 0.12, s * 0.025, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(s * 0.18, s * 0.12, s * 0.04, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(s * 0.19, s * 0.12, s * 0.025, 0, Math.PI * 2); ctx.fill();
    }

    drawSwordfish(ctx: CanvasRenderingContext2D, s: number, c: string[]) {
        // 劍魚尾巴
        ctx.save(); ctx.rotate(this.tailAngle);
        ctx.fillStyle = c[1]; ctx.beginPath();
        ctx.moveTo(-s * 0.25, 0); ctx.lineTo(-s * 0.55, -s * 0.2); ctx.lineTo(-s * 0.4, 0); ctx.lineTo(-s * 0.55, s * 0.2);
        ctx.closePath(); ctx.fill(); ctx.restore();
        // 背鰭（高而流線）
        ctx.fillStyle = c[0]; ctx.beginPath();
        ctx.moveTo(-s * 0.15, -s * 0.1); ctx.quadraticCurveTo(0, -s * 0.35, s * 0.15, -s * 0.1);
        ctx.closePath(); ctx.fill();
        // 身體
        const bodyG = ctx.createLinearGradient(0, -s * 0.15, 0, s * 0.15);
        bodyG.addColorStop(0, c[0]); bodyG.addColorStop(0.5, c[1]); bodyG.addColorStop(1, c[2]);
        ctx.fillStyle = bodyG; ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.3, s * 0.12, 0, 0, Math.PI * 2); ctx.fill();
        // 長嘴（劍）
        ctx.fillStyle = c[0]; ctx.beginPath();
        ctx.moveTo(s * 0.28, -s * 0.02); ctx.lineTo(s * 0.7, 0); ctx.lineTo(s * 0.28, s * 0.02);
        ctx.closePath(); ctx.fill();
        // 眼睛
        ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.arc(s * 0.15, -s * 0.02, s * 0.045, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(s * 0.16, -s * 0.02, s * 0.025, 0, Math.PI * 2); ctx.fill();
    }

    drawPuffer(ctx: CanvasRenderingContext2D, s: number, c: string[]) {
        // 河豚（圓滾滾）
        const puffScale = 1 + Math.sin(Date.now() * 0.005) * 0.08;
        // 小尾巴
        ctx.fillStyle = c[1]; ctx.beginPath();
        ctx.ellipse(-s * 0.3, 0, s * 0.1, s * 0.06, 0, 0, Math.PI * 2); ctx.fill();
        // 身體（圓形）
        const bodyG = ctx.createRadialGradient(s * 0.05, -s * 0.05, 0, 0, 0, s * 0.35 * puffScale);
        bodyG.addColorStop(0, '#FFF'); bodyG.addColorStop(0.4, c[0]); bodyG.addColorStop(0.8, c[1]); bodyG.addColorStop(1, c[2]);
        ctx.fillStyle = bodyG; ctx.beginPath();
        ctx.arc(0, 0, s * 0.3 * puffScale, 0, Math.PI * 2); ctx.fill();
        // 刺
        ctx.strokeStyle = c[2]; ctx.lineWidth = 2;
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const r1 = s * 0.28 * puffScale, r2 = s * 0.36 * puffScale;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
            ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
            ctx.stroke();
        }
        // 小鰭
        ctx.save(); ctx.rotate(this.finAngle);
        ctx.fillStyle = c[1]; ctx.beginPath();
        ctx.ellipse(s * 0.15, s * 0.2, s * 0.08, s * 0.04, 0.5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        // 大眼睛
        ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(s * 0.12, -s * 0.08, s * 0.1, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(s * 0.14, -s * 0.08, s * 0.06, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(s * 0.16, -s * 0.1, s * 0.02, 0, Math.PI * 2); ctx.fill();
        // 小嘴
        ctx.strokeStyle = c[2]; ctx.lineWidth = 2; ctx.beginPath();
        ctx.arc(s * 0.25, s * 0.02, s * 0.04, 0.3, Math.PI - 0.3); ctx.stroke();
    }

    drawLantern(ctx: CanvasRenderingContext2D, s: number, c: string[]) {
        // 燈籠魚
        // 發光燈籠
        const glowIntensity = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
        ctx.save();
        ctx.shadowColor = '#00FFFF'; ctx.shadowBlur = 30 * glowIntensity;
        const lanternG = ctx.createRadialGradient(s * 0.35, -s * 0.25, 0, s * 0.35, -s * 0.25, s * 0.12);
        lanternG.addColorStop(0, `rgba(255,255,255,${glowIntensity})`); lanternG.addColorStop(0.3, `rgba(0,255,255,${glowIntensity * 0.8})`); lanternG.addColorStop(1, 'transparent');
        ctx.fillStyle = lanternG; ctx.beginPath(); ctx.arc(s * 0.35, -s * 0.25, s * 0.1, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // 觸鬚
        ctx.strokeStyle = c[0]; ctx.lineWidth = 2; ctx.beginPath();
        ctx.moveTo(s * 0.2, -s * 0.12); ctx.quadraticCurveTo(s * 0.3, -s * 0.2, s * 0.35, -s * 0.18);
        ctx.stroke();
        // 身體
        ctx.save(); ctx.rotate(this.tailAngle * 0.5);
        ctx.fillStyle = c[2]; ctx.beginPath();
        ctx.moveTo(-s * 0.25, 0); ctx.lineTo(-s * 0.4, -s * 0.12); ctx.lineTo(-s * 0.35, 0); ctx.lineTo(-s * 0.4, s * 0.12);
        ctx.closePath(); ctx.fill(); ctx.restore();
        const bodyG = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.3);
        bodyG.addColorStop(0, c[0]); bodyG.addColorStop(0.6, c[1]); bodyG.addColorStop(1, c[2]);
        ctx.fillStyle = bodyG; ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.28, s * 0.18, 0, 0, Math.PI * 2); ctx.fill();
        // 發光斑點
        ctx.fillStyle = `rgba(0,255,255,${glowIntensity * 0.6})`;
        ctx.beginPath(); ctx.arc(-s * 0.05, s * 0.05, s * 0.03, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(s * 0.08, -s * 0.02, s * 0.025, 0, Math.PI * 2); ctx.fill();
        // 眼睛
        ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(s * 0.15, -s * 0.02, s * 0.06, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(s * 0.16, -s * 0.02, s * 0.035, 0, Math.PI * 2); ctx.fill();
    }

    drawDragon(ctx: CanvasRenderingContext2D, s: number, c: string[]) {
        // 龍王 Boss
        // 尾巴（火焰狀）
        ctx.save(); ctx.rotate(this.tailAngle);
        for (let i = 0; i < 5; i++) {
            const offset = Math.sin(Date.now() * 0.015 + i * 0.5) * s * 0.05;
            ctx.fillStyle = i % 2 === 0 ? c[0] : c[1]; ctx.beginPath();
            ctx.moveTo(-s * 0.3, offset); ctx.lineTo(-s * 0.5 - i * s * 0.06, -s * 0.1 + offset);
            ctx.lineTo(-s * 0.45 - i * s * 0.05, offset); ctx.lineTo(-s * 0.5 - i * s * 0.06, s * 0.1 + offset);
            ctx.closePath(); ctx.fill();
        }
        ctx.restore();
        // 龍角
        ctx.fillStyle = '#FFD700'; ctx.beginPath();
        ctx.moveTo(s * 0.15, -s * 0.15); ctx.lineTo(s * 0.25, -s * 0.4); ctx.lineTo(s * 0.3, -s * 0.15); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(s * 0.05, -s * 0.12); ctx.lineTo(s * 0.1, -s * 0.35); ctx.lineTo(s * 0.18, -s * 0.12); ctx.fill();
        // 背鰭（鋸齒狀）
        ctx.fillStyle = c[1];
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(-s * 0.15 + i * s * 0.08, -s * 0.15);
            ctx.lineTo(-s * 0.1 + i * s * 0.08, -s * 0.28 + Math.sin(Date.now() * 0.01 + i) * s * 0.03);
            ctx.lineTo(-s * 0.05 + i * s * 0.08, -s * 0.15); ctx.fill();
        }
        // 身體
        const bodyG = ctx.createLinearGradient(-s * 0.3, 0, s * 0.4, 0);
        bodyG.addColorStop(0, c[2]); bodyG.addColorStop(0.3, c[1]); bodyG.addColorStop(0.6, c[0]); bodyG.addColorStop(1, '#FFD700');
        ctx.fillStyle = bodyG; ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.4, s * 0.2, 0, 0, Math.PI * 2); ctx.fill();
        // 龍鱗
        ctx.strokeStyle = 'rgba(255,215,0,0.5)'; ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 3; j++) {
                ctx.beginPath();
                ctx.arc(-s * 0.25 + i * s * 0.08, -s * 0.08 + j * s * 0.08, s * 0.04, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        // 龍鬚
        ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(s * 0.35, -s * 0.05);
        ctx.quadraticCurveTo(s * 0.5, -s * 0.15, s * 0.6, -s * 0.1 + Math.sin(Date.now() * 0.01) * s * 0.03);
        ctx.stroke();
        ctx.beginPath(); ctx.moveTo(s * 0.35, s * 0.05);
        ctx.quadraticCurveTo(s * 0.5, s * 0.15, s * 0.6, s * 0.1 + Math.sin(Date.now() * 0.01) * s * 0.03);
        ctx.stroke();
        // 眼睛（威嚴）
        ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.ellipse(s * 0.25, -s * 0.03, s * 0.07, s * 0.05, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FF0000'; ctx.beginPath(); ctx.ellipse(s * 0.26, -s * 0.03, s * 0.035, s * 0.04, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(s * 0.27, -s * 0.03, s * 0.015, 0, Math.PI * 2); ctx.fill();
    }

    drawTurtle(ctx: CanvasRenderingContext2D, s: number, c: string[]) {
        // 海龜
        // 後鰭
        ctx.save(); ctx.rotate(this.finAngle * 0.5);
        ctx.fillStyle = c[1];
        ctx.beginPath(); ctx.ellipse(-s * 0.3, s * 0.12, s * 0.12, s * 0.06, -0.3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(-s * 0.3, -s * 0.12, s * 0.12, s * 0.06, 0.3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // 殼
        const shellG = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.35);
        shellG.addColorStop(0, c[0]); shellG.addColorStop(0.5, c[1]); shellG.addColorStop(1, c[2]);
        ctx.fillStyle = shellG; ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.32, s * 0.25, 0, 0, Math.PI * 2); ctx.fill();
        // 殼紋
        ctx.strokeStyle = c[2]; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-s * 0.2, 0); ctx.lineTo(s * 0.2, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -s * 0.18); ctx.lineTo(0, s * 0.18); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-s * 0.1, -s * 0.15); ctx.lineTo(s * 0.1, s * 0.15);
        ctx.moveTo(s * 0.1, -s * 0.15); ctx.lineTo(-s * 0.1, s * 0.15);
        ctx.stroke();
        // 前鰭
        ctx.save(); ctx.rotate(this.finAngle);
        ctx.fillStyle = c[0];
        ctx.beginPath(); ctx.ellipse(s * 0.25, -s * 0.1, s * 0.18, s * 0.07, -0.4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(s * 0.25, s * 0.1, s * 0.18, s * 0.07, 0.4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // 頭
        ctx.fillStyle = c[0]; ctx.beginPath();
        ctx.ellipse(s * 0.35, 0, s * 0.12, s * 0.08, 0, 0, Math.PI * 2); ctx.fill();
        // 眼睛
        ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(s * 0.38, -s * 0.03, s * 0.04, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(s * 0.39, -s * 0.03, s * 0.025, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(s * 0.38, s * 0.03, s * 0.04, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(s * 0.39, s * 0.03, s * 0.025, 0, Math.PI * 2); ctx.fill();
    }
}

export class Coin {
    x: number;
    y: number;
    value: number;
    sx: number;
    sy: number;
    tx: number;
    ty: number;
    t: number;
    active: boolean;
    rot: number;
    size: number;

    constructor(x: number, y: number, val: number, tx: number, ty: number) {
        this.x = x;
        this.y = y;
        this.value = val;
        this.sx = x;
        this.sy = y;
        this.tx = tx;
        this.ty = ty;
        this.t = 0;
        this.active = true;
        this.rot = 0;
        this.size = 22 * Utils.getScale();
    }

    update(): boolean {
        this.t += 0.022;
        this.rot += 0.18;
        if (this.t >= 1) {
            this.active = false;
            return true;
        }
        this.x = Utils.lerp(this.sx, this.tx, this.t);
        this.y = Utils.lerp(this.sy, this.ty, this.t) - Math.sin(this.t * Math.PI) * 120;
        return false;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20;
        const g = ctx.createRadialGradient(-3, -3, 0, 0, 0, this.size);
        g.addColorStop(0, '#FFF8DC');
        g.addColorStop(0.3, '#FFD700');
        g.addColorStop(0.7, '#FFA500');
        g.addColorStop(1, '#B8860B');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#8B4513';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 1);
        ctx.restore();
    }
}

export class Particle {
    x: number;
    y: number;
    color: string;
    type: string;
    vx: number;
    vy: number;
    life: number;
    size: number;
    rot: number;

    constructor(x: number, y: number, color: string, type = 'n') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.type = type;
        this.vx = (Math.random() - 0.5) * (type === 's' ? 8 : 16);
        this.vy = (Math.random() - 0.5) * (type === 's' ? 8 : 16) - 2;
        this.life = 1;
        this.size = type === 's' ? Utils.random(3, 7) : Utils.random(8, 18);
        this.rot = Math.random() * Math.PI * 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.18;
        this.vx *= 0.97;
        this.life -= 0.025;
        this.size *= 0.96;
        this.rot += 0.12;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        if (this.type === 's') {
            ctx.fillStyle = '#FFD700';
            ctx.shadowColor = '#FFF';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const a = i * Math.PI * 2 / 5 - Math.PI / 2;
                ctx.lineTo(Math.cos(a) * this.size, Math.sin(a) * this.size);
                ctx.lineTo(Math.cos(a + Math.PI / 5) * this.size * 0.4, Math.sin(a + Math.PI / 5) * this.size * 0.4);
            }
            ctx.closePath();
            ctx.fill();
        } else {
            const g = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
            g.addColorStop(0, '#FFF');
            g.addColorStop(0.4, this.color);
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}
