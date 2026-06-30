import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../../Context';
import coachJaydin from './coachJaydin.png';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const GOAL_SUBCATEGORIES = [
  { id: 'fitness', label: 'Fitness', color: '#4caf82' },
];

const TIME_RANGES = [
  { value: '7days', label: 'Last 7 Days' },
  { value: 'month', label: 'Last Month'  },
  { value: 'year',  label: 'Last Year'   },
];

const GRAPH_OPTIONS = [
  { id: 'mental-mood',        label: 'Mental Health', color: '#9b6bd4', mode: 'avg',   unit: 'mood (1–5)' },
  { id: 'fitness',            label: 'Fitness',       color: '#4caf82', mode: 'count', unit: 'goals'      },
  { id: 'nutrition-water',    label: 'Water',         color: '#5b8de8', mode: 'sum',   unit: 'oz'         },
  { id: 'nutrition-calories', label: 'Calories',      color: '#d4a017', mode: 'sum',   unit: 'cal'        },
];

const EMPTY_GOAL = { title: '', description: '', date: '', subcategory: 'fitness' };
const EMPTY_LOG  = { note: '', date: '' };

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDate(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('default', { month: 'short', day: 'numeric' });
}

function buildChartData(events, graphOptionId, timeRange) {
  const opt      = GRAPH_OPTIONS.find(o => o.id === graphOptionId);
  const today    = new Date();
  today.setHours(0, 0, 0, 0);
  const filtered = events.filter(e => e.category === 'health' && e.subcategory === graphOptionId);

  function aggregate(subset) {
    if (opt?.mode === 'count') return subset.length;
    if (opt?.mode === 'sum')   return subset.reduce((s, e) => s + (Number(e.value) || 0), 0);
    if (opt?.mode === 'avg') {
      if (!subset.length) return 0;
      const total = subset.reduce((s, e) => s + (Number(e.value) || 0), 0);
      return Math.round((total / subset.length) * 10) / 10;
    }
    return 0;
  }

  if (timeRange === '7days') {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      return { label: d.toLocaleDateString('default', { weekday: 'short' }), value: aggregate(filtered.filter(e => e.date === key)) };
    });
  }
  if (timeRange === 'month') {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (29 - i));
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      return { label: d.toLocaleDateString('default', { month: 'short', day: 'numeric' }), value: aggregate(filtered.filter(e => e.date === key)) };
    });
  }
  if (timeRange === 'year') {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1);
      const prefix = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      return { label: d.toLocaleDateString('default', { month: 'short' }), value: aggregate(filtered.filter(e => e.date.startsWith(prefix))) };
    });
  }
  return [];
}

// ── Goal Item (editable) ──────────────────────────────────────────
function GoalItem({ item, color, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: item.title, date: item.date, description: item.description || '' });

  function handleSave(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onEdit(item.id, { title: form.title.trim(), date: form.date, description: form.description });
    setEditing(false);
  }

  if (editing) {
    return (
      <form className="dashboard-item goal-edit-form" style={{ '--advisor-color': color }} onSubmit={handleSave}>
        <input className="dashboard-input goal-edit-input" type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
        <input className="dashboard-input dashboard-input--date goal-edit-input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        <input className="dashboard-input goal-edit-input" type="text" placeholder="Notes (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <div className="goal-edit-actions">
          <button className="dashboard-add-btn" type="submit">Save</button>
          <button className="dashboard-back" type="button" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div className="dashboard-item" style={{ '--advisor-color': color }}>
      <div className="dashboard-item-body">
        <span className="dashboard-item-title">{item.title}</span>
        <span className="dashboard-item-date">{formatDate(item.date)}</span>
        {item.description && <span className="dashboard-item-desc">{item.description}</span>}
      </div>
      <div className="goal-item-actions">
        <button className="goal-edit-btn" onClick={() => setEditing(true)} title="Edit">✎</button>
        <button className="dashboard-item-delete" onClick={() => onDelete(item.id)} title="Remove">✕</button>
      </div>
    </div>
  );
}

function GoalList({ subcategoryId, goals, onDelete, onEdit }) {
  const config = GOAL_SUBCATEGORIES.find(s => s.id === subcategoryId);
  return goals.length === 0
    ? <p className="dashboard-panel-placeholder">No goals yet.</p>
    : goals.map(item => (
        <GoalItem key={item.id} item={item} color={config?.color} onDelete={onDelete} onEdit={onEdit} />
      ));
}

// ── Fitness Panel (with inline add) ──────────────────────────────
const EMPTY_FITNESS = { title: '', date: '', description: '' };

function FitnessPanel({ goals, onAdd, onDelete, onEdit }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FITNESS);
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) { setError('A title is required.'); return; }
    if (!form.date)         { setError('A date is required.'); return; }
    onAdd({ ...form, title: form.title.trim(), category: 'health', subcategory: 'fitness' });
    setForm(EMPTY_FITNESS);
    setError('');
    setOpen(false);
  }

  return (
    <div className="fitness-panel">
      <button
        className="fitness-add-btn"
        onClick={() => { setOpen(v => !v); setError(''); }}
      >
        {open ? '✕ Cancel' : '+ Add Goal'}
      </button>

      {open && (
        <form className="fitness-inline-form" onSubmit={handleSubmit}>
          <input
            className="dashboard-input"
            type="text"
            placeholder="Goal title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            autoFocus
          />
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
          {error && <p className="dashboard-error">{error}</p>}
          <button className="dashboard-add-btn" type="submit">Add</button>
        </form>
      )}

      <GoalList
        subcategoryId="fitness"
        goals={goals}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    </div>
  );
}

