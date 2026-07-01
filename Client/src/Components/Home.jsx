import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../Context';

function Home() {
  const { user, openAuth } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/council');
  }, [user, navigate]);

  return (
    <>
      <main className="home-page">
        <h1>Welcome to Stalwart</h1>
        <p>Your personal council of advisors awaits.</p>
        {!user && (
          <button className="home-begin-btn" onClick={() => openAuth('login')}>
            Begin
          </button>
        )}
      </main>
      <img src="/knight.png" alt="Knight" className="home-knight" />
    </>
  );
}

export default Home;
