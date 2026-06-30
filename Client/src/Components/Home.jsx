import { useAppContext } from '../Context';

function Home() {
  const { openAuth } = useAppContext();

  return (
    <>
      <main className="home-page">
        <h1>Welcome to Stalwart</h1>
        <p>Your personal council of advisors awaits.</p>
        <button className="home-begin-btn" onClick={() => openAuth('login')}>
          Begin
        </button>
      </main>
      <img src="/knight.png" alt="Knight" className="home-knight" />
    </>
  );
}

export default Home;
