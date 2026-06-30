import AdvisorCard from '../AdvisorCard';

const HEARTS = [
  { left: '5%',  bottom: '8px',  delay: '0s',    size: '2rem',   behind: false },
  { left: '18%', bottom: '14px', delay: '0.4s',  size: '2.6rem', behind: false },
  { left: '33%', bottom: '6px',  delay: '0.9s',  size: '2.2rem', behind: false },
  { left: '50%', bottom: '16px', delay: '0.2s',  size: '2.8rem', behind: false },
  { left: '66%', bottom: '8px',  delay: '0.65s', size: '2rem',   behind: false },
  { left: '80%', bottom: '12px', delay: '1.1s',  size: '2.4rem', behind: false },
  { left: '93%', bottom: '5px',  delay: '0.5s',  size: '2.2rem', behind: false },
  { left: '10%', bottom: '38%',  delay: '0.3s',  size: '2.4rem', behind: true  },
  { left: '25%', bottom: '56%',  delay: '0.75s', size: '2rem',   behind: true  },
  { left: '40%', bottom: '46%',  delay: '1.2s',  size: '2.6rem', behind: true  },
  { left: '55%', bottom: '68%',  delay: '0.1s',  size: '2.2rem', behind: true  },
  { left: '70%', bottom: '42%',  delay: '0.55s', size: '2.8rem', behind: true  },
  { left: '84%', bottom: '60%',  delay: '0.85s', size: '2rem',   behind: true  },
  { left: '45%', bottom: '78%',  delay: '0.4s',  size: '2.4rem', behind: true  },
];

function RomanticAdvisorCard({ onClick }) {
  return (
    <div className="advisor-fx-wrapper">
      {HEARTS.filter(h => h.behind).map((h, i) => (
        <span key={i} className="romantic-heart" style={{
          position: 'absolute', left: h.left, bottom: h.bottom,
          fontSize: h.size, animationDelay: h.delay, zIndex: 0,
          '--peak-opacity': 0.75,
        }}>♥</span>
      ))}
      <AdvisorCard title="Romantic Advisor" tagline="Coming soon." color="#d46fa0" icon="💌" onClick={onClick}>
        {HEARTS.filter(h => !h.behind).map((h, i) => (
          <span key={i} className="romantic-heart" style={{
            left: h.left, bottom: h.bottom,
            fontSize: h.size, animationDelay: h.delay, zIndex: 2,
            '--peak-opacity': 0.07,
          }}>♥</span>
        ))}
      </AdvisorCard>
    </div>
  );
}

export default RomanticAdvisorCard;
