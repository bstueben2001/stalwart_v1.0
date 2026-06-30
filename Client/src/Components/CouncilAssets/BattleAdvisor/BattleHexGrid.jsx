import { useState, useMemo, useEffect, useRef } from 'react';

function readLS(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}

function formatMin(min) {
  if (min <= 30) return `${min} min`;
  const hrs = parseFloat((min / 60).toFixed(1));
  return `${hrs} ${hrs === 1 ? 'hr' : 'hrs'}`;
}

const COLS = 12;
const ROWS = 7;
const S = 22;
const COL_STEP   = S * Math.sqrt(3);
const ROW_STEP   = S * 1.5;
const ROW_OFFSET = COL_STEP / 2;
const PAD = 26;

const HEX_PTS = Array.from({ length: 6 }, (_, i) => {
  const a = (Math.PI / 180) * (60 * i - 30);
  return `${(S * Math.cos(a)).toFixed(3)},${(S * Math.sin(a)).toFixed(3)}`;
}).join(' ');

const GRID_W = PAD + (COLS - 1) * COL_STEP + ROW_OFFSET + COL_STEP / 2 + 2;
const GRID_H = PAD + (ROWS - 1) * ROW_STEP + S + 4;

const DIFF_MIN = {
  Minion:    10,
  Captain:   30,
  Champion:  60,
  Commander: 180,
  General:   360,
  Overlord:  720,
  Prophet:   1440,
  Emperor:   3000,
  God:       6000,
};

const DIFF_COLORS = {
  Minion:    '#8888a0',
  Captain:   '#5b9e5b',
  Champion:  '#c9a84c',
  Commander: '#4a8fbc',
  General:   '#c87840',
  Overlord:  '#c44040',
  Prophet:   '#8844cc',
  Emperor:   '#9b6bd4',
  God:       '#ffd700',
};

const ENEMY_SLOTS = Array.from({ length: COLS - 6 }, (_, ci) => {
  const col = COLS - 1 - ci;
  return Array.from({ length: ROWS }, (_, row) => `${row},${col}`);
}).flat();

const CHAMPION_KEY = `${Math.floor(ROWS / 2)},2`;

// All sprite slots, cols 0→5 left-to-right. Sleep sprites fill first, normal sprites follow.
const SPRITE_SLOTS = Array.from({ length: 6 }, (_, ci) => {
  return Array.from({ length: ROWS }, (_, row) => `${row},${ci}`);
}).flat().filter(k => k !== CHAMPION_KEY);

