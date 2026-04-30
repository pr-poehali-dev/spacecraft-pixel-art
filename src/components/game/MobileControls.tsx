import { useCallback } from 'react';

interface MobileControlsProps {
  onSetKey: (key: string, value: boolean) => void;
  onShoot: () => void;
  onSwitchWeapon: () => void;
  onStart: () => void;
  gameState: 'menu' | 'playing' | 'gameover';
}

const BTN = {
  base: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const,
    touchAction: 'manipulation' as const,
    cursor: 'pointer',
    fontFamily: '"Press Start 2P"',
    border: '2px solid',
    borderRadius: '6px',
    WebkitTapHighlightColor: 'transparent',
  },
};

function DpadBtn({
  label, keyName, onSetKey, style,
}: {
  label: string;
  keyName: string;
  onSetKey: (key: string, value: boolean) => void;
  style?: React.CSSProperties;
}) {
  const onStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onSetKey(keyName, true);
  }, [keyName, onSetKey]);

  const onEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onSetKey(keyName, false);
  }, [keyName, onSetKey]);

  return (
    <div
      onTouchStart={onStart}
      onTouchEnd={onEnd}
      onMouseDown={onStart}
      onMouseUp={onEnd}
      onMouseLeave={onEnd}
      style={{
        ...BTN.base,
        width: 56,
        height: 56,
        fontSize: '18px',
        background: 'rgba(0,255,255,0.08)',
        borderColor: '#00ffff44',
        color: '#00ffff',
        boxShadow: '0 0 8px #00ffff33',
        ...style,
      }}
    >
      {label}
    </div>
  );
}

function ActionBtn({
  label, color, size = 64, onPress, style,
}: {
  label: string;
  color: string;
  size?: number;
  onPress: () => void;
  style?: React.CSSProperties;
}) {
  const onStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onPress();
  }, [onPress]);

  return (
    <div
      onTouchStart={onStart}
      onMouseDown={onStart}
      style={{
        ...BTN.base,
        width: size,
        height: size,
        fontSize: '9px',
        background: `${color}22`,
        borderColor: `${color}88`,
        color: color,
        boxShadow: `0 0 12px ${color}44`,
        textAlign: 'center' as const,
        lineHeight: '1.3',
        padding: '4px',
        ...style,
      }}
    >
      {label}
    </div>
  );
}

export default function MobileControls({
  onSetKey, onShoot, onSwitchWeapon, onStart, gameState,
}: MobileControlsProps) {
  if (gameState === 'menu' || gameState === 'gameover') {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        paddingBottom: 40,
        pointerEvents: 'none',
        zIndex: 10,
      }}>
        <div
          onTouchStart={e => { e.preventDefault(); onStart(); }}
          onMouseDown={e => { e.preventDefault(); onStart(); }}
          style={{
            ...BTN.base,
            pointerEvents: 'all',
            width: 220,
            height: 60,
            fontSize: '11px',
            background: 'rgba(0,255,255,0.15)',
            borderColor: '#00ffff',
            color: '#00ffff',
            boxShadow: '0 0 20px #00ffff66',
            letterSpacing: '1px',
          }}
        >
          НАЧАТЬ ИГРУ
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      pointerEvents: 'none',
      zIndex: 10,
    }}>
      {/* D-pad — left bottom */}
      <div style={{
        position: 'absolute',
        left: 20,
        bottom: 28,
        pointerEvents: 'all',
        display: 'grid',
        gridTemplateColumns: '56px 56px 56px',
        gridTemplateRows: '56px 56px 56px',
        gap: 4,
      }}>
        {/* Row 1 */}
        <div />
        <DpadBtn label="▲" keyName="ArrowUp" onSetKey={onSetKey} />
        <div />
        {/* Row 2 */}
        <DpadBtn label="◀" keyName="ArrowLeft" onSetKey={onSetKey} />
        <div style={{
          width: 56, height: 56,
          background: 'rgba(0,255,255,0.04)',
          border: '2px solid #00ffff22',
          borderRadius: 6,
        }} />
        <DpadBtn label="▶" keyName="ArrowRight" onSetKey={onSetKey} />
        {/* Row 3 */}
        <div />
        <DpadBtn label="▼" keyName="ArrowDown" onSetKey={onSetKey} />
        <div />
      </div>

      {/* Action buttons — right bottom */}
      <div style={{
        position: 'absolute',
        right: 20,
        bottom: 28,
        pointerEvents: 'all',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 12,
      }}>
        <ActionBtn
          label={'СМЕНА\nОРУЖИЯ'}
          color="#ffff00"
          size={60}
          onPress={onSwitchWeapon}
        />
        <ActionBtn
          label="ОГОНЬ"
          color="#ff00ff"
          size={76}
          onPress={onShoot}
        />
      </div>
    </div>
  );
}
