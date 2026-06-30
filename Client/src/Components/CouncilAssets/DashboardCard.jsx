import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext, CATEGORIES } from '../../Context';

const EMPTY_FORM = { title: '', description: '', date: '' };

function formatDate(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('default', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

function DashboardItem({ item, advisorColor, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title:       item.title,
    date:        item.date,
    description: item.description || '',
  });

  function handleSave(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onEdit(item.id, { title: form.title.trim(), date: form.date, description: form.description });
    setEditing(false);
  }

  if (editing) {
    return (
      <form className="dashboard-item goal-edit-form" style={{ '--advisor-color': advisorColor }} onSubmit={handleSave}>
        <input className="dashboard-input goal-edit-input" type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
        <input className="dashboard-input dashboard-input--date goal-edit-input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        <input className="dashboard-input goal-edit-input" type="text" placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <div className="goal-edit-actions">
          <button className="dashboard-add-btn" type="submit">Save</button>
          <button className="dashboard-back" type="button" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div className="dashboard-item" style={{ '--advisor-color': advisorColor }}>
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

function DashboardCard({ category, image, namePrefix }) {
  const navigate = useNavigate();
  const { calendarEvents, addCalendarEvent, editCalendarEvent, deleteCalendarEvent } = useAppContext();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const config = CATEGORIES.find(c => c.id === category);
  const items = calendarEvents
    .filter(e => e.category === category)
    .sort((a, b) => a.date.localeCompare(b.date));

  function handleAdd(e) {
    e.preventDefault();
    if (!form.title.trim()) { setError('A title is required.'); return; }
    if (!form.date)         { setError('A date is required.'); return; }
    addCalendarEvent({ ...form, title: form.title.trim(), category });
    setForm(EMPTY_FORM);
    setError('');
  }

  return (
    <div className="dashboard-page" style={{ '--advisor-color': config?.color }}>
      {image && <img src={image} alt="" className="advisor-char-img" />}

      <div className="dashboard-header">
        <button className="dashboard-back" onClick={() => navigate('/council')}>← Council</button>
        <h1 className="dashboard-title">{namePrefix ? `${namePrefix} - ` : ''}{config?.label} Advisor</h1>
      </div>

      <form className="dashboard-form" onSubmit={handleAdd}>
        <h2 className="dashboard-form-heading">Add Event</h2>
        <div className="dashboard-form-row">
          <input className="dashboard-input" type="text" placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <input className="dashboard-input dashboard-input--date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <input className="dashboard-input" type="text" placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <button className="dashboard-add-btn" type="submit">Add</button>
        </div>
        {error && <p className="dashboard-error">{error}</p>}
      </form>

      <div className="dashboard-box dashboard-box--standard">

        <div className="dashboard-panel">
          <div className="dashboard-panel-heading">Events</div>
          <div className="dashboard-panel-content">
            {items.length === 0 ? (
              <p className="dashboard-panel-placeholder">No events yet. Add one above.</p>
            ) : (
              items.map(item => (
                <DashboardItem
                  key={item.id}
                  item={item}
                  advisorColor={config?.color}
                  onEdit={editCalendarEvent}
                  onDelete={deleteCalendarEvent}
                />
              ))
            )}
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-heading">Analytics & Suggestions</div>
          <div className="dashboard-panel-content">
            <p className="dashboard-panel-placeholder">Graphs and suggestions coming soon.</p>
          </div>
        </div>

      </div>

    </div>
  );
}

export default DashboardCard;
