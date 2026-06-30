import { useState } from 'react';

const SLIDERS = [
  { key: 'sleep',   label: 'Sleep'   },
  { key: 'work',    label: 'Work'    },
  { key: 'school',  label: 'School'  },
  { key: 'commute', label: 'Commute' },
];

const CHAMPION_HOURS = 2; // 120 min, always reserved

export default function BattleDialog({ initialHours, isReview = false, onDeploy, onReset, onClose }) {
  const [hours, setHours] = useState(initialHours ?? { sleep: 0, work: 0, school: 0, commute: 0 });

  const total        = Object.values(hours).reduce((a, b) => a + b, 0);
  const remaining    = 24 - CHAMPION_HOURS - total;
  const sprites      = Math.max(0, Math.floor(remaining));
  const sleepSprites = Math.floor(hours.sleep);

  function handleSlider(key, raw) {
    const value   = Number(raw);
    const others  = total - hours[key];
    const clamped = Math.min(value, 24 - CHAMPION_HOURS - others);
    setHours(h => ({ ...h, [key]: clamped }));
  }

  const canDeploy = sprites > 0 || sleepSprites > 0;

  return (
    <div className="battle-dialog-overlay" onClick={onClose}>
      <div className="battle-dialog" onClick={e => e.stopPropagation()}>

        <div className="battle-dialog-header">
          <h2 className="battle-dialog-title">{isReview ? 'Review Sprite Allocation' : 'Allocate Your Day'}</h2>
          <button className="battle-dialog-close" onClick={onClose}>✕</button>
        </div>

        <p className="battle-dialog-subtitle">
          {isReview
            ? 'Adjust your time allocation and confirm to update your deployed sprites.'
            : 'Plan how you will spend your day. The remaining time will become your sprites.'}
        </p>

        <div className="battle-dialog-sliders">
          {SLIDERS.map(({ key, label }) => (
            <div key={key} className="battle-slider-row">
              <span className="battle-slider-label">{label}</span>
              <input
                type="range"
                className="battle-slider"
                min={0}
                max={24}
                step={0.5}
                value={hours[key]}
                onChange={e => handleSlider(key, e.target.value)}
              />
              <span className="battle-slider-value">{hours[key]}h</span>
            </div>
          ))}
        </div>

        <div className="battle-dialog-summary">
          <div className="battle-summary-row">
            <span>Stalwart Champion (You)</span>
            <span className="battle-summary-champion">2h · 120 min <span className="battle-summary-unit">(fixed)</span></span>
          </div>
          <div className="battle-summary-row">
            <span>Hours allocated</span>
            <span>{total}h</span>
          </div>
          <div className="battle-summary-divider" />
          <div className="battle-summary-row battle-summary-row--highlight">
            <span>Sprites</span>
            <span>{sprites} <span className="battle-summary-unit">({remaining}h free)</span></span>
          </div>
          <div className="battle-summary-row battle-summary-row--sleep">
            <span>Sleep Sprites</span>
            <span>{sleepSprites} <span className="battle-summary-unit">({hours.sleep}h sleep)</span></span>
          </div>
        </div>

        <div className="battle-dialog-actions">
          {isReview && (
            <button className="battle-dialog-reset" onClick={onReset}>Reset Sprites</button>
          )}
          <button className="dashboard-back" onClick={onClose}>Cancel</button>
          <button
            className="dashboard-add-btn"
            onClick={() => onDeploy({ sprites, sleepSprites, hours })}
            disabled={!canDeploy}
          >
            {isReview
              ? `Update Sprites (${sprites}${sleepSprites > 0 ? ` + ${sleepSprites}` : ''})`
              : `Deploy ${sprites} Sprite${sprites !== 1 ? 's' : ''}${sleepSprites > 0 ? ` + ${sleepSprites} Sleep` : ''}`
            }
          </button>
        </div>

      </div>
    </div>
  );
}
