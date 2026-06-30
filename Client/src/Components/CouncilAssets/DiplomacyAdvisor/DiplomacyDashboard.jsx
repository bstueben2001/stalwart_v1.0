import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RelationCard from './RelationCard';
import nobleZig from './nobleZig.png';
import {
  fetchRelations,
  createRelation,
  updateRelation,
  deleteRelation,
} from '../../../api/diplomacy';

const STATUSES  = ['good', 'great', 'distant', 'strained', 'complicated'];
const EMPTY_FORM = { name: '', birthday: '', favorites: '', relationshipStatus: 'good' };

function DiplomacyDashboard() {
  const navigate = useNavigate();

  const [relations, setRelations] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [apiError, setApiError]   = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchRelations()
      .then(setRelations)
      .catch(() => setApiError('Could not load friends. Is the server running?'))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('A name is required.'); return; }
    try {
      const newRelation = await createRelation({
        name:               form.name.trim(),
        birthday:           form.birthday,
        favorites:          form.favorites.split(',').map(f => f.trim()).filter(Boolean),
        relationshipStatus: form.relationshipStatus,
      });
      setRelations(prev => [...prev, newRelation]);
      setForm(EMPTY_FORM);
      setFormError('');
      setModalOpen(false);
    } catch {
      setFormError('Failed to save. Please try again.');
    }
  }

  async function handleEdit(id, updates) {
    try {
      const updated = await updateRelation(id, updates);
      setRelations(prev => prev.map(r => r.id === id ? updated : r));
    } catch {
      setApiError('Failed to update. Please try again.');
    }
  }

  async function handleDelete(id) {
    try {
      await deleteRelation(id);
      setRelations(prev => prev.filter(r => r.id !== id));
    } catch {
      setApiError('Failed to delete. Please try again.');
    }
  }

  function handleClose() {
    setModalOpen(false);
    setForm(EMPTY_FORM);
    setFormError('');
  }

  return (
    <div className="dashboard-page" style={{ '--advisor-color': '#5b8de8' }}>
      <img src={nobleZig} alt="" className="diplo-noble-img" />

      <div className="dashboard-header">
        <button className="dashboard-back" onClick={() => navigate('/council')}>← Council</button>
        <h1 className="dashboard-title">Noble Zigg - Diplomacy Advisor</h1>
        <button className="diplo-add-btn" onClick={() => setModalOpen(true)}>+ Add Friend</button>
      </div>

      <div className="dashboard-box dashboard-box--diplomacy">

        <div className="dashboard-panel">
          <div className="dashboard-panel-heading">Friends</div>
          <div className="dashboard-panel-content dashboard-panel-content--flush">
            {loading && <p className="dashboard-panel-placeholder">Loading...</p>}
            {apiError && <p className="dashboard-error" style={{ padding: '1rem' }}>{apiError}</p>}
            {!loading && !apiError && relations.length === 0 && (
              <p className="dashboard-panel-placeholder">No friends added yet.</p>
            )}
            {relations.map(r => (
              <RelationCard
                key={r.id}
                relation={r}
                onEdit={handleEdit}
                onDelete={() => handleDelete(r.id)}
              />
            ))}
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-heading">Suggestions</div>
          <div className="dashboard-panel-content">
            <p className="dashboard-panel-placeholder">Suggestions coming soon.</p>
          </div>
        </div>

      </div>

      {modalOpen && (
        <div className="diplo-modal-overlay" onClick={handleClose}>
          <div className="diplo-modal" onClick={e => e.stopPropagation()}>
            <div className="diplo-modal-header">
              <h2 className="diplo-modal-title">Add Friend</h2>
              <button className="diplo-modal-close" onClick={handleClose}>✕</button>
            </div>

            <form className="diplo-modal-form" onSubmit={handleAdd}>
              <label className="diplo-modal-label">
                Name
                <input
                  className="dashboard-input"
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  autoFocus
                />
              </label>

              <label className="diplo-modal-label">
                Birthday
                <input
                  className="dashboard-input"
                  type="date"
                  value={form.birthday}
                  onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))}
                />
              </label>

              <label className="diplo-modal-label">
                Favorites
                <input
                  className="dashboard-input"
                  type="text"
                  placeholder="e.g. hiking, coffee, cats"
                  value={form.favorites}
                  onChange={e => setForm(f => ({ ...f, favorites: e.target.value }))}
                />
                <span className="diplo-modal-hint">Separate with commas</span>
              </label>

              <label className="diplo-modal-label">
                Relationship Status
                <select
                  className="dashboard-input"
                  value={form.relationshipStatus}
                  onChange={e => setForm(f => ({ ...f, relationshipStatus: e.target.value }))}
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </label>

              {formError && <p className="dashboard-error">{formError}</p>}

              <div className="diplo-modal-actions">
                <button className="cal-btn cal-btn--ghost" type="button" onClick={handleClose}>Cancel</button>
                <button className="cal-btn cal-btn--primary" type="submit">Add Friend</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default DiplomacyDashboard;
