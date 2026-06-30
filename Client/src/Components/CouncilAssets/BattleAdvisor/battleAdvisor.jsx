import AdvisorCard from '../AdvisorCard';

const BATTLE_SLASHES = [
  { left: '7%',  bottom: '10px', delay: '0s',    size: '2.4rem', rotate: '-40deg', behind: false },
  { left: '20%', bottom: '5px',  delay: '0.25s', size: '2rem',   rotate: '-50deg', behind: false },
  { left: '35%', bottom: '14px', delay: '0.6s',  size: '2.6rem', rotate: '-35deg', behind: false },
  { left: '50%', bottom: '6px',  delay: '0.1s',  size: '2.2rem', rotate: '-45deg', behind: false },
  { left: '65%', bottom: '12px', delay: '0.45s', size: '2.8rem', rotate: '-55deg', behind: false },
  { left: '80%', bottom: '4px',  delay: '0.8s',  size: '2rem',   rotate: '-30deg', behind: false },
  { left: '92%', bottom: '9px',  delay: '0.35s', size: '2.4rem', rotate: '-45deg', behind: false },
  { left: '10%', bottom: '40%',  delay: '0.15s', size: '2.6rem', rotate: '-40deg', behind: true  },
  { left: '24%', bottom: '58%',  delay: '0.55s', size: '2.2rem', rotate: '-50deg', behind: true  },
  { left: '38%', bottom: '48%',  delay: '0.9s',  size: '2.8rem', rotate: '-35deg', behind: true  },
  { left: '52%', bottom: '70%',  delay: '0.3s',  size: '2.4rem', rotate: '-45deg', behind: true  },
  { left: '66%', bottom: '44%',  delay: '0.7s',  size: '2rem',   rotate: '-55deg', behind: true  },
  { left: '78%', bottom: '62%',  delay: '0.05s', size: '2.6rem', rotate: '-30deg', behind: true  },
  { left: '90%', bottom: '52%',  delay: '0.5s',  size: '2.2rem', rotate: '-42deg', behind: true  },
];

function BattleAdvisorCard({ onClick }) {
  return (
    <div className="advisor-fx-wrapper">
      {BATTLE_SLASHES.filter(s => s.behind).map((s, i) => (
        <span key={i} className="battle-slash" style={{
          position: 'absolute', left: s.left, bottom: s.bottom,
          fontSize: s.size, animationDelay: s.delay, zIndex: 0,
          '--rotate': s.rotate, '--peak-opacity': 0.75,
        }}>/</span>
      ))}
      <AdvisorCard title="Battle Advisor" tagline="Track objectives, missions, and combat readiness." color="#e05c5c" icon="⚔️" onClick={onClick}>
        {BATTLE_SLASHES.filter(s => !s.behind).map((s, i) => (
          <span key={i} className="battle-slash" style={{
            left: s.left, bottom: s.bottom,
            fontSize: s.size, animationDelay: s.delay, zIndex: 2,
            '--rotate': s.rotate, '--peak-opacity': 0.07,
          }}>/</span>
        ))}
      </AdvisorCard>
    </div>
  );
}

export default BattleAdvisorCard;
