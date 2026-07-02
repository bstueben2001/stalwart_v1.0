export default function SpeechBubble({ text, onDismiss, className = '' }) {
  if (!text) return null;
  return (
    <div className={`speech-bubble ${className}`.trim()}>
      <button className="speech-bubble-close" onClick={onDismiss} aria-label="Dismiss">✕</button>
      <p className="speech-bubble-text">{text}</p>
    </div>
  );
}
