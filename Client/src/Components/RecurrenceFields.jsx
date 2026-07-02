import { RECURRENCE_OPTIONS } from '../utils/recurrence';

export default function RecurrenceFields({ recurrence, setRecurrence, recurrenceCount, setRecurrenceCount }) {
  return (
    <div className="recurrence-row">
      <select value={recurrence} onChange={e => setRecurrence(e.target.value)}>
        {RECURRENCE_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {recurrence !== 'none' && (
        <>
          <input
            type="number"
            className="recurrence-count"
            min="2"
            max="52"
            value={recurrenceCount}
            onChange={e => setRecurrenceCount(Math.max(2, Math.min(52, Number(e.target.value))))}
          />
          <span className="recurrence-times-label">times</span>
        </>
      )}
    </div>
  );
}
