import AdvisorCard from '../AdvisorCard';

const SPARKS = [
  { left: '8%',  bottom: '6px',  delay: '0s',    size: '0.85rem', color: '#c4714a' },
  { left: '28%', bottom: '4px',  delay: '0.35s', size: '1rem',    color: '#c9a84c' },
  { left: '52%', bottom: '7px',  delay: '0.6s',  size: '0.9rem',  color: '#c4714a' },
  { left: '73%', bottom: '5px',  delay: '0.2s',  size: '1.05rem', color: '#c9a84c' },
  { left: '91%', bottom: '6px',  delay: '0.45s', size: '0.85rem', color: '#c4714a' },
];

function MuseumCard({ onClick }) {
  return (
    <div className="advisor-fx-wrapper">
      <AdvisorCard
        title="The Museum"
        tagline="Curate your world."
        color="#c4714a"
        icon="🏛️"
        onClick={onClick}
      >
        {SPARKS.map((s, i) => (
          <span
            key={i}
            className="museum-spark"
            style={{
              left:             s.left,
              bottom:           s.bottom,
              fontSize:         s.size,
              animationDelay:   s.delay,
              color:            s.color,
              '--peak-opacity': 0.85,
            }}
          >◆</span>
        ))}
      </AdvisorCard>
    </div>
  );
}

export default MuseumCard;
