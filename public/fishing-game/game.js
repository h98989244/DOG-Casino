// API 配置
const API_URL = 'https://mwveurwebuesiewcjmcq.supabase.co/functions/v1/fishing-api';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13dmV1cndlYnVlc2lld2NqbWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjU5NDgsImV4cCI6MjA3MDg0MTk0OH0.HEELAA34SI-7dy1n3pOFlXwJiCrCqtzPggXviylm5oU';

function getUserId() {
  let id = localStorage.getItem('fishing_user_id');
  if (!id) { id = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10); localStorage.setItem('fishing_user_id', id); }
  return id;
}

async function callAPI(action, data = {}) {
  try {
    const res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` }, body: JSON.stringify({ action, data: { userId: getUserId(), ...data } }) });
    return await res.json();
  } catch (e) { return { success: false, error: e.message }; }
}

const CONFIG = {
  betSteps: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000], fireRate: 150, bulletSpeed: 12,
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
  ]
};

const state = { coins: 10000, currentBet: 10, autoFire: false, locked: false, lockedFish: null, mouseX: 0, mouseY: 0, turretAngle: -Math.PI / 2, lastFireTime: 0, vipLevel: 0, pendingSync: 0, lastSyncTime: Date.now() };
const Utils = { 
  random: (a, b) => Math.random() * (b - a) + a, 
  distance: (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2), 
  lerp: (a, b, t) => a + (b - a) * t, 
  bezier: (t, p0, p1, p2, p3) => { const m = 1 - t; return m * m * m * p0 + 3 * m * m * t * p1 + 3 * m * t * t * p2 + t * t * t * p3; }, 
  format: n => n.toLocaleString(),
  // 根據螢幕大小計算縮放比例
  getScale: () => {
    const w = window.innerWidth, h = window.innerHeight;
    const minDim = Math.min(w, h);
    if (minDim < 400) return 0.5;
    if (minDim < 500) return 0.6;
    if (minDim < 600) return 0.7;
    if (minDim < 800) return 0.85;
    return 1;
  }
};

class Bullet {
  constructor(x, y, angle, bet) { 
    this.x = x; this.y = y; this.angle = angle; this.bet = bet; this.speed = CONFIG.bulletSpeed; 
    // 根據倍率計算大小：1倍=5px，1000倍=50px，並應用螢幕縮放
    const betIndex = CONFIG.betSteps.indexOf(bet);
    const scale = Utils.getScale();
    this.size = (5 + (betIndex / (CONFIG.betSteps.length - 1)) * 45) * scale;
    this.active = true; this.vx = Math.cos(angle) * this.speed; this.vy = Math.sin(angle) * this.speed; this.trail = []; this.rot = 0; 
  }
  update(w, h) {
    this.trail.push({ x: this.x, y: this.y, a: 1 }); if (this.trail.length > 15) this.trail.shift(); this.trail.forEach(t => t.a *= 0.88);
    this.x += this.vx; this.y += this.vy; this.rot += 0.2;
    // 出界則消失，不反彈
    if (this.x < -this.size || this.x > w + this.size || this.y < -this.size || this.y > h + this.size) { this.active = false; }
    if (state.locked && state.lockedFish?.active) { const a = Math.atan2(state.lockedFish.y - this.y, state.lockedFish.x - this.x); this.angle = Utils.lerp(this.angle, a, 0.1); this.vx = Math.cos(this.angle) * this.speed; this.vy = Math.sin(this.angle) * this.speed; }
  }
  draw(ctx) {
    // 華麗拖尾
    ctx.save();
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i], sz = (i / this.trail.length) * this.size;
      ctx.globalAlpha = t.a * 0.7;
      const g = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, sz);
      g.addColorStop(0, '#FFF'); g.addColorStop(0.3, '#FFD700'); g.addColorStop(1, 'rgba(255,150,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(t.x, t.y, sz, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    // 子彈主體
    ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.rot);
    ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 25;
    const bg = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
    bg.addColorStop(0, '#FFF'); bg.addColorStop(0.2, '#FFD700'); bg.addColorStop(0.6, '#FFA500'); bg.addColorStop(1, 'rgba(255,100,0,0.5)');
    ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(0, 0, this.size, 0, Math.PI * 2); ctx.fill();
    // 內部星芒
    ctx.fillStyle = '#FFF'; ctx.globalAlpha = 0.9;
    for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 4); ctx.beginPath(); ctx.ellipse(0, 0, 3, this.size * 0.6, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
}

class Fish {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.scale = Utils.getScale();
    let r = Math.random(), c = 0; this.type = CONFIG.fishTypes[0];
    for (const t of CONFIG.fishTypes) { c += t.prob; if (r < c) { this.type = t; break; } }
    this.score = this.type.score; this.size = this.type.size * this.scale; this.colors = this.type.colors;
    // 從一邊進入，游到對面出去
    const side = Math.floor(Math.random() * 4);
    let startX, startY, endX, endY;
    if (side === 0) { // 從上方進入
      startX = Utils.random(100, w - 100); startY = -this.size * 2;
      endX = Utils.random(100, w - 100); endY = h + this.size * 2;
    } else if (side === 1) { // 從右側進入
      startX = w + this.size * 2; startY = Utils.random(100, h - 100);
      endX = -this.size * 2; endY = Utils.random(100, h - 100);
    } else if (side === 2) { // 從下方進入
      startX = Utils.random(100, w - 100); startY = h + this.size * 2;
      endX = Utils.random(100, w - 100); endY = -this.size * 2;
    } else { // 從左側進入
      startX = -this.size * 2; startY = Utils.random(100, h - 100);
      endX = w + this.size * 2; endY = Utils.random(100, h - 100);
    }
    this.x = startX; this.y = startY;
    const midX = (startX + endX) / 2 + (Math.random() - 0.5) * w * 0.3;
    const midY = (startY + endY) / 2 + (Math.random() - 0.5) * h * 0.3;
    this.cp = [
      { x: startX, y: startY },
      { x: startX + (midX - startX) * 0.5, y: startY + (midY - startY) * 0.5 },
      { x: midX + (endX - midX) * 0.5, y: midY + (endY - midY) * 0.5 },
      { x: endX, y: endY }
    ];
    this.t = 0; this.speed = this.type.speed * 0.0015; this.angle = 0; this.active = true; this.flash = 0; this.tailAngle = 0; this.finAngle = 0;
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
    // 只有完全離開螢幕才消失
    if (this.t >= 1 || this.x < -this.size * 3 || this.x > this.w + this.size * 3 || this.y < -this.size * 3 || this.y > this.h + this.size * 3) {
      this.active = false;
    }
  }
  draw(ctx) {
    if (!this.active) return;
    const s = this.size, c = this.colors, shape = this.type.shape || 'normal';
    ctx.save();
    ctx.translate(this.x, this.y);
    const flipX = Math.cos(this.angle) < 0 ? -1 : 1;
    ctx.scale(flipX, 1);
    
    // 發光效果
    if (this.type.glow || this.type.boss) {
      ctx.shadowColor = c[0]; ctx.shadowBlur = 30 + Math.sin(Date.now() * 0.008) * 15;
    }
    if (this.flash > 0) { ctx.shadowColor = '#FFF'; ctx.shadowBlur = 40; }
    
    // Boss 光環
    if (this.type.boss) {
      ctx.save(); ctx.rotate(Date.now() * 0.003);
      ctx.strokeStyle = `rgba(255,69,0,${0.3 + Math.sin(Date.now() * 0.005) * 0.2})`;
      ctx.lineWidth = 4; ctx.beginPath();
      for (let i = 0; i < 8; i++) { ctx.arc(0, 0, s * 0.7, i * Math.PI / 4 + 0.1, (i + 1) * Math.PI / 4 - 0.1); }
      ctx.stroke(); ctx.restore();
    }
    
    // 根據形狀繪製不同魚類
    if (shape === 'shark') { this.drawShark(ctx, s, c); }
    else if (shape === 'manta') { this.drawManta(ctx, s, c); }
    else if (shape === 'sword') { this.drawSwordfish(ctx, s, c); }
    else if (shape === 'puffer') { this.drawPuffer(ctx, s, c); }
    else if (shape === 'lantern') { this.drawLantern(ctx, s, c); }
    else if (shape === 'dragon') { this.drawDragon(ctx, s, c); }
    else if (shape === 'turtle') { this.drawTurtle(ctx, s, c); }
    else { this.drawNormalFish(ctx, s, c); }
    
    ctx.restore();
  }
  
  drawNormalFish(ctx, s, c) {
    // 尾巴
    ctx.save(); ctx.rotate(this.tailAngle);
    const tailG = ctx.createLinearGradient(-s * 0.3, 0, -s * 0.7, 0);
    tailG.addColorStop(0, c[0]); tailG.addColorStop(1, c[2]);
    ctx.fillStyle = tailG; ctx.beginPath();
    ctx.moveTo(-s * 0.3, 0); ctx.quadraticCurveTo(-s * 0.5, -s * 0.3, -s * 0.7, -s * 0.25);
    ctx.quadraticCurveTo(-s * 0.55, 0, -s * 0.7, s * 0.25);
    ctx.quadraticCurveTo(-s * 0.5, s * 0.3, -s * 0.3, 0);
    ctx.fill(); ctx.restore();
    // 背鰭
    ctx.save(); ctx.rotate(this.finAngle * 0.5);
    ctx.fillStyle = c[1]; ctx.beginPath();
    ctx.moveTo(-s * 0.1, -s * 0.15); ctx.quadraticCurveTo(0, -s * 0.4, s * 0.15, -s * 0.15);
    ctx.lineTo(-s * 0.1, -s * 0.15); ctx.fill(); ctx.restore();
    // 身體
    const bodyG = ctx.createRadialGradient(s * 0.1, -s * 0.05, 0, 0, 0, s * 0.5);
    bodyG.addColorStop(0, '#FFF'); bodyG.addColorStop(0.3, c[0]); bodyG.addColorStop(0.7, c[1]); bodyG.addColorStop(1, c[2]);
    ctx.fillStyle = bodyG; ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.4, s * 0.22, 0, 0, Math.PI * 2); ctx.fill();
    // 鱗片紋理
    ctx.globalAlpha = 0.3; ctx.strokeStyle = c[2]; ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-s * 0.1 + i * s * 0.1, 0, s * 0.08, 0, Math.PI * 2); ctx.stroke(); }
    ctx.globalAlpha = 1;
    // 胸鰭
    ctx.save(); ctx.translate(s * 0.05, s * 0.12); ctx.rotate(this.finAngle);
    ctx.fillStyle = c[1]; ctx.beginPath();
    ctx.ellipse(0, s * 0.1, s * 0.06, s * 0.15, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    // 眼睛
    ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(s * 0.2, -s * 0.03, s * 0.08, 0, Math.PI * 2); ctx.fill();
    const eyeG = ctx.createRadialGradient(s * 0.22, -s * 0.04, 0, s * 0.2, -s * 0.03, s * 0.05);
    eyeG.addColorStop(0, '#000'); eyeG.addColorStop(0.7, '#222'); eyeG.addColorStop(1, '#000');
    ctx.fillStyle = eyeG; ctx.beginPath(); ctx.arc(s * 0.22, -s * 0.03, s * 0.05, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(s * 0.24, -s * 0.05, s * 0.015, 0, Math.PI * 2); ctx.fill();
  }
  
  drawShark(ctx, s, c) {
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
  
  drawManta(ctx, s, c) {
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
  
  drawSwordfish(ctx, s, c) {
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
  
  drawPuffer(ctx, s, c) {
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
  
  drawLantern(ctx, s, c) {
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
  
  drawDragon(ctx, s, c) {
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
  
  drawTurtle(ctx, s, c) {
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

class Coin {
  constructor(x, y, val, tx, ty) { this.x = x; this.y = y; this.value = val; this.sx = x; this.sy = y; this.tx = tx; this.ty = ty; this.t = 0; this.active = true; this.rot = 0; this.size = 22 * Utils.getScale(); }
  update() { this.t += 0.022; this.rot += 0.18; if (this.t >= 1) { this.active = false; return true; } this.x = Utils.lerp(this.sx, this.tx, this.t); this.y = Utils.lerp(this.sy, this.ty, this.t) - Math.sin(this.t * Math.PI) * 120; return false; }
  draw(ctx) {
    ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.rot);
    ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 20;
    const g = ctx.createRadialGradient(-3, -3, 0, 0, 0, this.size);
    g.addColorStop(0, '#FFF8DC'); g.addColorStop(0.3, '#FFD700'); g.addColorStop(0.7, '#FFA500'); g.addColorStop(1, '#B8860B');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, this.size, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#8B4513'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 1);
    ctx.restore();
  }
}

class Particle {
  constructor(x, y, color, type = 'n') {
    this.x = x; this.y = y; this.color = color; this.type = type;
    this.vx = (Math.random() - 0.5) * (type === 's' ? 8 : 16);
    this.vy = (Math.random() - 0.5) * (type === 's' ? 8 : 16) - 2;
    this.life = 1; this.size = type === 's' ? Utils.random(3, 7) : Utils.random(8, 18); this.rot = Math.random() * Math.PI * 2;
  }
  update() { this.x += this.vx; this.y += this.vy; this.vy += 0.18; this.vx *= 0.97; this.life -= 0.025; this.size *= 0.96; this.rot += 0.12; }
  draw(ctx) {
    ctx.save(); ctx.globalAlpha = this.life; ctx.translate(this.x, this.y); ctx.rotate(this.rot);
    if (this.type === 's') {
      ctx.fillStyle = '#FFD700'; ctx.shadowColor = '#FFF'; ctx.shadowBlur = 12;
      ctx.beginPath(); for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5 - Math.PI / 2; ctx.lineTo(Math.cos(a) * this.size, Math.sin(a) * this.size); ctx.lineTo(Math.cos(a + Math.PI / 5) * this.size * 0.4, Math.sin(a + Math.PI / 5) * this.size * 0.4); } ctx.closePath(); ctx.fill();
    } else {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
      g.addColorStop(0, '#FFF'); g.addColorStop(0.4, this.color); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, this.size, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas'); this.ctx = this.canvas.getContext('2d');
    this.bullets = []; this.fishes = []; this.coins = []; this.particles = []; this.bubbles = []; this.time = 0;
    this.seaweeds = []; this.bgFishes = []; this.caustics = []; this.rocks = []; this.corals = [];
    // 載入背景圖片
    this.bgImage = new Image();
    this.bgImage.src = 'bg.png';
    this.bgLoaded = false;
    this.bgImage.onload = () => { this.bgLoaded = true; };
    this.resize(); window.addEventListener('resize', () => this.resize());
    this.canvas.addEventListener('mousemove', e => this.onMouse(e));
    this.canvas.addEventListener('click', () => !state.autoFire && this.fire());
    this.canvas.addEventListener('touchstart', e => { e.preventDefault(); this.onTouch(e); this.fire(); }, { passive: false });
    this.setupUI(); this.initBackground(); this.init(); setInterval(() => this.spawnBubble(), 180);
  }
  initBackground() {
    // 初始化岩石
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
    // 初始化珊瑚
    this.corals = [];
    const coralColors = [
      ['#FF6B6B', '#FF8E8E', '#FFB4B4'], ['#FF69B4', '#FF85C1', '#FFB6D9'],
      ['#FFA500', '#FFB733', '#FFCC66'], ['#9370DB', '#A78BDB', '#BBA6DB'],
      ['#20B2AA', '#4DC9C1', '#7ADFD8'], ['#FF4500', '#FF6A33', '#FF8F66']
    ];
    for (let i = 0; i < 10; i++) {
      const colors = coralColors[Math.floor(Math.random() * coralColors.length)];
      this.corals.push({
        x: Utils.random(50, this.w - 50), y: this.h - Utils.random(10, 50),
        type: Math.floor(Math.random() * 3), // 0=分枝, 1=扇形, 2=腦珊瑚
        size: Utils.random(40, 80), colors: colors,
        sway: Math.random() * Math.PI * 2, swaySpeed: Utils.random(0.01, 0.025)
      });
    }
    // 初始化水草
    this.seaweeds = [];
    for (let i = 0; i < 15; i++) {
      this.seaweeds.push({
        x: Utils.random(50, this.w - 50), baseY: this.h, height: Utils.random(100, 250),
        segments: Math.floor(Utils.random(8, 14)), color: `hsl(${Utils.random(90, 160)}, ${Utils.random(60, 80)}%, ${Utils.random(25, 45)}%)`,
        phase: Math.random() * Math.PI * 2, speed: Utils.random(0.02, 0.04)
      });
    }
    // 初始化遠景小魚群
    this.bgFishes = [];
    for (let i = 0; i < 20; i++) {
      this.bgFishes.push({
        x: Utils.random(0, this.w), y: Utils.random(100, this.h - 200),
        size: Utils.random(8, 18), speed: Utils.random(0.3, 1),
        color: `hsla(${Utils.random(180, 220)}, 60%, 60%, 0.4)`, dir: Math.random() > 0.5 ? 1 : -1
      });
    }
    // 初始化焦散光效
    this.caustics = [];
    for (let i = 0; i < 10; i++) {
      this.caustics.push({ x: Utils.random(0, this.w), y: Utils.random(0, this.h), size: Utils.random(100, 250), phase: Math.random() * Math.PI * 2 });
    }
  }
  resize() { this.w = window.innerWidth; this.h = window.innerHeight; this.canvas.width = this.w; this.canvas.height = this.h; if (this.seaweeds) this.initBackground(); }
  onMouse(e) { state.mouseX = e.clientX; state.mouseY = e.clientY; state.turretAngle = Math.atan2(state.mouseY - (this.h - 100), state.mouseX - this.w / 2); }
  onTouch(e) { const t = e.touches[0]; state.mouseX = t.clientX; state.mouseY = t.clientY; state.turretAngle = Math.atan2(state.mouseY - (this.h - 100), state.mouseX - this.w / 2); }
  setupUI() {
    document.querySelectorAll('.close-btn').forEach(b => b.onclick = () => document.getElementById(b.dataset.modal).classList.remove('active'));
    document.getElementById('settings-btn').onclick = () => document.getElementById('settings-modal').classList.add('active');
    document.getElementById('recharge-btn').onclick = () => { this.loadPackages(); document.getElementById('recharge-modal').classList.add('active'); };
    document.getElementById('gift-btn').onclick = () => document.getElementById('gift-modal').classList.add('active');
    document.getElementById('bet-decrease').onclick = () => this.changeBet(-1);
    document.getElementById('bet-increase').onclick = () => this.changeBet(1);
    document.getElementById('auto-fire-btn').onclick = e => { state.autoFire = !state.autoFire; e.currentTarget.classList.toggle('active'); };
    document.getElementById('lock-btn').onclick = e => { state.locked = !state.locked; state.lockedFish = null; e.currentTarget.classList.toggle('active'); };
    document.getElementById('claim-daily-btn').onclick = () => this.claimDaily();
    document.getElementById('gift-claim-btn').onclick = () => this.claimDaily();
  }
  async init() { const res = await callAPI('getPlayer'); if (res.success && res.player) { state.coins = res.player.coins || 10000; state.vipLevel = res.player.vip_level || 0; } this.updateUI(); this.loop(); }
  updateUI() { document.getElementById('coin-count').textContent = Utils.format(state.coins); document.getElementById('bet-value').textContent = state.currentBet; document.getElementById('vip-level').textContent = 'VIP ' + state.vipLevel; }
  changeBet(d) { const i = CONFIG.betSteps.indexOf(state.currentBet) + d; if (i >= 0 && i < CONFIG.betSteps.length) { state.currentBet = CONFIG.betSteps[i]; this.updateUI(); } }
  fire() {
    const now = Date.now(); if (now - state.lastFireTime < CONFIG.fireRate) return; if (state.coins < state.currentBet) { this.toast('金幣不足！'); return; }
    state.lastFireTime = now; state.coins -= state.currentBet; state.pendingSync -= state.currentBet; this.updateUI();
    const scale = Utils.getScale(), tx = this.w / 2, ty = this.h - 60 * scale - 40;
    const x = tx + Math.cos(state.turretAngle) * 80 * scale, y = ty + Math.sin(state.turretAngle) * 80 * scale;
    this.bullets.push(new Bullet(x, y, state.turretAngle, state.currentBet));
    for (let i = 0; i < 12; i++) this.particles.push(new Particle(x, y, '#FFA500', 's'));
  }
  spawnBubble() { this.bubbles.push({ x: Utils.random(0, this.w), y: this.h + 20, size: Utils.random(3, 28), speed: Utils.random(0.6, 3.5), wobble: Math.random() * Math.PI * 2, shimmer: Math.random() }); if (this.bubbles.length > 60) this.bubbles.shift(); }
  async loadPackages() {
    const res = await callAPI('getPackages'); if (res.success && res.packages) {
      const c = document.getElementById('packages-container');
      c.innerHTML = res.packages.map(p => `<div class="package-card ${p.is_popular ? 'popular' : ''} ${p.is_vip ? 'vip' : ''}" data-id="${p.id}">${p.is_popular ? '<div class="popular-badge">🔥 熱銷</div>' : ''}${p.is_vip ? '<div class="vip-badge">👑 VIP</div>' : ''}<div class="package-icon">${p.is_vip ? '👑' : '🪙'}</div><div class="package-amount">${Utils.format(p.coins)}</div><div class="package-price">NT$ ${p.price}</div>${p.bonus_coins > 0 ? `<div class="bonus">+${Utils.format(p.bonus_coins)}</div>` : ''}</div>`).join('');
      c.querySelectorAll('.package-card').forEach(card => card.onclick = () => this.recharge(card.dataset.id));
    }
  }
  async recharge(pkgId) { const res = await callAPI('recharge', { packageId: pkgId }); if (res.success) { state.coins = res.new_balance; state.vipLevel = res.vip_level; this.updateUI(); document.getElementById('recharge-modal').classList.remove('active'); this.toast(`🎉 充值成功！獲得 ${Utils.format(res.coins_added)} 金幣`); } else { this.toast('充值失敗'); } }
  async claimDaily() { const res = await callAPI('claimDaily'); if (res.success) { state.coins = res.new_balance; this.updateUI(); this.toast(`🎁 領取成功！+${Utils.format(res.coins_claimed)} 金幣`); document.getElementById('claim-daily-btn').disabled = true; document.getElementById('gift-claim-btn').disabled = true; } else { this.toast(res.error || '今日已領取'); } }
  async syncCoins() { if (state.pendingSync !== 0 && Date.now() - state.lastSyncTime > 5000) { await callAPI('updateCoins', { coinsDelta: state.pendingSync }); state.pendingSync = 0; state.lastSyncTime = Date.now(); } }
  toast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2500); }
  spawnFish() { if (this.fishes.length < 16) this.fishes.push(new Fish(this.w, this.h)); }
  checkCollisions() {
    for (const b of this.bullets) { if (!b.active) continue; for (const f of this.fishes) { if (!f.active) continue;
      if (Utils.distance(b.x, b.y, f.x, f.y) < f.size * 0.5) {
        const chance = Math.min(0.95, (state.currentBet / f.score) * 0.35);
        if (Math.random() < chance || state.locked) {
          f.active = false;
          const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFD700', '#FF8C00'];
          for (let i = 0; i < 35; i++) this.particles.push(new Particle(f.x, f.y, colors[Math.floor(Math.random() * colors.length)]));
          for (let i = 0; i < 20; i++) this.particles.push(new Particle(f.x, f.y, '#FFD700', 's'));
          const cnt = Math.ceil(f.score / 60);
          for (let i = 0; i < cnt; i++) setTimeout(() => this.coins.push(new Coin(f.x + (Math.random() - 0.5) * 70, f.y + (Math.random() - 0.5) * 70, Math.ceil(f.score / cnt), this.w / 2, this.h - 100)), i * 35);
          state.pendingSync += f.score;
          if (f.score >= 300) { document.querySelector('.jackpot-amount').textContent = '+' + Utils.format(f.score); document.getElementById('jackpot-modal').classList.remove('hidden'); document.getElementById('jackpot-modal').classList.add('active'); setTimeout(() => { document.getElementById('jackpot-modal').classList.remove('active'); setTimeout(() => document.getElementById('jackpot-modal').classList.add('hidden'), 300); }, 2500); }
        } else { f.flash = 1; for (let i = 0; i < 8; i++) this.particles.push(new Particle(f.x, f.y, '#FFF', 's')); }
        b.active = false; break;
      }
    }}
  }
  update() {
    this.time++; if (this.time % 20 === 0) this.spawnFish();
    this.bullets.forEach(b => b.update(this.w, this.h)); this.fishes.forEach(f => f.update()); this.particles.forEach(p => p.update());
    this.coins.forEach(c => { if (c.update()) { state.coins += c.value; this.updateUI(); } });
    this.bubbles.forEach(b => { b.y -= b.speed; b.x += Math.sin(b.wobble + this.time * 0.04) * 0.6; }); this.bubbles = this.bubbles.filter(b => b.y > -50);
    this.checkCollisions();
    this.bullets = this.bullets.filter(b => b.active); this.fishes = this.fishes.filter(f => f.active); this.particles = this.particles.filter(p => p.life > 0); this.coins = this.coins.filter(c => c.active);
    if (state.autoFire && Date.now() - state.lastFireTime > CONFIG.fireRate) this.fire();
    if (state.locked && (!state.lockedFish || !state.lockedFish.active)) state.lockedFish = this.fishes.reduce((a, f) => !a || Utils.distance(this.w / 2, this.h - 100, f.x, f.y) < Utils.distance(this.w / 2, this.h - 100, a.x, a.y) ? f : a, null);
    this.syncCoins();
  }
  drawBg() {
    const ctx = this.ctx;
    
    // 使用背景圖片
    if (this.bgLoaded) {
      ctx.drawImage(this.bgImage, 0, 0, this.w, this.h);
    } else {
      // 備用漸變背景
      const g = ctx.createLinearGradient(0, 0, 0, this.h);
      g.addColorStop(0, '#000814'); g.addColorStop(0.3, '#001d3d'); g.addColorStop(0.6, '#003566'); g.addColorStop(1, '#005588');
      ctx.fillStyle = g; ctx.fillRect(0, 0, this.w, this.h);
    }
    
    // 動態光線效果（疊加在背景上）
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
    
    // 氣泡
    ctx.save();
    this.bubbles.forEach(b => {
      const shimmer = 0.3 + Math.sin(this.time * 0.05 + b.shimmer * 10) * 0.15;
      const bg = ctx.createRadialGradient(b.x - b.size * 0.3, b.y - b.size * 0.3, 0, b.x, b.y, b.size);
      bg.addColorStop(0, `rgba(255,255,255,${shimmer + 0.3})`); bg.addColorStop(0.3, `rgba(200,230,255,${shimmer})`); bg.addColorStop(0.7, `rgba(150,200,255,${shimmer * 0.5})`); bg.addColorStop(1, 'rgba(100,150,200,0.05)');
      ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(255,255,255,${shimmer + 0.1})`; ctx.lineWidth = 1; ctx.stroke();
      // 氣泡高光
      ctx.fillStyle = `rgba(255,255,255,${shimmer + 0.2})`;
      ctx.beginPath(); ctx.ellipse(b.x - b.size * 0.3, b.y - b.size * 0.3, b.size * 0.2, b.size * 0.15, -0.5, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
    
    // 漂浮微粒（海中浮游生物）
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
    const ctx = this.ctx, scale = Utils.getScale(), x = this.w / 2, y = this.h - 60 * scale - 40;
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    // 底座光暈
    ctx.shadowColor = '#00BFFF'; ctx.shadowBlur = 50;
    const baseG = ctx.createRadialGradient(0, 0, 0, 0, 0, 85);
    baseG.addColorStop(0, 'rgba(0,191,255,0.4)'); baseG.addColorStop(0.5, 'rgba(0,100,200,0.2)'); baseG.addColorStop(1, 'transparent');
    ctx.fillStyle = baseG; ctx.beginPath(); ctx.arc(0, 0, 85, 0, Math.PI * 2); ctx.fill();
    // 底座
    const plateG = ctx.createRadialGradient(0, 0, 0, 0, 0, 55);
    plateG.addColorStop(0, '#4a4a6a'); plateG.addColorStop(0.7, '#2a2a4a'); plateG.addColorStop(1, '#1a1a2a');
    ctx.fillStyle = plateG; ctx.beginPath(); ctx.arc(0, 0, 55, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#00BFFF'; ctx.lineWidth = 3; ctx.stroke();
    // 旋轉環
    ctx.save(); ctx.rotate(this.time * 0.02);
    ctx.strokeStyle = 'rgba(0,191,255,0.5)'; ctx.lineWidth = 2; ctx.setLineDash([10, 15]);
    ctx.beginPath(); ctx.arc(0, 0, 45, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    // 砲管
    ctx.rotate(state.turretAngle + Math.PI / 2);
    const barrelG = ctx.createLinearGradient(-18, 0, 18, 0);
    barrelG.addColorStop(0, '#3a3a5a'); barrelG.addColorStop(0.3, '#6a6a8a'); barrelG.addColorStop(0.7, '#5a5a7a'); barrelG.addColorStop(1, '#2a2a4a');
    ctx.fillStyle = barrelG;
    ctx.beginPath(); ctx.roundRect(-18, -85, 36, 85, 5); ctx.fill();
    ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2; ctx.stroke();
    // 砲管裝飾
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-12, -90, 24, 8);
    ctx.fillRect(-15, -70, 30, 4);
    ctx.fillRect(-15, -50, 30, 4);
    // 發光核心
    const coreG = ctx.createRadialGradient(0, -30, 0, 0, -30, 15);
    coreG.addColorStop(0, '#FFF'); coreG.addColorStop(0.3, '#00BFFF'); coreG.addColorStop(1, 'rgba(0,100,200,0)');
    ctx.fillStyle = coreG; ctx.beginPath(); ctx.arc(0, -30, 15, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  drawLock() {
    if (!state.locked || !state.lockedFish?.active) return; const ctx = this.ctx, f = state.lockedFish;
    ctx.save(); ctx.translate(f.x, f.y);
    // 瞄準框
    ctx.strokeStyle = '#FF0000'; ctx.lineWidth = 3; ctx.shadowColor = '#FF0000'; ctx.shadowBlur = 25;
    ctx.rotate(this.time * 0.04);
    ctx.beginPath(); for (let i = 0; i < 4; i++) ctx.arc(0, 0, f.size + 25, i * Math.PI / 2 + 0.15, (i + 1) * Math.PI / 2 - 0.15); ctx.stroke();
    // 十字準星
    ctx.setLineDash([8, 4]); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-f.size - 35, 0); ctx.lineTo(f.size + 35, 0); ctx.moveTo(0, -f.size - 35); ctx.lineTo(0, f.size + 35); ctx.stroke();
    ctx.restore();
    // 連接線
    ctx.save(); ctx.strokeStyle = 'rgba(255,0,0,0.5)'; ctx.lineWidth = 2; ctx.setLineDash([15, 8]);
    ctx.beginPath(); ctx.moveTo(this.w / 2, this.h - 100); ctx.lineTo(f.x, f.y); ctx.stroke(); ctx.restore();
  }
  render() { this.ctx.clearRect(0, 0, this.w, this.h); this.drawBg(); this.fishes.forEach(f => f.draw(this.ctx)); this.bullets.forEach(b => b.draw(this.ctx)); this.coins.forEach(c => c.draw(this.ctx)); this.particles.forEach(p => p.draw(this.ctx)); this.drawTurret(); this.drawLock(); }
  loop() { this.update(); this.render(); requestAnimationFrame(() => this.loop()); }
}

window.addEventListener('load', () => new Game());
