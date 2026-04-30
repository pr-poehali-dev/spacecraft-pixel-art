import { useRef } from 'react';
import { CANVAS_W, CANVAS_H } from './game/gameTypes';
import { useGameLoop } from './game/useGameLoop';
import GameHUD from './game/GameHUD';
import MobileControls from './game/MobileControls';

export default function SpaceShooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { displayState, startGame, shoot, switchWeapon, setKey } = useGameLoop(canvasRef);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-black"
      style={{ overflow: 'hidden', touchAction: 'none' }}
    >
      <GameHUD
        score={displayState.score}
        level={displayState.level}
        lives={displayState.lives}
        weapon={displayState.weapon}
      />

      <div style={{
        position: 'relative',
        boxShadow: '0 0 40px #00ffff44, 0 0 80px #ff00ff22, inset 0 0 30px #00000088',
        border: '2px solid #00ffff44',
      }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={{
            display: 'block',
            imageRendering: 'pixelated',
            maxWidth: '100vw',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.6) 100%)',
        }} />
      </div>

      <div
        className="mt-3 text-center opacity-50 hidden md:block"
        style={{ fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#aaaaaa', lineHeight: '1.8' }}
      >
        WASD/СТРЕЛКИ — ДВИЖЕНИЕ  |  ПРОБЕЛ — ОГОНЬ  |  Q — СМЕНА ОРУЖИЯ
      </div>

      <MobileControls
        onSetKey={setKey}
        onShoot={shoot}
        onSwitchWeapon={switchWeapon}
        onStart={startGame}
        gameState={displayState.gameState}
      />
    </div>
  );
}
