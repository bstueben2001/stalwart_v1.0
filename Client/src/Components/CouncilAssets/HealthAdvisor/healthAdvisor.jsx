import AdvisorCard from '../AdvisorCard';

const HEAL_PLUSES = [
  { left: '8%',  bottom: '8px',  delay: '0s',    size: '2rem',   behind: false },
  { left: '18%', bottom: '14px', delay: '0.5s',  size: '2.6rem', behind: false },
  { left: '32%', bottom: '6px',  delay: '1s',    size: '2.2rem', behind: false },
  { left: '47%', bottom: '18px', delay: '0.3s',  size: '2.8rem', behind: false },
  { left: '61%', bottom: '10px', delay: '0.8s',  size: '2rem',   behind: false },
  { left: '75%', bottom: '5px',  delay: '1.3s',  size: '2.4rem', behind: false },
  { left: '89%', bottom: '12px', delay: '0.6s',  size: '2.2rem', behind: false },
  { left: '2%',  bottom: '30%',  delay: '0.2s',  size: '2.5rem', behind: true  },
  { left: '12%', bottom: '50%',  delay: '0.9s',  size: '2rem',   behind: true  },
  { left: '24%', bottom: '40%',  delay: '0.4s',  size: '2.8rem', behind: true  },
  { left: '36%', bottom: '60%',  delay: '1.1s',  size: '2.2rem', behind: true  },
  { left: '50%', bottom: '35%',  delay: '0.7s',  size: '3rem',   behind: true  },
  { left: '63%', bottom: '55%',  delay: '0.15s', size: '2.4rem', behind: true  },
  { left: '76%', bottom: '45%',  delay: '1.4s',  size: '2rem',   behind: true  },
  { left: '88%', bottom: '30%',  delay: '0.55s', size: '2.6rem', behind: true  },
  { left: '40%', bottom: '70%',  delay: '1.2s',  size: '2.2rem', behind: true  },
  { left: '58%', bottom: '65%',  delay: '0.35s', size: '2.8rem', behind: true  },
  { left: '20%', bottom: '75%',  delay: '0.75s', size: '2rem',   behind: true  },
  { left: '70%', bottom: '80%',  delay: '1.05s', size: '2.4rem', behind: true  },
  { left: '85%', bottom: '68%',  delay: '0.25s', size: '2.6rem', behind: true  },
];

function HealthAdvisorCard({ onClick }) {
  return (
    <div className="advisor-fx-wrapper">
      {HEAL_PLUSES.filter(p => p.behind).map((p, i) => (
        <span key={i} className="heal-plus" style={{
          position: 'absolute', left: p.left, bottom: p.bottom,
          fontSize: p.size, animationDelay: p.delay, zIndex: 0,
          '--peak-opacity': 0.75,
        }}>+</span>
      ))}
      <AdvisorCard title="Health Advisor" tagline="Monitor wellness goals, habits, and vitality." color="#4caf82" icon="🌿" onClick={onClick}>
        {HEAL_PLUSES.filter(p => !p.behind).map((p, i) => (
          <span key={i} className="heal-plus" style={{
            left: p.left, bottom: p.bottom,
            fontSize: p.size, animationDelay: p.delay, zIndex: 2,
            '--peak-opacity': 0.07,
          }}>+</span>
        ))}
      </AdvisorCard>
    </div>
  );
}

export default HealthAdvisorCard;
