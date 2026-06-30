import AdvisorCard from '../AdvisorCard';

const ECON_PARTICLES = [
  { type: 'dollar', left: '6%',  bottom: '8px',  delay: '0s',    size: '2rem',   behind: false },
  { type: 'dollar', left: '22%', bottom: '14px', delay: '0.5s',  size: '2.4rem', behind: false },
  { type: 'dollar', left: '40%', bottom: '6px',  delay: '1.0s',  size: '2rem',   behind: false },
  { type: 'dollar', left: '58%', bottom: '12px', delay: '0.3s',  size: '2.6rem', behind: false },
  { type: 'dollar', left: '75%', bottom: '5px',  delay: '0.75s', size: '2.2rem', behind: false },
  { type: 'dollar', left: '90%', bottom: '10px', delay: '0.2s',  size: '2rem',   behind: false },
  { type: 'coin',   left: '14%', bottom: '35%',  delay: '0.4s',  size: '1.6rem', behind: true  },
  { type: 'coin',   left: '30%', bottom: '55%',  delay: '0.85s', size: '1.8rem', behind: true  },
  { type: 'coin',   left: '48%', bottom: '45%',  delay: '0.15s', size: '2rem',   behind: true  },
  { type: 'coin',   left: '64%', bottom: '65%',  delay: '0.6s',  size: '1.6rem', behind: true  },
  { type: 'coin',   left: '80%', bottom: '40%',  delay: '1.1s',  size: '1.8rem', behind: true  },
  { type: 'coin',   left: '50%', bottom: '75%',  delay: '0.35s', size: '2rem',   behind: true  },
];

function EconomicAdvisorCard({ onClick }) {
  return (
    <div className="advisor-fx-wrapper">
      {ECON_PARTICLES.filter(p => p.behind).map((p, i) => (
        <span key={i} className="econ-coin" style={{
          position: 'absolute', left: p.left, bottom: p.bottom,
          fontSize: p.size, animationDelay: p.delay, zIndex: 0,
          '--peak-opacity': 0.75,
        }}>●</span>
      ))}
      <AdvisorCard title="Economic Advisor" tagline="Coming soon." color="#d4a017" icon="💰" onClick={onClick}>
        {ECON_PARTICLES.filter(p => !p.behind).map((p, i) => (
          <span key={i} className="econ-dollar" style={{
            left: p.left, bottom: p.bottom,
            fontSize: p.size, animationDelay: p.delay, zIndex: 2,
            '--peak-opacity': 0.07,
          }}>$</span>
        ))}
      </AdvisorCard>
    </div>
  );
}

export default EconomicAdvisorCard;
