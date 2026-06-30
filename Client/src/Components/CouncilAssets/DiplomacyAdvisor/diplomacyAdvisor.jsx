import AdvisorCard from '../AdvisorCard';

// Front rays — inside card, barely visible
const FRONT_RAYS = [
  { angle:   0, delay: '0s'    },
  { angle:  72, delay: '0.36s' },
  { angle: 144, delay: '0.72s' },
  { angle: 216, delay: '0.27s' },
  { angle: 288, delay: '0.63s' },
];

// Behind rays — same angles but behind the card, glow visible beyond card edges
const BEHIND_RAYS = [
  { angle:  36, delay: '0.18s' },
  { angle: 108, delay: '0.54s' },
  { angle: 180, delay: '0.9s'  },
  { angle: 252, delay: '0.45s' },
  { angle: 324, delay: '0.81s' },
];

function DiplomacyAdvisorCard({ onClick }) {
  return (
    <div className="advisor-fx-wrapper">
      {/* Behind rays — positioned at card center, sit behind card face */}
      {BEHIND_RAYS.map((r, i) => (
        <span
          key={i}
          className="diplo-ray"
          style={{
            position:       'absolute',
            top:            'calc(50% - 1px)',
            left:           '50%',
            animationDelay: r.delay,
            '--angle':      `${r.angle}deg`,
            '--peak-opacity': 0.85,
            zIndex:         0,
          }}
        />
      ))}
      <AdvisorCard title="Diplomacy Advisor" tagline="Manage relationships, alliances, and social goals." color="#5b8de8" icon="🤝" onClick={onClick}>
        {FRONT_RAYS.map((r, i) => (
          <span
            key={i}
            className="diplo-ray"
            style={{
              animationDelay:   r.delay,
              '--angle':        `${r.angle}deg`,
              '--peak-opacity': 0.06,
            }}
          />
        ))}
      </AdvisorCard>
    </div>
  );
}

export default DiplomacyAdvisorCard;