// ── Mood Tracker ─────────────────────────────────────────────────
const MOOD_OPTIONS = [
  { value: 1, label: 'Bad',   color: '#c44040' },
  { value: 2, label: 'Poor',  color: '#d4720a' },
  { value: 3, label: 'Okay',  color: '#c9a84c' },
  { value: 4, label: 'Good',  color: '#6ab04c' },
  { value: 5, label: 'Great', color: '#4caf82' },
];

function MoodTracker({ date, events, onAdd, onEdit }) {
  const dateEntry = events
    .filter(e => e.subcategory === 'mental-mood' && e.date === date)
    .sort((a, b) => b.id.localeCompare(a.id))[0];
  const selected = dateEntry?.value ?? null;

  const recent = events
    .filter(e => e.subcategory === 'mental-mood')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  function handleSelect(value) {
    if (dateEntry) {
      onEdit(dateEntry.id, { value });
    } else {
      onAdd({ title: 'Mood check-in', value, date, description: '', category: 'health', subcategory: 'mental-mood' });
    }
  }

  return (
    <div className="mood-tracker">
      <p className="mood-question">How are you feeling today?</p>
      <div className="mood-scale">
        {MOOD_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`mood-btn${selected === opt.value ? ' mood-btn--selected' : ''}`}
            style={{ '--mood-color': opt.color }}
            onClick={() => handleSelect(opt.value)}
            title={opt.label}
          >
            <span className="mood-btn-number">{opt.value}</span>
            <span className="mood-btn-label">{opt.label}</span>
          </button>
        ))}
      </div>
      <div className="mood-scale-legend">
        <span>1 = Bad</span>
        <span>5 = Good</span>
      </div>

      {recent.length > 0 && (
        <div className="mood-history">
          {recent.map(entry => {
            const opt = MOOD_OPTIONS.find(o => o.value === entry.value);
            return (
              <div key={entry.id} className="mood-history-row" style={{ '--mood-color': opt?.color }}>
                <span className="mood-history-date">{entry.date === date ? 'Selected' : formatDate(entry.date)}</span>
                <span className="mood-history-bar-wrap">
                  <span className="mood-history-bar" style={{ width: `${(entry.value / 5) * 100}%` }} />
                </span>
                <span className="mood-history-value">{entry.value} — {opt?.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Nutrition Tracker (Water / Calories) ─────────────────────────
function NutritionTracker({ label, icon, subcategory, unit, target, onTargetChange, events, onAdd, onDelete, date }) {
  const [editingTarget, setEditingTarget] = useState(false);
  const [tempTarget, setTempTarget]       = useState(String(target));
  const [amount, setAmount]               = useState('');

  const dateEntries = events.filter(e => e.subcategory === subcategory && e.date === date);
  const dateTotal   = dateEntries.reduce((sum, e) => sum + (Number(e.value) || 0), 0);
  const progress    = Math.min(100, target > 0 ? (dateTotal / target) * 100 : 0);
  const met         = dateTotal >= target && target > 0;

  function handleSaveTarget() {
    const n = Number(tempTarget);
    if (n > 0) onTargetChange(n);
    setEditingTarget(false);
  }

  function handleLog(e) {
    e.preventDefault();
    const n = Number(amount);
    if (!n || n <= 0) return;
    onAdd({ title: `${label} intake`, value: n, date, description: '', category: 'health', subcategory });
    setAmount('');
  }

  return (
    <div className="nutrition-tracker">
      <div className="nutrition-tracker-header">
        <span className="nutrition-tracker-icon">{icon}</span>
        <span className="nutrition-tracker-label">{label}</span>
        <div className="nutrition-tracker-goal">
          {editingTarget ? (
            <>
              <input
                className="nutrition-target-input"
                type="number"
                min="1"
                value={tempTarget}
                onChange={e => setTempTarget(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveTarget()}
                autoFocus
              />
              <span className="nutrition-unit">{unit}</span>
              <button className="nutrition-target-save" onClick={handleSaveTarget}>✓</button>
            </>
          ) : (
            <>
              <span className="nutrition-target-value">Goal: {target} {unit}</span>
              <button className="goal-edit-btn" onClick={() => { setTempTarget(String(target)); setEditingTarget(true); }} title="Edit goal">✎</button>
            </>
          )}
        </div>
      </div>

      <div className="nutrition-progress-bar">
        <div className="nutrition-progress-fill" style={{ width: `${progress}%`, background: met ? '#4caf82' : '#d4a017' }} />
      </div>
      <p className="nutrition-progress-label">
        {dateTotal} / {target} {unit}{met ? ' ✓' : ''}
      </p>

      <form className="nutrition-log-form" onSubmit={handleLog}>
        <input
          className="dashboard-input nutrition-amount-input"
          type="number"
          min="1"
          placeholder={`Add ${unit}`}
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <button className="dashboard-add-btn" type="submit">Log</button>
      </form>

      <div className="nutrition-entries">
        {dateEntries.map(entry => (
          <div key={entry.id} className="nutrition-entry">
            <span className="nutrition-entry-amount">{entry.value} {unit}</span>
            <button className="dashboard-item-delete" onClick={() => onDelete(entry.id)} title="Remove">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────
function HealthDashboard() {
  const navigate = useNavigate();
  const { calendarEvents, addCalendarEvent, editCalendarEvent, deleteCalendarEvent } = useAppContext();

  const [activeDate, setActiveDate] = useState(todayKey());
  const [logNote, setLogNote]       = useState('');
  const [logError, setLogError]             = useState('');
  const [graphSubcat, setGraphSubcat]       = useState('fitness');
  const [timeRange, setTimeRange]           = useState('7days');
  const [nutritionTargets, setNutritionTargets] = useState({ water: 64, calories: 2000 });

  const healthGoals = calendarEvents.filter(e => e.category === 'health');
  const logEntries  = calendarEvents
    .filter(e => e.category === 'health' && e.subcategory === 'log')
    .sort((a, b) => b.date.localeCompare(a.date));

  function goalsBySubcat(id) {
    return healthGoals.filter(e => e.subcategory === id).sort((a, b) => a.date.localeCompare(b.date));
  }

  function setNutritionTarget(type, value) {
    setNutritionTargets(t => ({ ...t, [type]: value }));
  }

  function handleAddLog(e) {
    e.preventDefault();
    if (!logNote.trim()) { setLogError('An entry is required.'); return; }
    addCalendarEvent({ title: logNote.trim(), date: activeDate, description: '', category: 'health', subcategory: 'log' });
    setLogNote('');
    setLogError('');
  }

  const chartData   = buildChartData(healthGoals, graphSubcat, timeRange);
  const graphConfig = GRAPH_OPTIONS.find(o => o.id === graphSubcat);

  return (
    <div className="dashboard-page" style={{ '--advisor-color': '#4caf82' }}>
      <img src={coachJaydin} alt="" className="health-coach-img" />

      <div className="dashboard-header">
        <button className="dashboard-back" onClick={() => navigate('/council')}>← Council</button>
        <h1 className="dashboard-title">Coach Jaydin - Health Advisor</h1>
      </div>

      <div className="health-date-bar">
        <label className="health-date-label" htmlFor="health-date">Date</label>
        <input
          id="health-date"
          className="dashboard-input dashboard-input--date"
          type="date"
          value={activeDate}
          onChange={e => setActiveDate(e.target.value)}
        />
        <button
          className="dashboard-back"
          onClick={() => setActiveDate(todayKey())}
        >Today</button>
      </div>

      <div className="health-layout">
        <div className="dashboard-box dashboard-box--health">

          {/* Mental Health panel — mood survey */}
          <div className="dashboard-panel" style={{ '--panel-color': '#9b6bd4' }}>
            <div className="dashboard-panel-heading health-panel-heading">
              <span className="health-panel-dot" />
              Mental Health
            </div>
            <div className="dashboard-panel-content">
              <MoodTracker
                date={activeDate}
                events={healthGoals}
                onAdd={addCalendarEvent}
                onEdit={editCalendarEvent}
              />
            </div>
          </div>

          {/* Fitness panel */}
          <div className="dashboard-panel" style={{ '--panel-color': '#4caf82' }}>
            <div className="dashboard-panel-heading health-panel-heading">
              <span className="health-panel-dot" />
              Fitness
            </div>
            <div className="dashboard-panel-content">
              <FitnessPanel
                goals={goalsBySubcat('fitness')}
                onAdd={addCalendarEvent}
                onDelete={deleteCalendarEvent}
                onEdit={editCalendarEvent}
              />
            </div>
          </div>

          {/* Nutrition panel */}
          <div className="dashboard-panel" style={{ '--panel-color': '#d4a017' }}>
            <div className="dashboard-panel-heading health-panel-heading">
              <span className="health-panel-dot" />
              Nutrition
            </div>
            <div className="dashboard-panel-content">
              <NutritionTracker
                label="Water"
                icon="💧"
                subcategory="nutrition-water"
                unit="oz"
                target={nutritionTargets.water}
                onTargetChange={v => setNutritionTarget('water', v)}
                events={healthGoals}
                onAdd={addCalendarEvent}
                onDelete={deleteCalendarEvent}
                date={activeDate}
              />
              <div className="nutrition-divider" />
              <NutritionTracker
                label="Calories"
                icon="🔥"
                subcategory="nutrition-calories"
                unit="cal"
                target={nutritionTargets.calories}
                onTargetChange={v => setNutritionTarget('calories', v)}
                events={healthGoals}
                onAdd={addCalendarEvent}
                onDelete={deleteCalendarEvent}
                date={activeDate}
              />
            </div>
          </div>

          {/* Daily Log panel */}
          <div className="dashboard-panel">
            <div className="dashboard-panel-heading">Daily Log</div>
            <div className="dashboard-panel-content">
              <form className="health-log-form" onSubmit={handleAddLog}>
                <textarea
                  className="health-log-textarea"
                  placeholder="Log an entry..."
                  value={logNote}
                  onChange={e => setLogNote(e.target.value)}
                  rows={3}
                />
                <button className="dashboard-add-btn" type="submit">Log</button>
                {logError && <p className="dashboard-error">{logError}</p>}
              </form>
              <div className="health-log-entries">
                {logEntries.map(entry => (
                  <div key={entry.id} className="health-log-entry">
                    <span className="health-log-entry-date">{formatDate(entry.date)}</span>
                    <span className="health-log-entry-text">{entry.title}</span>
                    <button className="dashboard-item-delete" onClick={() => deleteCalendarEvent(entry.id)} title="Remove">✕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Graph sidebar */}
        <div className="health-graph-sidebar">
          <div className="dashboard-panel-heading">Trends — {graphConfig?.unit}</div>
          <div className="dashboard-panel-content health-graph-content">
            <div className="health-graph-controls">
              <select className="health-graph-select" value={graphSubcat} onChange={e => setGraphSubcat(e.target.value)}>
                {GRAPH_OPTIONS.map(o => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
              <select className="health-graph-select" value={timeRange} onChange={e => setTimeRange(e.target.value)}>
                {TIME_RANGES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="health-graph-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 24, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3d3020" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#6b6250', fontSize: 10, fontFamily: 'Cinzel, serif' }}
                    interval={timeRange === 'month' ? 4 : 0}
                    angle={timeRange === 'month' ? -35 : 0}
                    textAnchor={timeRange === 'month' ? 'end' : 'middle'}
                  />
                  <YAxis allowDecimals={graphConfig?.mode === 'avg'} tick={{ fill: '#6b6250', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      background: '#1e1810',
                      border: '1px solid #6b5228',
                      borderRadius: '4px',
                      color: '#e8dfc0',
                      fontFamily: 'Lora, serif',
                      fontSize: '0.8rem',
                    }}
                    cursor={{ fill: 'rgba(201,168,76,0.08)' }}
                  />
                  <Bar dataKey="value" fill={graphConfig?.color} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default HealthDashboard;
