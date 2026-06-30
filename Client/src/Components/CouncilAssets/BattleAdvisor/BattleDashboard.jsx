import { useState, useEffect } from 'react';

function readLS(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}

function formatMin(min) {
  if (min <= 30) return `${min} min`;
  const hrs = parseFloat((min / 60).toFixed(1));
  return `${hrs} ${hrs === 1 ? 'hr' : 'hrs'}`;
}
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../../Context';
import generalRoman from './generalRoman.png';
import BattleHexGrid from './BattleHexGrid';
import BattleDialog from './BattleDialog';

const DIFFICULTIES = ['Minion', 'Captain', 'Champion', 'Commander', 'General', 'Overlord', 'Prophet', 'Emperor', 'God'];

const DEPLOY_BTN_PARTICLES = Array.from({ length: 44 }, (_, i) => ({
  id:    i,
  sx:    (i % 9 - 4) * 9,
  sdx:   20 + (i % 10) * 12,
  sdy:   90 + (i % 6) * 25,
  size:  1 + (i % 3),
  delay: (-((i / 44) * 0.9)).toFixed(2),
  dur:   (1.0 + (i % 4) * 0.25).toFixed(2),
}));

const DIFFICULTY_COLORS = {
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

const DIFFICULTY_MIN = {
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

const EMPTY_FORM = { title: '', description: '', date: '', difficulty: 'Minion' };

function formatDate(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('default', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

function BattleEnemyItem({ item, onEdit, onDelete, slaying = false, currentHp, maxHp, onExpand, onCollapse }) {
  const [expanded, setExpanded] = useState(false);
  const [editing,  setEditing]  = useState(false);
  const [form, setForm] = useState({
    title:       item.title,
    difficulty:  item.difficulty ?? 'Minion',
    date:        item.date,
    description: item.description || '',
  });

  const diffColor = DIFFICULTY_COLORS[form.difficulty] ?? DIFFICULTY_COLORS.Minion;

  function handleSave(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onEdit(item.id, { title: form.title.trim(), difficulty: form.difficulty, date: form.date, description: form.description });
    setEditing(false);
    setExpanded(false);
  }

  const itemDiffColor = DIFFICULTY_COLORS[item.difficulty] ?? DIFFICULTY_COLORS.Minion;

  if (slaying) {
    return (
      <div className="dashboard-item battle-enemy-item battle-enemy-item--slaying" style={{ '--diff-color': itemDiffColor }}>
        <div className="battle-enemy-summary">
          <span className="dashboard-item-title">{item.title}</span>
          <span className="battle-slay-label">SLAIN!</span>
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <form className="dashboard-item goal-edit-form" style={{ '--advisor-color': '#e05c5c' }} onSubmit={handleSave}>
        <input className="dashboard-input goal-edit-input" type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
        <select
          className="dashboard-input dashboard-input--difficulty goal-edit-input"
          value={form.difficulty}
          onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
          style={{ '--diff-color': diffColor }}
        >
          {DIFFICULTIES.map(d => <option key={d} value={d}>{d} ({formatMin(DIFFICULTY_MIN[d])})</option>)}
        </select>
        <input className="dashboard-input dashboard-input--date goal-edit-input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        <input className="dashboard-input goal-edit-input" type="text" placeholder="Notes (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <div className="goal-edit-actions">
          <button className="dashboard-add-btn" type="submit">Save</button>
          <button className="dashboard-back" type="button" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </form>
    );
  }

  function toggleExpanded() {
    const next = !expanded;
    setExpanded(next);
    if (next) onExpand?.(item.id);
    else onCollapse?.();
  }

  const displayHp  = currentHp ?? maxHp;
  const hpIsDamaged = displayHp !== undefined && maxHp !== undefined && displayHp < maxHp;

  return (
    <div
      className={`dashboard-item battle-enemy-item${expanded ? ' battle-enemy-item--expanded' : ''}`}
      style={{ '--diff-color': itemDiffColor }}
      onClick={toggleExpanded}
    >
      <div className="battle-enemy-summary">
        <span className="dashboard-item-title">{item.title}</span>
        <span className="battle-difficulty-badge">{item.difficulty ?? 'Minion'}</span>
        <span className="battle-min-badge">{formatMin(DIFFICULTY_MIN[item.difficulty ?? 'Minion'])}</span>
      </div>
      {expanded && (
        <div className="battle-enemy-details" onClick={e => e.stopPropagation()}>
          {displayHp !== undefined && (
            <span className={`battle-enemy-hp${hpIsDamaged ? ' battle-enemy-hp--damaged' : ''}`}>
              {formatMin(displayHp)} / {formatMin(maxHp)} remaining
            </span>
          )}
          <span className="dashboard-item-date">{formatDate(item.date)}</span>
          {item.description && <span className="dashboard-item-desc">{item.description}</span>}
          <div className="goal-item-actions">
            <button className="goal-edit-btn" onClick={() => { setEditing(true); onCollapse?.(); }} title="Edit">✎</button>
            <button className="dashboard-item-delete" onClick={() => onDelete(item.id)} title="Remove">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

function BattleDashboard() {
  const navigate = useNavigate();
  const { calendarEvents, addCalendarEvent, editCalendarEvent, deleteCalendarEvent, slayCalendarEvent } = useAppContext();
  const [form, setForm]         = useState(EMPTY_FORM);
  const [error, setError]       = useState('');
  const [showDialog, setShowDialog]             = useState(false);
  const [hasDeployed, setHasDeployed]           = useState(() => readLS('battle_hasDeployed', false));
  const [savedHours, setSavedHours]             = useState(() => readLS('battle_savedHours', { sleep: 0, work: 0, school: 0, commute: 0 }));
  const [spriteCount, setSpriteCount]           = useState(() => readLS('battle_spriteCount', 0));
  const [sleepSpriteCount, setSleepSpriteCount] = useState(() => readLS('battle_sleepSpriteCount', 0));
  const [deployId, setDeployId]                 = useState(() => readLS('battle_deployId', 0));
  const [slayingIds, setSlayingIds]             = useState(new Set());
  const [enemyHpSnapshot, setEnemyHpSnapshot]   = useState({});
  const [highlightedEnemyId, setHighlightedEnemyId] = useState(null);

  useEffect(() => { localStorage.setItem('battle_hasDeployed',    JSON.stringify(hasDeployed));    }, [hasDeployed]);
  useEffect(() => { localStorage.setItem('battle_savedHours',     JSON.stringify(savedHours));     }, [savedHours]);
  useEffect(() => { localStorage.setItem('battle_spriteCount',    JSON.stringify(spriteCount));    }, [spriteCount]);
  useEffect(() => { localStorage.setItem('battle_sleepSpriteCount', JSON.stringify(sleepSpriteCount)); }, [sleepSpriteCount]);
  useEffect(() => { localStorage.setItem('battle_deployId',       JSON.stringify(deployId));       }, [deployId]);

  function handleDeploy({ sprites, sleepSprites, hours }) {
    setSpriteCount(sprites);
    setSleepSpriteCount(sleepSprites);
    setSavedHours(hours);
    setHasDeployed(true);
    setDeployId(prev => prev + 1);
    setShowDialog(false);
  }

  function handleReset() {
    setSpriteCount(0);
    setSleepSpriteCount(0);
    setHasDeployed(false);
    setDeployId(prev => prev + 1);
    setShowDialog(false);
  }

  function handleSlay(enemyId) {
    setSlayingIds(prev => new Set([...prev, enemyId]));
    setTimeout(() => {
      slayCalendarEvent(enemyId);
      setSlayingIds(prev => { const n = new Set(prev); n.delete(enemyId); return n; });
    }, 1800);
  }

  const enemies = calendarEvents
    .filter(e => e.category === 'battle')
    .sort((a, b) => a.date.localeCompare(b.date));

  function handleAdd(e) {
    e.preventDefault();
    if (!form.title.trim()) { setError('A name is required.'); return; }
    if (!form.date)         { setError('A date is required.'); return; }
    addCalendarEvent({ ...form, title: form.title.trim(), category: 'battle' });
    setForm(EMPTY_FORM);
    setError('');
  }

  return (
    <div className="dashboard-page" style={{ '--advisor-color': '#e05c5c' }}>
      <img src={generalRoman} alt="" className="battle-general-img" />

      <div className="dashboard-header">
        <button className="dashboard-back" onClick={() => navigate('/council')}>← Council</button>
        <h1 className="dashboard-title">General Roman - Battle Advisor</h1>
      </div>

      <form className="dashboard-form" onSubmit={handleAdd}>
        <h2 className="dashboard-form-heading">Add Enemy</h2>
        <div className="dashboard-form-row">
          <input
            className="dashboard-input"
            type="text"
            placeholder="Task"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
          <select
            className="dashboard-input dashboard-input--difficulty"
            value={form.difficulty}
            onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
            style={{ '--diff-color': DIFFICULTY_COLORS[form.difficulty] }}
          >
            {DIFFICULTIES.map(d => (
              <option key={d} value={d}>{d} ({formatMin(DIFFICULTY_MIN[d])})</option>
            ))}
          </select>
          <input
            className="dashboard-input dashboard-input--date"
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          />
          <input
            className="dashboard-input"
            type="text"
            placeholder="Notes (optional)"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <button className="dashboard-add-btn" type="submit">Add</button>
        </div>
        {error && <p className="dashboard-error">{error}</p>}
      </form>

      <div className="dashboard-box dashboard-box--standard">

        <div className="dashboard-panel">
          <div className="dashboard-panel-heading">Enemies</div>
          <div className="dashboard-panel-content">
            {enemies.length === 0 ? (
              <p className="dashboard-panel-placeholder">No enemies logged yet.</p>
            ) : (
              enemies.map(item => (
                <BattleEnemyItem
                  key={item.id}
                  item={item}
                  onEdit={editCalendarEvent}
                  onDelete={deleteCalendarEvent}
                  slaying={slayingIds.has(item.id)}
                  maxHp={DIFFICULTY_MIN[item.difficulty ?? 'Minion']}
                  currentHp={enemyHpSnapshot[item.id] !== undefined ? enemyHpSnapshot[item.id] : DIFFICULTY_MIN[item.difficulty ?? 'Minion']}
                  onExpand={id => setHighlightedEnemyId(id)}
                  onCollapse={() => setHighlightedEnemyId(null)}
                />
              ))
            )}
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-heading battle-panel-heading">
            Battlefield Map
            <div className="sprite-btn-fx">
              {DEPLOY_BTN_PARTICLES.map(p => (
                <span key={p.id} className="sprite-btn-particle" style={{
                  '--sx':  `${p.sx}px`,
                  '--sdx': `${p.sdx}px`,
                  '--sdy': `${p.sdy}px`,
                  width:   `${p.size}px`,
                  height:  `${p.size}px`,
                  animationDelay:    `${p.delay}s`,
                  animationDuration: `${p.dur}s`,
                }} />
              ))}
              <button className="battle-panel-btn" onClick={() => setShowDialog(true)}>
                {hasDeployed ? 'Review Sprites' : 'Deploy Sprites'}
              </button>
            </div>
          </div>
          <div className="dashboard-panel-content dashboard-panel-content--flush">
            <BattleHexGrid
              enemies={enemies}
              spriteCount={spriteCount}
              sleepSpriteCount={sleepSpriteCount}
              deployId={deployId}
              onSlay={handleSlay}
              onHpChange={setEnemyHpSnapshot}
              highlightedEnemyId={highlightedEnemyId}
            />
          </div>
        </div>

      </div>

      {showDialog && (
        <BattleDialog
          initialHours={savedHours}
          isReview={hasDeployed}
          onDeploy={handleDeploy}
          onReset={handleReset}
          onClose={() => setShowDialog(false)}
        />
      )}

    </div>
  );
}

export default BattleDashboard;
