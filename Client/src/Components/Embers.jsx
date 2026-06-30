const EMBERS = Array.from({ length: 60 }, (_, i) => ({
  id:       i,
  left:     Math.random() * 115 - 10,
  bottom:   Math.random() * 35 - 5,
  size:     4 + Math.random() * 9,
  duration: 5 + Math.random() * 8,
  delay:    -(Math.random() * 12),
  dx:       1000 + Math.random() * 1200,
  dy:       700 + Math.random() * 900,
}));

function Embers() {
  return (
    <div className="ember-container" aria-hidden="true">
      {EMBERS.map(e => (
        <span
          key={e.id}
          className="ember"
          style={{
            left:              `${e.left}%`,
            bottom:            `${e.bottom}%`,
            width:             `${e.size}px`,
            height:            `${e.size}px`,
            animationDuration: `${e.duration}s`,
            animationDelay:    `${e.delay}s`,
            '--dx':            `${e.dx}px`,
            '--dy':            `${e.dy}px`,
          }}
        />
      ))}
    </div>
  );
}

export default Embers;
