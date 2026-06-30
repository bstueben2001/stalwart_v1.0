import { useState } from 'react';
import { useAppContext } from '../Context';

function AuthModal({ onClose, defaultTab = 'login' }) {
  const { login, signup } = useAppContext();
  const [tab, setTab] = useState(defaultTab);
  const [form, setForm] = useState({ username: '', identifier: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.identifier, form.password);
      } else {
        await signup(form.username, form.email, form.password);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <div className="auth-tabs">
          <button
            className={`auth-tab${tab === 'login' ? ' auth-tab--active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
          >
            Log In
          </button>
          <button
            className={`auth-tab${tab === 'signup' ? ' auth-tab--active' : ''}`}
            onClick={() => { setTab('signup'); setError(''); }}
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {tab === 'signup' && (
            <label className="auth-label">
              Username
              <input
                className="auth-input"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                autoComplete="username"
              />
            </label>
          )}
          {tab === 'login' ? (
            <label className="auth-label">
              Email or Username
              <input
                className="auth-input"
                type="text"
                name="identifier"
                value={form.identifier}
                onChange={handleChange}
                required
                autoComplete="username"
              />
            </label>
          ) : (
            <label className="auth-label">
              Email
              <input
                className="auth-input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </label>
          )}
          <label className="auth-label">
            Password
            <input
              className="auth-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <div className="auth-actions">
            <button type="button" className="auth-btn auth-btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="auth-btn auth-btn--primary" disabled={loading}>
              {loading ? '...' : tab === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;
