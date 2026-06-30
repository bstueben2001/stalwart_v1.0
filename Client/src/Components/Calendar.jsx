import { useState } from 'react';
import { useAppContext, CATEGORIES } from '../Context';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getCategoryColor(id) {
  return CATEGORIES.find(c => c.id === id)?.color ?? '#8888a0';
}

function getCategoryLabel(id) {
  return CATEGORIES.find(c => c.id === id)?.label ?? 'General';
}

function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDisplayDate(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('default', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function generateDates(startDate, recurrence, count) {
  const [y, m, d] = startDate.split('-').map(Number);
  return Array.from({ length: count }, (_, i) => {
    const dt = new Date(y, m - 1, d);
    if (recurrence === 'daily')    dt.setDate(dt.getDate() + i);
    if (recurrence === 'weekly')   dt.setDate(dt.getDate() + i * 7);
    if (recurrence === 'biweekly') dt.setDate(dt.getDate() + i * 14);
    if (recurrence === 'monthly')  dt.setMonth(dt.getMonth() + i);
    if (recurrence === 'yearly')   dt.setFullYear(dt.getFullYear() + i);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  });
}

const EMPTY_FORM = { title: '', description: '', date: '', category: 'general' };

function Calendar() {
  const { calendarEvents: events, addCalendarEvent, editCalendarEvent, deleteCalendarEvent } = useAppContext();

  const today    = new Date();
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const [viewDate, setViewDate]               = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [modal, setModal]                     = useState(null);
  const [form, setForm]                       = useState(EMPTY_FORM);
  const [error, setError]                     = useState('');
  const [activeFilter, setActiveFilter]       = useState(null);
  const [sidebarOpen, setSidebarOpen]         = useState(true);
  const [recurrence, setRecurrence]           = useState('none');
  const [recurrenceCount, setRecurrenceCount] = useState(4);

  const { year, month } = viewDate;
  const daysInMonth     = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const monthLabel      = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

  function prevMonth() {
    setViewDate(v => {
      const d = new Date(v.year, v.month - 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function nextMonth() {
    setViewDate(v => {
      const d = new Date(v.year, v.month + 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function openAdd(dateKey) {
    setForm({ ...EMPTY_FORM, date: dateKey });
    setError('');
    setRecurrence('none');
    setRecurrenceCount(4);
    setModal({ mode: 'add' });
  }

  function openEdit(ev) {
    setForm({ title: ev.title, description: ev.description, date: ev.date, category: ev.category });
    setError('');
    setModal({ mode: 'edit', event: ev });
  }

  function closeModal() {
    setModal(null);
    setError('');
    setRecurrence('none');
    setRecurrenceCount(4);
  }

  function handleSave() {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (modal.mode === 'add') {
      const eventData = { ...form, title: form.title.trim() };
      const dates = recurrence !== 'none' ? generateDates(form.date, recurrence, recurrenceCount) : [form.date];
      dates.forEach(date => addCalendarEvent({ ...eventData, date }));
    } else {
      editCalendarEvent(modal.event.id, { ...form, title: form.title.trim() });
    }
    closeModal();
  }

  function handleDelete() {
    deleteCalendarEvent(modal.event.id);
    closeModal();
  }

  const upcomingEvents = events
    .filter(e => e.date >= todayKey)
    .filter(e => activeFilter === null || e.category === activeFilter)
    .sort((a, b) => a.date.localeCompare(b.date));

  const upcomingByDate = upcomingEvents.reduce((acc, ev) => {
    if (!acc[ev.date]) acc[ev.date] = [];
    acc[ev.date].push(ev);
    return acc;
  }, {});

  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="calendar-page">

      <div className="calendar-header">
        <button className="cal-nav-btn" onClick={prevMonth}>&#8249;</button>
        <h2 className="cal-month-label">{monthLabel}</h2>
        <button className="cal-nav-btn" onClick={nextMonth}>&#8250;</button>
        <button
          className={`cal-sidebar-toggle${sidebarOpen ? ' cal-sidebar-toggle--open' : ''}`}
          onClick={() => setSidebarOpen(v => !v)}
          title={sidebarOpen ? 'Hide upcoming events' : 'Show upcoming events'}
        >
          {sidebarOpen ? 'Hide Upcoming' : 'Upcoming'}
          <span className="cal-sidebar-toggle-arrow">{sidebarOpen ? '›' : '‹'}</span>
        </button>
      </div>

      <div className="cal-legend">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`cal-legend-item${activeFilter === cat.id ? ' cal-legend-item--active' : ''}`}
            style={{ '--cat-color': cat.color }}
            onClick={() => setActiveFilter(prev => prev === cat.id ? null : cat.id)}
          >
            <span className="cal-legend-dot" />
            {cat.label}
          </button>
        ))}
      </div>

      <div className={`cal-layout${sidebarOpen ? ' cal-layout--with-sidebar' : ''}`}>
        <div className="cal-main">
          <div className="calendar-grid">
            {DAYS_OF_WEEK.map(d => (
              <div key={d} className="cal-day-header">{d}</div>
            ))}
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} className="cal-cell cal-cell--empty" />;

              const dateKey   = toDateKey(year, month, day);
              const dayEvents = events
                .filter(e => e.date === dateKey)
                .filter(e => activeFilter === null || e.category === activeFilter);
              const isToday   = dateKey === todayKey;

              return (
                <div
                  key={dateKey}
                  className={`cal-cell${isToday ? ' cal-cell--today' : ''}`}
                  onClick={() => openAdd(dateKey)}
                >
                  <span className="cal-day-number">{day}</span>
                  <div className="cal-events">
                    {dayEvents.map(ev => (
                      <div
                        key={ev.id}
                        className="cal-event"
                        style={{ '--event-color': getCategoryColor(ev.category) }}
                        onClick={e => { e.stopPropagation(); openEdit(ev); }}
                        title={`[${getCategoryLabel(ev.category)}] ${ev.description || ev.title}`}
                      >
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {sidebarOpen && (
          <aside className="cal-sidebar">
            <h3 className="cal-sidebar-title">Upcoming Events</h3>
            {Object.keys(upcomingByDate).length === 0 ? (
              <p className="cal-sidebar-empty">No upcoming events.</p>
            ) : (
              Object.entries(upcomingByDate).map(([dateKey, dateEvents]) => (
                <div key={dateKey} className="cal-sidebar-group">
                  <p className={`cal-sidebar-date${dateKey === todayKey ? ' cal-sidebar-date--today' : ''}`}>
                    {dateKey === todayKey ? 'Today' : formatDisplayDate(dateKey)}
                  </p>
                  {dateEvents.map(ev => (
                    <div
                      key={ev.id}
                      className="cal-sidebar-event"
                      style={{ '--event-color': getCategoryColor(ev.category) }}
                      onClick={() => openEdit(ev)}
                    >
                      <span className="cal-sidebar-event-title">{ev.title}</span>
                      <span className="cal-sidebar-event-cat">{getCategoryLabel(ev.category)}</span>
                      {ev.description && (
                        <span className="cal-sidebar-event-desc">{ev.description}</span>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </aside>
        )}
      </div>

      {modal && (
        <div className="cal-modal-overlay" onClick={closeModal}>
          <div className="cal-modal" onClick={e => e.stopPropagation()}>
            <h3>{modal.mode === 'add' ? 'Add Event' : 'Edit Event'}</h3>

            <label>Title
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Event title"
                autoFocus
              />
            </label>

            <label>Date
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
            </label>

            <label>Description
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional description"
                rows={3}
              />
            </label>

            <label>Category
              <div className="cal-category-picker">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`cal-category-swatch${form.category === cat.id ? ' cal-category-swatch--selected' : ''}`}
                    style={{ '--cat-color': cat.color }}
                    onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                  >
                    <span className="cal-swatch-dot" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </label>

            {modal.mode === 'add' && (
              <label>Recurrence
                <div className="recurrence-row">
                  <select value={recurrence} onChange={e => setRecurrence(e.target.value)}>
                    <option value="none">Does not repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  {recurrence !== 'none' && (
                    <>
                      <input
                        type="number"
                        className="recurrence-count"
                        min="2"
                        max="52"
                        value={recurrenceCount}
                        onChange={e => setRecurrenceCount(Math.max(2, Math.min(52, Number(e.target.value))))}
                      />
                      <span className="recurrence-times-label">times</span>
                    </>
                  )}
                </div>
              </label>
            )}

            {error && <p className="cal-error">{error}</p>}

            <div className="cal-modal-actions">
              {modal.mode === 'edit' && (
                <button className="cal-btn cal-btn--danger" onClick={handleDelete}>Delete</button>
              )}
              <div className="cal-modal-actions-right">
                <button className="cal-btn cal-btn--ghost" onClick={closeModal}>Cancel</button>
                <button className="cal-btn cal-btn--primary" onClick={handleSave}>
                  {modal.mode === 'add' ? 'Add' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
