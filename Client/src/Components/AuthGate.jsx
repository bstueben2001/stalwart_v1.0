import { useAppContext } from '../Context';

function AuthGate({ children }) {
  const { user, openAuth } = useAppContext();

  if (user) return children;

  return (
    <div className="auth-gate-wrapper">
      <div className="auth-gate-content" aria-hidden="true">
        {children}
      </div>
      <div className="auth-gate-overlay">
        <h2 className="auth-gate-heading">Your council awaits.</h2>
        <p className="auth-gate-sub">Sign in to continue.</p>
        <button className="home-begin-btn" onClick={() => openAuth('login')}>
          Begin
        </button>
      </div>
    </div>
  );
}

export default AuthGate;
