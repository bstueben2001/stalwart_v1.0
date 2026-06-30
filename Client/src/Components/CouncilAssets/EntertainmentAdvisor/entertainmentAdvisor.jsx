import AdvisorCard from '../AdvisorCard';

const STARS = [
  // Front layer — barely visible, float above card edges
  { left: '5%',  bottom: '8px',  delay: '0s',    size: '2.2rem', color: '#9b6bd4', tx: '-40px', ty: '-60px', behind: false },
  { left: '25%', bottom: '4px',  delay: '0.3s',  size: '2.6rem', color: '#c9a84c', tx: '-15px', ty: '-80px', behind: false },
  { left: '50%', bottom: '10px', delay: '0.7s',  size: '2rem',   color: '#9b6bd4', tx: '20px',  ty: '-70px', behind: false },
  { left: '75%', bottom: '6px',  delay: '0.15s', size: '2.8rem', color: '#c9a84c', tx: '35px',  ty: '-55px', behind: false },
  { left: '92%', bottom: '8px',  delay: '0.5s',  size: '2.4rem', color: '#9b6bd4', tx: '50px',  ty: '-75px', behind: false },

  // Behind layer — scattered across card interior, glow visible as they emerge
  { left: '10%', bottom: '30%',  delay: '0.4s',  size: '2.6rem', color: '#c9a84c', tx: '-50px', ty: '-65px', behind: true },
  { left: '25%', bottom: '55%',  delay: '0.8s',  size: '2.2rem', color: '#9b6bd4', tx: '-10px', ty: '-85px', behind: true },
  { left: '40%', bottom: '40%',  delay: '0.25s', size: '2.4rem', color: '#c9a84c', tx: '10px',  ty: '-90px', behind: true },
  { left: '55%', bottom: '70%',  delay: '0.6s',  size: '2rem',   color: '#9b6bd4', tx: '55px',  ty: '-60px', behind: true },
  { left: '68%', bottom: '50%',  delay: '1.0s',  size: '2.8rem', color: '#c9a84c', tx: '30px',  ty: '-80px', behind: true },
  { left: '80%', bottom: '35%',  delay: '0.45s', size: '2.2rem', color: '#9b6bd4', tx: '-30px', ty: '-70px', behind: true },
  { left: '30%', bottom: '75%',  delay: '1.1s',  size: '2.4rem', color: '#c9a84c', tx: '-60px', ty: '-50px', behind: true },
  { left: '60%', bottom: '60%',  delay: '0.35s', size: '2rem',   color: '#9b6bd4', tx: '40px',  ty: '-65px', behind: true },
  { left: '85%', bottom: '65%',  delay: '0.9s',  size: '2.6rem', color: '#c9a84c', tx: '25px',  ty: '-75px', behind: true },
];

function EntertainmentAdvisorCard({ onClick }) {
  return (
    <div className="advisor-fx-wrapper">
      {/* Behind stars — float from within the card outward */}
      {STARS.filter(s => s.behind).map((s, i) => (
        <span
          key={i}
          className="entertain-star"
          style={{
            position:         'absolute',
            left:             s.left,
            bottom:           s.bottom,
            fontSize:         s.size,
            animationDelay:   s.delay,
            color:            s.color,
            '--tx':           s.tx,
            '--ty':           s.ty,
            '--peak-opacity': 0.75,
            zIndex:           0,
          }}
        >★</span>
      ))}
      <AdvisorCard title="Entertainment Advisor" tagline="Coming soon." color="#9b6bd4" icon="🎭" onClick={onClick}>
        {STARS.filter(s => !s.behind).map((s, i) => (
          <span
            key={i}
            className="entertain-star"
            style={{
              left:             s.left,
              bottom:           s.bottom,
              fontSize:         s.size,
              animationDelay:   s.delay,
              color:            s.color,
              '--tx':           s.tx,
              '--ty':           s.ty,
              '--peak-opacity': 0.07,
              zIndex:           2,
            }}
          >★</span>
        ))}
      </AdvisorCard>
    </div>
  );
}

export default EntertainmentAdvisorCard;
