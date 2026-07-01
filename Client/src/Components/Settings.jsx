import { useState } from 'react';
import { useAppContext } from '../Context';
import AuthModal from './AuthModal';
import { submitFeedback } from '../api/feedback';

function Settings() {
  const { user, logout } = useAppContext();
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState(null);

  async function handleFeedbackSubmit() {
    if (!feedbackText.trim()) return;
    setFeedbackStatus('sending');
    try {
      await submitFeedback(feedbackText);
      setFeedbackStatus('success');
      setFeedbackText('');
      setTimeout(() => {
        setShowFeedback(false);
        setFeedbackStatus(null);
      }, 2000);
    } catch {
      setFeedbackStatus('error');
    }
  }

  function handleFeedbackCancel() {
    setShowFeedback(false);
    setFeedbackText('');
    setFeedbackStatus(null);
  }

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

        <div className="settings-row settings-row--feedback">
          {!showFeedback ? (
            <>
              <div className="settings-row-info">
                <span className="settings-row-label">Feedback</span>
                <span className="settings-row-desc">We'd love to hear your thoughts!</span>
              </div>
              <button className="settings-btn settings-btn--primary" onClick={() => setShowFeedback(true)}>
                Give Feedback
              </button>
            </>
          ) : (
            <div className="settings-feedback-form">
              <span className="settings-row-label">Leave your feedback</span>
              <textarea
                className="settings-feedback-textarea"
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                disabled={feedbackStatus === 'sending' || feedbackStatus === 'success'}
              />
              {feedbackStatus === 'success' && (
                <span className="settings-feedback-msg settings-feedback-msg--success">Thank you for your feedback!</span>
              )}
              {feedbackStatus === 'error' && (
                <span className="settings-feedback-msg settings-feedback-msg--error">Something went wrong. Please try again.</span>
              )}
              <div className="settings-feedback-actions">
                <button
                  className="settings-btn settings-btn--primary"
                  onClick={handleFeedbackSubmit}
                  disabled={feedbackStatus === 'sending' || feedbackStatus === 'success' || !feedbackText.trim()}
                >
                  {feedbackStatus === 'sending' ? 'Sending...' : 'Submit'}
                </button>
                <button className="settings-btn" onClick={handleFeedbackCancel}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </main>
  );
}

export default Settings;