function darkFill(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r * 0.22)},${Math.round(g * 0.22)},${Math.round(b * 0.22)})`;
}

const ALLY_FILL    = '#0e1f30';
const ALLY_STROKE  = '#60b8f0';
const SLEEP_FILL   = '#080e1e';
const SLEEP_STROKE = '#2a5090';
const CHAMP_FILL   = '#231000';
const CHAMP_STROKE = '#e07830';
const EMPTY_FILL   = 'rgba(14,18,38,0.5)';
const EMPTY_STROKE = '#2a3255';

const SPRITE_HEX_PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  id:       i,
  cx:       (i % 9 - 4) * 2.2,
  cy:       (i % 5 - 2) * 1.8,
  r:        0.35 + (i % 4) * 0.28,
  dx:       20 + (i % 8) * 8,
  dy:       45 + (i % 6) * 12,
  delay:    (-((i / 40) * 2.4)).toFixed(2),
  duration: (2.0 + (i % 4) * 0.4).toFixed(1),
}));

const CHAMP_HEX_PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id:       i,
  cx:       (i % 9 - 4) * 2.5,
  cy:       (i % 5 - 2) * 2.0,
  r:        0.4 + (i % 4) * 0.32,
  dx:       22 + (i % 7) * 9,
  dy:       48 + (i % 5) * 13,
  delay:    (-((i / 30) * 2.8)).toFixed(2),
  duration: (2.2 + (i % 4) * 0.45).toFixed(2),
}));

function makeInitialSpriteMap() {
  return { [CHAMPION_KEY]: { type: 'champion', min: 120, maxMin: 120 } };
}

export default function BattleHexGrid({ enemies = [], spriteCount = 0, sleepSpriteCount = 0, deployId = 0, onSlay, onHpChange, highlightedEnemyId = null }) {
  const [spriteMap,     setSpriteMap]     = useState(() => readLS('battle_spriteMap', makeInitialSpriteMap()));
  const [selected,      setSelected]      = useState(() => new Set());
  const [enemyHp,       setEnemyHp]       = useState(() => readLS('battle_enemyHp', {}));
  const [pendingAttack, setPendingAttack] = useState(null); // { enemy, keys: string[] }
  const [tooltip,       setTooltip]       = useState(null); // { enemy, x, y }
  const [hoveredHex,    setHoveredHex]    = useState(null);
  const hoverClearRef = useRef(null);

  // Only reset when deployId actually increments — not on mount or StrictMode double-invoke
  const prevDeployId = useRef(deployId);

  useEffect(() => {
    if (prevDeployId.current === deployId) return;
    prevDeployId.current = deployId;
    const next = { [CHAMPION_KEY]: { type: 'champion', min: 120, maxMin: 120 } };
    SPRITE_SLOTS.slice(0, sleepSpriteCount).forEach(key => {
      next[key] = { type: 'sleep', min: 60, maxMin: 60 };
    });
    SPRITE_SLOTS.slice(sleepSpriteCount, sleepSpriteCount + spriteCount).forEach(key => {
      next[key] = { type: 'ally', min: 60, maxMin: 60 };
    });
    setSpriteMap(next);
    setSelected(new Set());
    setPendingAttack(null);
  }, [deployId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist combat state
  useEffect(() => { localStorage.setItem('battle_spriteMap', JSON.stringify(spriteMap)); }, [spriteMap]);
  useEffect(() => { localStorage.setItem('battle_enemyHp',   JSON.stringify(enemyHp));   }, [enemyHp]);

  // Sync HP snapshot to parent for the list to display
  useEffect(() => {
    onHpChange?.(enemyHp);
  }, [enemyHp, onHpChange]);

  const enemyMap = useMemo(() => {
    const map = {};
    enemies.forEach((enemy, i) => {
      if (i < ENEMY_SLOTS.length) map[ENEMY_SLOTS[i]] = enemy;
    });
    return map;
  }, [enemies]);

  function getEnemyHp(enemy) {
    return enemyHp[enemy.id] !== undefined
      ? enemyHp[enemy.id]
      : (DIFF_MIN[enemy.difficulty] ?? 10);
  }

  function handleSpriteClick(key) {
    if (pendingAttack) return;
    if (key === CHAMPION_KEY) return;
    const sprite = spriteMap[key];
    if (!sprite || sprite.min <= 0) return;
    if (sprite.type === 'sleep') {
      const alliesRemain = Object.values(spriteMap).some(s => s.type === 'ally' && s.min > 0);
      if (alliesRemain) return;
    }
    setSelected(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function handleEnemyClick(enemy) {
    if (pendingAttack || selected.size === 0) return;
    const currentHp = getEnemyHp(enemy);
    if (currentHp <= 0) return;
    const keys = [...selected].filter(k => spriteMap[k]?.min > 0);
    if (keys.length === 0) { setSelected(new Set()); return; }
    setPendingAttack({ enemy, keys });
  }

  function executeAttack() {
    const { enemy, keys } = pendingAttack;
    const currentHp = getEnemyHp(enemy);
    const sprites = keys.map(k => ({ key: k, ...spriteMap[k] })).filter(s => s.min > 0);
    const totalMin = sprites.reduce((sum, s) => sum + s.min, 0);

    setSpriteMap(prev => {
      const next = { ...prev };
      if (totalMin >= currentHp) {
        let toPay = currentHp;
        for (const s of sprites) {
          if (toPay <= 0) break;
          if (s.min <= toPay) {
            delete next[s.key];
            toPay -= s.min;
          } else {
            next[s.key] = { ...next[s.key], min: s.min - toPay };
            toPay = 0;
          }
        }
      } else {
        sprites.forEach(s => { delete next[s.key]; });
      }
      return next;
    });

    if (totalMin >= currentHp) {
      setEnemyHp(prev => ({ ...prev, [enemy.id]: 0 }));
      onSlay?.(enemy.id);
    } else {
      setEnemyHp(prev => ({ ...prev, [enemy.id]: currentHp - totalMin }));
    }
    setPendingAttack(null);
    setSelected(new Set());
  }

  function cancelAttack() {
    setPendingAttack(null);
  }

  const hasAnything = spriteCount > 0 || sleepSpriteCount > 0;

  return (
    <div className="hex-grid-wrapper">
      {selected.size > 0 && !pendingAttack && (
        <div className="hex-grid-select-hint">
          {selected.size} sprite{selected.size !== 1 ? 's' : ''} selected
          {' · '}{formatMin([...selected].reduce((sum, k) => sum + (spriteMap[k]?.min ?? 0), 0))}
          {' · '}Select an enemy to attack
          {' · '}<button className="hex-grid-deselect" onClick={() => setSelected(new Set())}>Cancel</button>
        </div>
      )}
      <svg
        viewBox={`0 0 ${GRID_W.toFixed(1)} ${GRID_H.toFixed(1)}`}
        className="hex-grid-svg"
        preserveAspectRatio="xMidYMid meet"
        onClick={() => { if (!pendingAttack) setSelected(new Set()); }}
      >
        {Array.from({ length: ROWS }, (_, r) =>
          Array.from({ length: COLS }, (_, c) => {
            const key   = `${r},${c}`;
            const enemy = enemyMap[key];
            const x = PAD + c * COL_STEP + (r % 2 === 1 ? ROW_OFFSET : 0);
            const y = PAD + r * ROW_STEP;

            // ── Enemy hex ──
            if (enemy) {
              const currentHp = getEnemyHp(enemy);
              if (currentHp <= 0) {
                return (
                  <polygon key={key} className="hex-cell hex-cell--static" points={HEX_PTS}
                    fill={EMPTY_FILL} stroke={EMPTY_STROKE} strokeWidth="1.2"
                    transform={`translate(${x.toFixed(2)},${y.toFixed(2)})`} />
                );
              }
              const color       = DIFF_COLORS[enemy.difficulty] ?? DIFF_COLORS.Minion;
              const maxHp       = DIFF_MIN[enemy.difficulty] ?? 10;
              const isTarget    = selected.size > 0;
              const isHighlight = enemy.id === highlightedEnemyId;
              return (
                <g key={key} transform={`translate(${x.toFixed(2)},${y.toFixed(2)})`}
                  onClick={e => { e.stopPropagation(); handleEnemyClick(enemy); }}
                  onMouseEnter={e => setTooltip({ label: enemy.title, sub: `${formatMin(currentHp)} / ${formatMin(maxHp)}`, color: '#c44040', x: e.clientX, y: e.clientY })}
                  onMouseMove={e  => setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                  onMouseLeave={() => setTooltip(null)}
                  style={{ cursor: isTarget ? 'crosshair' : 'default' }}
                >
                  <polygon
                    className={`hex-cell hex-cell--enemy${isTarget ? ' hex-cell--targetable' : ''}${isHighlight ? ' hex-cell--selected' : ''}`}
                    points={HEX_PTS}
                    fill={darkFill(color)}
                    stroke={color}
                    strokeWidth="1.6"
                  />
                </g>
              );
            }

            // ── Champion hex ──
            if (key === CHAMPION_KEY) {
              const champData = spriteMap[CHAMPION_KEY];
              const champMin  = champData?.min ?? 120;
              return (
                <g key={key} transform={`translate(${x.toFixed(2)},${y.toFixed(2)})`}
                  style={{ cursor: 'not-allowed' }}
                  onMouseEnter={e => setTooltip({ label: 'Stalwart Champion', sub: `${formatMin(champMin)} / ${formatMin(120)}`, color: CHAMP_STROKE, x: e.clientX, y: e.clientY })}
                  onMouseMove={e  => setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {CHAMP_HEX_PARTICLES.map(p => (
                    <circle key={p.id} className="champ-hex-particle" r={p.r} cx={p.cx} cy={p.cy}
                      style={{ '--pdx': `${p.dx}px`, '--pdy': `${p.dy}px`, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }} />
                  ))}
                  <polygon
                    className="hex-cell"
                    points={HEX_PTS}
                    fill={CHAMP_FILL}
                    stroke={CHAMP_STROKE}
                    strokeWidth="2"
                  />
                </g>
              );
            }

            // ── Sprite hex ──
            const sprite = spriteMap[key];
            if (sprite && sprite.min > 0) {
              const isAlly     = sprite.type === 'ally';
              const isSelected = selected.has(key);
              const fill   = isAlly ? ALLY_FILL   : SLEEP_FILL;
              const stroke = isAlly ? ALLY_STROKE  : SLEEP_STROKE;
              return (
                <g key={key} transform={`translate(${x.toFixed(2)},${y.toFixed(2)})`}
                  onClick={e => { e.stopPropagation(); handleSpriteClick(key); }}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={e => { clearTimeout(hoverClearRef.current); setHoveredHex(key); setTooltip({ label: isAlly ? 'Sprite' : 'Sleep Sprite', sub: `${formatMin(sprite.min)} / ${formatMin(sprite.maxMin)}`, color: stroke, x: e.clientX, y: e.clientY }); }}
                  onMouseMove={e  => setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                  onMouseLeave={() => { hoverClearRef.current = setTimeout(() => setHoveredHex(null), 700); setTooltip(null); }}
                >
                  {(isSelected || hoveredHex === key) && SPRITE_HEX_PARTICLES.map(p => (
                    <circle key={p.id} className="sprite-hex-particle" r={p.r} cx={p.cx} cy={p.cy}
                      style={{ '--pdx': `${p.dx}px`, '--pdy': `${p.dy}px`, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }} />
                  ))}
                  <polygon
                    className={`hex-cell${isSelected ? ' hex-cell--selected-sprite' : ''}`}
                    points={HEX_PTS}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth="1.6"
                  />
                </g>
              );
            }

            // ── Empty hex ──
            return (
              <polygon key={key} className="hex-cell hex-cell--static" points={HEX_PTS}
                fill={EMPTY_FILL} stroke={EMPTY_STROKE} strokeWidth="1.2"
                transform={`translate(${x.toFixed(2)},${y.toFixed(2)})`} />
            );
          })
        )}
      </svg>
      {tooltip && (
        <div className="hex-tooltip" style={{ left: tooltip.x + 14, top: tooltip.y - 10, '--tc': tooltip.color }}>
          <span className="hex-tooltip-name">{tooltip.label}</span>
          <span className="hex-tooltip-sub">{tooltip.sub}</span>
        </div>
      )}
      {pendingAttack && (() => {
        const { enemy, keys } = pendingAttack;
        const currentHp  = getEnemyHp(enemy);
        const totalMin   = keys.reduce((sum, k) => sum + (spriteMap[k]?.min ?? 0), 0);
        const willSlay   = totalMin >= currentHp;
        return (
          <div className="hex-attack-confirm">
            <div className="hex-attack-confirm-header">
              <span className="hex-attack-confirm-title">Confirm Attack</span>
            </div>
            <div className="hex-attack-confirm-body">
              <span className="hex-attack-target">{enemy.title}</span>
              <span className="hex-attack-meta">
                {keys.length} sprite{keys.length !== 1 ? 's' : ''} · <strong>{formatMin(totalMin)}</strong> vs <strong>{formatMin(currentHp)}</strong>
              </span>
              {willSlay
                ? <span className="hex-attack-result hex-attack-result--slay">Killing blow — enemy will be slain</span>
                : <span className="hex-attack-result hex-attack-result--dmg">Enemy takes {formatMin(totalMin)} damage ({formatMin(currentHp - totalMin)} remaining)</span>
              }
            </div>
            <div className="hex-attack-confirm-actions">
              <button className="hex-attack-cancel" onClick={cancelAttack}>Cancel</button>
              <button className="hex-attack-execute" onClick={executeAttack}>Attack</button>
            </div>
          </div>
        );
      })()}
      <div className="hex-grid-footer">
        <div className="hex-grid-legend">
          <span className="hex-legend-item">
            <span className="hex-legend-swatch" style={{ background: CHAMP_STROKE }} />
            Stalwart Champion
          </span>
          <span className="hex-legend-item">
            <span className="hex-legend-swatch" style={{ background: SLEEP_STROKE }} />
            Sleep Sprites
          </span>
          <span className="hex-legend-item">
            <span className="hex-legend-swatch" style={{ background: ALLY_STROKE }} />
            Sprites
          </span>
        </div>
        {hasAnything && (
          <span className="hex-grid-hint">
            {spriteCount} sprite{spriteCount !== 1 ? 's' : ''}
            {sleepSpriteCount > 0 ? ` · ${sleepSpriteCount} sleep sprites` : ''} deployed
          </span>
        )}
      </div>
    </div>
  );
}
