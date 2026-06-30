import { useState } from 'react';
import { useAppContext } from '../../../Context';

const STATUS_COLORS = {
  great:       '#4caf82',
  good:        '#c9a84c',
  distant:     '#8888a0',
  strained:    '#d4a017',
  complicated: '#e05c5c',
};

const STATUSES = ['good', 'great', 'distant', 'strained', 'complicated'];

function formatBirthday(dateStr) {
  if (!dateStr) return null;
  const [, m, d] = dateStr.split('-').map(Number);
  return new Date(2000, m - 1, d).toLocaleDateString('default', { month: 'long', day: 'numeric' });
}

const EMPTY_PLANS = { date: '', description: '' };

function RelationCard({ relation, onDelete, onEdit }) {
  const { addCalendarEvent } = useAppContext();
  const [plansOpen, setPlansOpen] = useState(false);
  const [editing, setEditing]     = useState(false);
  const [plans, setPlans]         = useState(EMPTY_PLANS);
  const [error, setError]         = useState('');
  const [editForm, setEditForm]   = useState({
    name:               relation.name,
    birthday:           relation.birthday || '',
    favorites:          (relation.favorites || []).join(', '),
    relationshipStatus: relation.relationshipStatus || 'good',
  });

  const statusColor = STATUS_COLORS[relation.relationshipStatus] ?? STATUS_COLORS.good;

  function handleMakePlans(e) {
    e.preventDefault();
    if (!plans.date) { setError('A date is required.'); return; }
    addCalendarEvent({
      title:       `Plans with ${relation.name}`,
      date:        plans.date,
      description: plans.description,
      category:    'diplomacy',
    });
    setPlans(EMPTY_PLANS);
    setError('');
    setPlansOpen(false);
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    if (!editForm.name.trim()) return;
    onEdit(relation.id, {
      name:               editForm.name.trim(),
      birthday:           editForm.birthday,
      favorites:          editForm.favorites.split(',').map(f => f.trim()).filter(Boolean),
      relationshipStatus: editForm.relationshipStatus,
    });
    setEditing(false);
  }

  if (editing) {
    return (
      <form className="relation-card relation-edit-form" style={{ '--status-color': statusColor }} onSubmit={handleSaveEdit}>
        <div className="relation-card-header">
          <input className="dashboard-input goal-edit-input" type="text" placeholder="Name" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} autoFocus />
          <input className="dashboard-input dashboard-input--date goal-edit-input" type="date" title="Birthday" value={editForm.birthday} onChange={e => setEditForm(f => ({ ...f, birthday: e.target.value }))} />
          <input className="dashboard-input goal-edit-input" type="text" placeholder="Favorites (comma-separated)" value={editForm.favorites} onChange={e => setEditForm(f => ({ ...f, favorites: e.target.value }))} />
          <select className="dashboard-input goal-edit-input" value={editForm.relationshipStatus} onChange={e => setEditForm(f => ({ ...f, relationshipStatus: e.target.value }))}>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <button className="dashboard-add-btn" type="submit">Save</button>
          <button className="dashboard-back" type="button" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div className="relation-card" style={{ '--status-color': statusColor }}>

      <div className="relation-card-header">
        <span className="relation-status-dot" />
        <h3 className="relation-card-name">{relation.name}</h3>
        <div className="relation-status-row">
          <span className="relation-status-label">{relation.relationshipStatus}</span>
        </div>
        {relation.birthday && (
          <span className="relation-birthday">🎂 {formatBirthday(relation.birthday)}</span>
        )}
        {relation.favorites?.length > 0 && (
          <div className="relation-favorites">
            {relation.favorites.map((f, i) => (
              <span key={i} className="relation-favorite-tag">{f}</span>
            ))}
          </div>
        )}
        <button className="goal-edit-btn" onClick={() => setEditing(true)} title="Edit">✎</button>
        <button className="relation-plans-btn" onClick={() => { setPlansOpen(v => !v); setError(''); }}>
          {plansOpen ? 'Cancel' : 'Make Plans'}
        </button>
        <button className="relation-card-delete" onClick={onDelete} title="Remove">✕</button>
      </div>

      {plansOpen && (
        <form className="relation-plans-form" onSubmit={handleMakePlans}>
          <input className="relation-plans-input" type="date" value={plans.date} onChange={e => setPlans(p => ({ ...p, date: e.target.value }))} />
          <input className="relation-plans-input" type="text" placeholder="Activity or description (optional)" value={plans.description} onChange={e => setPlans(p => ({ ...p, description: e.target.value }))} />
          {error && <p className="relation-plans-error">{error}</p>}
          <button className="relation-plans-submit" type="submit">Add to Calendar</button>
        </form>
      )}

    </div>
  );
}

export default RelationCard;
