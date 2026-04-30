export const CANVAS_W = 800;
export const CANVAS_H = 600;
export const SHIP_SPEED = 5;
export const BULLET_SPEED = 10;
export const ENEMY_BASE_SPEED = 1.2;

export type WeaponType = 'single' | 'shotgun' | 'laser';

export interface Vec2 { x: number; y: number; }
export interface Bullet { x: number; y: number; vx: number; vy: number; type: WeaponType; size: number; }
export interface Enemy { x: number; y: number; hp: number; maxHp: number; speed: number; size: number; type: number; points: number; }
export interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number; }
export interface Star { x: number; y: number; speed: number; size: number; brightness: number; }

export const WEAPON_COLORS: Record<WeaponType, string> = {
  single: '#00ffff',
  shotgun: '#ffff00',
  laser: '#ff00ff',
};

export const WEAPON_NAMES: Record<WeaponType, string> = {
  single: 'ПУЛЕМЁТ',
  shotgun: 'ДРОБОВИК',
  laser: 'ЛАЗЕР',
};

export const WEAPONS: WeaponType[] = ['single', 'shotgun', 'laser'];

export function drawPixelShip(ctx: CanvasRenderingContext2D, x: number, y: number, glowColor: string) {
  const p = [
    [0,0,0,0,1,0,0,0,0],
    [0,0,0,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,0],
    [1,1,0,1,1,1,0,1,1],
    [1,0,0,0,1,0,0,0,1],
    [0,0,0,0,1,0,0,0,0],
  ];
  const s = 4;
  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 12;
  p.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      if (cell) {
        ctx.fillStyle = glowColor;
        ctx.fillRect(x - 18 + ci * s, y - 14 + ri * s, s - 1, s - 1);
      }
    });
  });
  ctx.restore();
}

export function drawPixelEnemy(ctx: CanvasRenderingContext2D, e: Enemy) {
  const patterns = [
    [[0,1,1,1,0],[1,1,1,1,1],[1,0,1,0,1],[1,1,1,1,1],[0,1,0,1,0]],
    [[1,0,0,0,1],[0,1,1,1,0],[1,1,0,1,1],[0,1,1,1,0],[1,0,0,0,1]],
    [[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1],[1,1,0,1,1],[0,1,0,1,0]],
  ];
  const colors = ['#ff4444','#ff8800','#cc44ff'];
  const pat = patterns[e.type];
  const s = e.size / 5;
  ctx.save();
  ctx.shadowColor = colors[e.type];
  ctx.shadowBlur = 10;
  ctx.fillStyle = colors[e.type];
  pat.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      if (cell) ctx.fillRect(e.x - e.size/2 + ci*s, e.y - e.size/2 + ri*s, s-1, s-1);
    });
  });
  ctx.restore();
}

export function createStars(): Star[] {
  return Array.from({length: 120}, () => ({
    x: Math.random() * CANVAS_W,
    y: Math.random() * CANVAS_H,
    speed: 0.3 + Math.random() * 1.5,
    size: Math.random() < 0.1 ? 2 : 1,
    brightness: 0.3 + Math.random() * 0.7,
  }));
}
