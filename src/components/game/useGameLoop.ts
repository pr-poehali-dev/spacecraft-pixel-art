import { useEffect, useRef, useState, useCallback } from 'react';
import {
  CANVAS_W, CANVAS_H, SHIP_SPEED, BULLET_SPEED, ENEMY_BASE_SPEED,
  WeaponType, Bullet, Enemy, Particle, Star,
  WEAPON_COLORS, WEAPONS,
  drawPixelShip, drawPixelEnemy, createStars,
} from './gameTypes';

export interface DisplayState {
  score: number;
  lives: number;
  level: number;
  weapon: WeaponType;
  gameState: 'menu' | 'playing' | 'gameover';
  finalScore: number;
}

export function useGameLoop(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const stateRef = useRef({
    ship: { x: CANVAS_W / 2, y: CANVAS_H - 80 },
    bullets: [] as Bullet[],
    enemies: [] as Enemy[],
    particles: [] as Particle[],
    stars: createStars(),
    keys: {} as Record<string, boolean>,
    score: 0,
    lives: 3,
    level: 1,
    weapon: 'single' as WeaponType,
    shootCooldown: 0,
    gameState: 'menu' as 'menu' | 'playing' | 'gameover',
    enemySpawnTimer: 0,
    levelTimer: 0,
    frameCount: 0,
    weaponIndex: 0,
    invincible: 0,
  });

  const [displayState, setDisplayState] = useState<DisplayState>({
    score: 0, lives: 3, level: 1, weapon: 'single' as WeaponType,
    gameState: 'menu' as 'menu' | 'playing' | 'gameover',
    finalScore: 0,
  });

  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const spawnEnemy = useCallback((level: number) => {
    const type = Math.floor(Math.random() * Math.min(3, 1 + Math.floor(level / 2)));
    const hp = 1 + type + Math.floor(level / 3);
    const size = type === 0 ? 20 : type === 1 ? 28 : 22;
    stateRef.current.enemies.push({
      x: 30 + Math.random() * (CANVAS_W - 60),
      y: -size,
      hp, maxHp: hp,
      speed: ENEMY_BASE_SPEED * (1 + level * 0.12) * (0.8 + Math.random() * 0.4),
      size, type,
      points: (type + 1) * 100,
    });
  }, []);

  const addExplosion = (x: number, y: number, color: string, count = 12) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 1 + Math.random() * 3;
      stateRef.current.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.8 + Math.random() * 0.6,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  };

  const shoot = useCallback(() => {
    const s = stateRef.current;
    if (s.shootCooldown > 0) return;
    const { x, y } = s.ship;
    const w = s.weapon;

    if (w === 'single') {
      s.bullets.push({ x, y: y - 20, vx: 0, vy: -BULLET_SPEED, type: w, size: 4 });
      s.shootCooldown = 8;
    } else if (w === 'shotgun') {
      [-0.3, 0, 0.3].forEach(angle => {
        s.bullets.push({ x, y: y-20, vx: Math.sin(angle)*BULLET_SPEED*0.6, vy: -Math.cos(angle)*BULLET_SPEED*0.7, type: w, size: 5 });
      });
      s.shootCooldown = 18;
    } else if (w === 'laser') {
      s.bullets.push({ x, y: y - 20, vx: 0, vy: -BULLET_SPEED * 1.6, type: w, size: 3 });
      s.bullets.push({ x: x - 2, y: y - 20, vx: 0, vy: -BULLET_SPEED * 1.6, type: w, size: 3 });
      s.shootCooldown = 4;
    }
  }, []);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.ship = { x: CANVAS_W / 2, y: CANVAS_H - 80 };
    s.bullets = [];
    s.enemies = [];
    s.particles = [];
    s.score = 0;
    s.lives = 3;
    s.level = 1;
    s.weapon = 'single';
    s.weaponIndex = 0;
    s.shootCooldown = 0;
    s.enemySpawnTimer = 0;
    s.levelTimer = 0;
    s.frameCount = 0;
    s.invincible = 0;
    s.gameState = 'playing';
    setDisplayState(d => ({ ...d, score: 0, lives: 3, level: 1, weapon: 'single', gameState: 'playing' }));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent, down: boolean) => {
      stateRef.current.keys[e.key] = down;
      if (!down) return;
      const s = stateRef.current;
      if (e.key === ' ' || e.key === 'Space') {
        if (s.gameState === 'menu' || s.gameState === 'gameover') startGame();
        else if (s.gameState === 'playing') shoot();
        e.preventDefault();
      }
      if ((e.key === 'q' || e.key === 'Q' || e.key === 'й' || e.key === 'Й') && s.gameState === 'playing') {
        s.weaponIndex = (s.weaponIndex + 1) % 3;
        s.weapon = WEAPONS[s.weaponIndex];
        setDisplayState(d => ({ ...d, weapon: s.weapon }));
      }
    };
    window.addEventListener('keydown', e => onKey(e, true));
    window.addEventListener('keyup', e => onKey(e, false));
    return () => {
      window.removeEventListener('keydown', e => onKey(e, true));
      window.removeEventListener('keyup', e => onKey(e, false));
    };
  }, [shoot, startGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const loop = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 16.67, 3);
      lastTimeRef.current = time;
      const s = stateRef.current;
      s.frameCount++;

      // Stars
      s.stars.forEach(star => {
        star.y += star.speed * dt;
        if (star.y > CANVAS_H) { star.y = 0; star.x = Math.random() * CANVAS_W; }
      });

      if (s.gameState === 'playing') {
        // Move ship
        const spd = SHIP_SPEED * dt;
        if ((s.keys['ArrowLeft'] || s.keys['a'] || s.keys['A'] || s.keys['ф'] || s.keys['Ф']) && s.ship.x > 20) s.ship.x -= spd;
        if ((s.keys['ArrowRight'] || s.keys['d'] || s.keys['D'] || s.keys['в'] || s.keys['В']) && s.ship.x < CANVAS_W - 20) s.ship.x += spd;
        if ((s.keys['ArrowUp'] || s.keys['w'] || s.keys['W'] || s.keys['ц'] || s.keys['Ц']) && s.ship.y > 20) s.ship.y -= spd;
        if ((s.keys['ArrowDown'] || s.keys['s'] || s.keys['S'] || s.keys['ы'] || s.keys['Ы']) && s.ship.y < CANVAS_H - 20) s.ship.y += spd;

        if (s.keys[' ']) shoot();

        // Cooldowns
        if (s.shootCooldown > 0) s.shootCooldown -= dt;
        if (s.invincible > 0) s.invincible -= dt;

        // Bullets
        s.bullets = s.bullets.filter(b => b.y > -20 && b.y < CANVAS_H + 20 && b.x > -20 && b.x < CANVAS_W + 20);
        s.bullets.forEach(b => { b.x += b.vx * dt; b.y += b.vy * dt; });

        // Spawn enemies
        s.enemySpawnTimer -= dt;
        const spawnRate = Math.max(20, 80 - s.level * 5);
        if (s.enemySpawnTimer <= 0) {
          spawnEnemy(s.level);
          if (s.level >= 3 && Math.random() < 0.3) spawnEnemy(s.level);
          if (s.level >= 5 && Math.random() < 0.2) spawnEnemy(s.level);
          s.enemySpawnTimer = spawnRate + Math.random() * 20;
        }

        // Move enemies
        s.enemies.forEach(e => { e.y += e.speed * dt; });
        s.enemies = s.enemies.filter(e => e.y < CANVAS_H + 40);

        // Bullet-enemy collisions
        s.bullets.forEach(b => {
          s.enemies.forEach(e => {
            const dx = b.x - e.x, dy = b.y - e.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < e.size * 0.7) {
              const dmg = b.type === 'laser' ? 2 : 1;
              e.hp -= dmg;
              b.y = -999;
              if (e.hp <= 0) {
                const colors = ['#ff4444','#ff8800','#cc44ff'];
                addExplosion(e.x, e.y, colors[e.type], 16);
                s.score += e.points * s.level;
              }
            }
          });
        });
        s.enemies = s.enemies.filter(e => e.hp > 0);

        // Enemy-ship collision
        if (s.invincible <= 0) {
          s.enemies.forEach(e => {
            const dx = e.x - s.ship.x, dy = e.y - s.ship.y;
            if (Math.sqrt(dx*dx + dy*dy) < e.size * 0.6 + 14) {
              s.lives--;
              addExplosion(s.ship.x, s.ship.y, '#00ffff', 20);
              s.invincible = 120;
              e.hp = 0;
            }
          });
          s.enemies = s.enemies.filter(e => e.hp > 0);
        }

        if (s.lives <= 0) {
          s.gameState = 'gameover';
          setDisplayState(d => ({ ...d, gameState: 'gameover', finalScore: s.score }));
        }

        // Level up
        s.levelTimer += dt;
        const levelTime = 600 + s.level * 100;
        if (s.levelTimer >= levelTime) {
          s.level++;
          s.levelTimer = 0;
          setDisplayState(d => ({ ...d, level: s.level }));
        }

        setDisplayState(d => ({ ...d, score: s.score, lives: s.lives }));
      }

      // Particles
      s.particles.forEach(p => {
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.life -= 0.025 * dt;
        p.vy += 0.05 * dt;
      });
      s.particles = s.particles.filter(p => p.life > 0);

      // === DRAW ===
      ctx.fillStyle = '#000008';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // CRT scanlines
      ctx.save();
      for (let i = 0; i < CANVAS_H; i += 4) {
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(0, i, CANVAS_W, 2);
      }
      ctx.restore();

      // Stars
      s.stars.forEach(star => {
        ctx.save();
        ctx.globalAlpha = star.brightness;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#aaaaff';
        ctx.shadowBlur = 3;
        ctx.fillRect(star.x, star.y, star.size, star.size);
        ctx.restore();
      });

      if (s.gameState === 'playing' || s.gameState === 'gameover') {
        // Bullets
        s.bullets.forEach(b => {
          ctx.save();
          ctx.shadowColor = WEAPON_COLORS[b.type];
          ctx.shadowBlur = 10;
          ctx.fillStyle = WEAPON_COLORS[b.type];
          if (b.type === 'laser') {
            ctx.fillRect(b.x - 2, b.y - 12, 4, 16);
          } else {
            ctx.fillRect(b.x - b.size/2, b.y - b.size/2, b.size, b.size * 2);
          }
          ctx.restore();
        });

        // Enemies
        s.enemies.forEach(e => drawPixelEnemy(ctx, e));

        // HP bars
        s.enemies.forEach(e => {
          if (e.maxHp > 1) {
            const bw = e.size;
            ctx.fillStyle = '#330000';
            ctx.fillRect(e.x - bw/2, e.y + e.size/2 + 3, bw, 3);
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(e.x - bw/2, e.y + e.size/2 + 3, bw * (e.hp / e.maxHp), 3);
          }
        });

        // Ship
        if (s.invincible <= 0 || Math.floor(s.frameCount / 6) % 2 === 0) {
          const glowColor = WEAPON_COLORS[s.weapon];
          drawPixelShip(ctx, s.ship.x, s.ship.y, glowColor);
          // Engine flame
          ctx.save();
          ctx.shadowColor = '#ff8800';
          ctx.shadowBlur = 8;
          const flicker = Math.sin(s.frameCount * 0.4) * 3;
          ctx.fillStyle = Math.random() > 0.5 ? '#ff8800' : '#ffff00';
          ctx.fillRect(s.ship.x - 4, s.ship.y + 14, 4, 4 + flicker);
          ctx.fillStyle = '#ff4400';
          ctx.fillRect(s.ship.x, s.ship.y + 14, 4, 3 + flicker * 0.7);
          ctx.restore();
        }

        // Particles
        s.particles.forEach(p => {
          ctx.save();
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
          ctx.restore();
        });
      }

      // MENU
      if (s.gameState === 'menu') {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#00ffff';
        ctx.font = '28px "Press Start 2P"';
        ctx.fillText('SPACE', CANVAS_W/2, 180);
        ctx.fillStyle = '#ff00ff';
        ctx.shadowColor = '#ff00ff';
        ctx.fillText('SHOOTER', CANVAS_W/2, 220);
        ctx.font = '10px "Press Start 2P"';
        ctx.fillStyle = '#ffff00';
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 10;
        ctx.fillText('RETRO EDITION  1984', CANVAS_W/2, 260);

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '8px "Press Start 2P"';
        ctx.fillText('УПРАВЛЕНИЕ', CANVAS_W/2, 320);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('WASD / СТРЕЛКИ — ДВИЖЕНИЕ', CANVAS_W/2, 345);
        ctx.fillText('ПРОБЕЛ — ОГОНЬ', CANVAS_W/2, 365);
        ctx.fillText('Q — СМЕНА ОРУЖИЯ', CANVAS_W/2, 385);

        ctx.fillStyle = Math.floor(s.frameCount / 20) % 2 === 0 ? '#00ffff' : '#ffffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        ctx.font = '10px "Press Start 2P"';
        ctx.fillText('НАЖМИ ПРОБЕЛ', CANVAS_W/2, 450);
        ctx.restore();
      }

      // GAME OVER
      if (s.gameState === 'gameover') {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.textAlign = 'center';
        ctx.font = '24px "Press Start 2P"';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#ff0000';
        ctx.fillText('GAME OVER', CANVAS_W/2, 230);
        ctx.font = '10px "Press Start 2P"';
        ctx.shadowColor = '#ffff00';
        ctx.fillStyle = '#ffff00';
        ctx.fillText(`СЧЁТ: ${s.score}`, CANVAS_W/2, 280);
        ctx.fillText(`УРОВЕНЬ: ${s.level}`, CANVAS_W/2, 305);
        ctx.fillStyle = Math.floor(s.frameCount / 20) % 2 === 0 ? '#00ffff' : '#888888';
        ctx.shadowColor = '#00ffff';
        ctx.font = '9px "Press Start 2P"';
        ctx.fillText('ПРОБЕЛ — НАЧАТЬ СНОВА', CANVAS_W/2, 370);
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [spawnEnemy, shoot]);

  return { displayState };
}
