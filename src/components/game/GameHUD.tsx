import { WeaponType, WEAPON_COLORS, WEAPON_NAMES } from './gameTypes';

interface GameHUDProps {
  score: number;
  level: number;
  lives: number;
  weapon: WeaponType;
}

export default function GameHUD({ score, level, lives, weapon }: GameHUDProps) {
  return (
    <div
      className="flex justify-between items-center w-full max-w-[800px] px-4 py-2 mb-1"
      style={{ fontFamily: '"Press Start 2P"', fontSize: '10px' }}
    >
      <div style={{ color: '#ffff00' }}>
        СЧЁТ: <span style={{ color: '#ffffff' }}>{score}</span>
      </div>
      <div style={{ color: '#00ffff' }}>
        УРОВЕНЬ: <span style={{ color: '#ffffff' }}>{level}</span>
      </div>
      <div style={{ color: '#ff00ff' }}>
        ЖИЗНИ: <span style={{ color: '#ff4444' }}>{'♥ '.repeat(Math.max(0, lives))}</span>
      </div>
      <div style={{ color: '#aaaaaa' }}>
        <span style={{ color: WEAPON_COLORS[weapon] }}>
          {WEAPON_NAMES[weapon]}
        </span>
      </div>
    </div>
  );
}
