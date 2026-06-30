import { NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../Context';
import AuthModal from './AuthModal';

function Navbar() {
  const { user, logout, showAuth, authTab, openAuth, closeAuth } = useAppContext();
  const navigate = useNavigate();

  function handleLogout() { logout(); navigate('/'); }

  return (
    <>
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/council">Council</NavLink>
        <NavLink to="/calendar">Calendar</NavLink>
        <NavLink to="/settings">Settings</NavLink>

        <div className="nav-spacer" />

        <div className="nav-auth">
          {user ? (
            <>
              <span className="nav-user">Hail, <span>{user.username}</span></span>
              <button className="nav-auth-btn nav-auth-btn--ghost" onClick={handleLogout}>Log Out</button>
            </>
          ) : (
            <>
              <button className="nav-auth-btn nav-auth-btn--ghost" onClick={() => openAuth('login')}>Log In</button>
              <button className="nav-auth-btn nav-auth-btn--primary" onClick={() => openAuth('signup')}>Sign Up</button>
            </>
          )}
        </div>
      </nav>

      {showAuth && <AuthModal defaultTab={authTab} onClose={closeAuth} />}
    </>
  );
}

export default Navbar;
