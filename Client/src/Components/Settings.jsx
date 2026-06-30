import { useState } from 'react';
import { useAppContext } from '../Context';
import AuthModal from './AuthModal';

function Settings() {
  const { user, logout } = useAppContext();
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState(true);
  const [showModal, setShowModal] = useState(false);

  return (
    <main className="settings-page">
      <h1 className="settings-title">Settings</h1>

      <div className="settings-list">

        <div className="settings-row">
          <div className="settings-row-info">
            <span className="settings-row-label">Account</span>
            <span className="settings-row-desc">
              {user ? `Signed in as ${user.email}` : 'Sign in to sync your council across devices.'}
            </span>
          </div>
          {user ? (
            <button className="settings-btn settings-btn--primary" onClick={logout}>Log Out</button>
          ) : (
            <button className="settings-btn settings-btn--primary" onClick={() => setShowModal(true)}>Log In</button>
          )}
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <span className="settings-row-label">Theme</span>
            <span className="settings-row-desc">Choose your preferred appearance.</span>
          </div>
          <select
            className="settings-select"
            value={theme}
            onChange={e => setTheme(e.target.value)}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="midnight">Midnight</option>
            <option value="parchment">Parchment</option>
          </select>
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <span className="settings-row-label">Advisor Notifications</span>
            <span className="settings-row-desc">Receive reminders from your council advisors.</span>
          </div>
          <button
            className={`settings-toggle${notifications ? ' settings-toggle--on' : ''}`}
            onClick={() => setNotifications(v => !v)}
            aria-pressed={notifications}
          >
            <span className="settings-toggle-knob" />
          </button>
        </div>

      </div>

      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </main>
  );
}

export default Settings;
