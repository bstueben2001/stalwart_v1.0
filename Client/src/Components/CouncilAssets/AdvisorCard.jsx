function AdvisorCard({ title, tagline, color, icon, onClick, children }) {
  return (
    <div className="advisor-card" style={{ '--advisor-color': color }} onClick={onClick}>
      <div className="advisor-card-icon">{icon}</div>
      <h3 className="advisor-card-title">{title}</h3>
      <p className="advisor-card-tagline">{tagline}</p>
      <span className="advisor-card-cta">Open Dashboard →</span>
      {children}
    </div>
  );
}

export default AdvisorCard;
