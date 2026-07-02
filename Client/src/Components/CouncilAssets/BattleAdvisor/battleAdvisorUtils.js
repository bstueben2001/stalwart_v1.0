// spriteCount === hours of free time available after deploying

export const DAY_TYPES = {
  BUSY:     'busyDay',
  MODERATE: 'moderateDay',
  LIGHT:    'lightDay',
};

export function getDayType(spriteCount) {
  if (spriteCount <= 2)  return DAY_TYPES.BUSY;
  if (spriteCount <= 5)  return DAY_TYPES.MODERATE;
  return DAY_TYPES.LIGHT;
}

export const DAY_TYPE_LABELS = {
  [DAY_TYPES.BUSY]:     'Busy Day',
  [DAY_TYPES.MODERATE]: 'Moderate Day',
  [DAY_TYPES.LIGHT]:    'Light Day',
};

export const FOCUS_TYPES = {
  SMALL:    'smallFocus',
  MEDIUM:   'mediumFocus',
  HEAVY:    'heavyFocus',
  BALANCED: 'balancedFocus',
  DIVIDED:  'dividedFocus',
};

const FOCUS_OPTIONS = {
  [DAY_TYPES.BUSY]:     [FOCUS_TYPES.SMALL],
  [DAY_TYPES.MODERATE]: [FOCUS_TYPES.SMALL, FOCUS_TYPES.MEDIUM, FOCUS_TYPES.HEAVY, FOCUS_TYPES.BALANCED, FOCUS_TYPES.DIVIDED],
  [DAY_TYPES.LIGHT]:    [FOCUS_TYPES.MEDIUM, FOCUS_TYPES.HEAVY, FOCUS_TYPES.BALANCED, FOCUS_TYPES.DIVIDED],
};

export function getFocus(dayType) {
  const options = FOCUS_OPTIONS[dayType];
  return options[Math.floor(Math.random() * options.length)];
}

const DIALOGUE = {
  [DAY_TYPES.BUSY]: [
    "Wowza! Seems like you've got your hands full today. Here are my attack recommendations for your Sprites, if you can squeeze them in.",
    "Phew! You've got quite a day planned. Here are some battle plans I drew up, if you've got the Sprites.",
    "Heck. It seems like you're pretty busy today. These are my suggestions for battle with what Sprites you can spare.",
  ],
  [DAY_TYPES.MODERATE]: [
    "We've got a good little handful of time today. These are my suggestions for your Sprites. Attack wisely.",
    "Seems like we aren't too strapped today. Let's use some of those Sprites. Here are my recommendations.",
    "Not too bad today. Let's make a dent in these enemies with these battle plans I drafted.",
  ],
  [DAY_TYPES.LIGHT]: [
    "Oh yeah. We can get a lot done today. Here's my recommendations for your Sprites today.",
    "Ah, we have a strong amount of Sprites today, splendid. Let's take 'em into battle! Here's my suggestion.",
    "A good day to knock out some enemies. Here's where I think your Sprites can make the most impact.",
  ],
};

export function getDialogue(dayType) {
  const lines = DIALOGUE[dayType];
  return lines[Math.floor(Math.random() * lines.length)];
}

const ATTACK_DIALOGUE = [
  "Get 'er done!",
  "Very nice work",
  "Show 'em what for!",
  "You got this, pal!",
  "Those enemies don't stand a chance!",
  "Way to go, buddy!",
  "Light 'em up, soldier!",
  "KRAKATOA!",
  "Righteous, dude!",
  "Stellar work, my liege!",
];

export function getAttackDialogue() {
  return ATTACK_DIALOGUE[Math.floor(Math.random() * ATTACK_DIALOGUE.length)];
}

// ── Enemy difficulty minutes (single source of truth) ──────────────────────
export const ENEMY_MIN = {
  Minion:    10,
  Captain:   30,
  Champion:  60,
  Commander: 180,
  General:   360,
  Overlord:  720,
  Prophet:   1440,
  Emperor:   3000,
  God:       6000,
};

function getMin(enemy) {
  return ENEMY_MIN[enemy.difficulty ?? 'Minion'] ?? 10;
}

function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ── Focus resolvers ─────────────────────────────────────────────────────────

// As many low-health enemies as possible; suggest lowest-min extras with remaining time.
function resolveSmallFocus(enemies, availableMin) {
  const sorted  = [...enemies].sort((a, b) => getMin(a) - getMin(b));
  const targets = [];
  let remaining = availableMin;

  for (const enemy of sorted) {
    const cost = getMin(enemy);
    if (cost <= remaining) {
      targets.push(enemy);
      remaining -= cost;
    }
  }

  const targetIds = new Set(targets.map(e => e.id));
  const extras    = sorted.filter(e => !targetIds.has(e.id)).slice(0, 3);

  return { focus: FOCUS_TYPES.SMALL, targets, extras, remainingMin: remaining, availableMin };
}

// A couple medium-sized tasks (1–3 hrs each), total not exceeding 5 hrs.
function resolveMediumFocus(enemies, availableMin) {
  const cap    = Math.min(availableMin, 300);
  const medium = [...enemies]
    .filter(e => { const m = getMin(e); return m >= 60 && m <= 180; })
    .sort((a, b) => getMin(a) - getMin(b));

  const targets = [];
  let total     = 0;

  for (const enemy of medium) {
    const cost = getMin(enemy);
    if (total + cost <= cap) { targets.push(enemy); total += cost; }
    if (targets.length >= 4) break;
  }

  // Fallback: if no medium enemies exist, pick whatever is closest to 2 hrs
  if (targets.length === 0) {
    const fallback = [...enemies].sort((a, b) => Math.abs(getMin(a) - 120) - Math.abs(getMin(b) - 120));
    for (const enemy of fallback) {
      const cost = getMin(enemy);
      if (total + cost <= cap) { targets.push(enemy); total += cost; }
      if (targets.length >= 3) break;
    }
  }

  return { focus: FOCUS_TYPES.MEDIUM, targets, totalMin: total, availableMin };
}

// All available time dedicated to the single hardest enemy.
function resolveHeavyFocus(enemies, availableMin) {
  if (enemies.length === 0) return { focus: FOCUS_TYPES.HEAVY, targets: [], availableMin };
  const target = [...enemies].sort((a, b) => getMin(b) - getMin(a))[0];
  return { focus: FOCUS_TYPES.HEAVY, targets: [target], availableMin };
}

// A mix of low-min enemies (< 60 min) and heavier ones (≥ 60 min).
function resolveBalancedFocus(enemies, availableMin) {
  const low   = [...enemies].filter(e => getMin(e) <  60).sort((a, b) => getMin(a) - getMin(b));
  const heavy = [...enemies].filter(e => getMin(e) >= 60).sort((a, b) => getMin(a) - getMin(b));

  const targets = [];
  let total     = 0;

  for (const e of low) {
    if (targets.length >= 3) break;
    const cost = getMin(e);
    if (total + cost <= availableMin) { targets.push(e); total += cost; }
  }

  for (const e of heavy) {
    if (targets.filter(t => getMin(t) >= 60).length >= 2) break;
    const cost = getMin(e);
    if (total + cost <= availableMin) { targets.push(e); total += cost; }
  }

  return { focus: FOCUS_TYPES.BALANCED, targets, totalMin: total, availableMin };
}

// A little progress on each: five completely random tasks.
function resolveDividedFocus(enemies) {
  const targets = shuffle(enemies).slice(0, 5);
  return { focus: FOCUS_TYPES.DIVIDED, targets };
}

// ── Public entry point ──────────────────────────────────────────────────────

// resolveFocus(focus, enemies, spriteCount) → { focus, targets, ...extras }
// enemies: active battle calendar events; spriteCount: deployed sprite count (1 sprite = 1 hr)
export function resolveFocus(focus, enemies, spriteCount) {
  const availableMin = spriteCount * 60;
  switch (focus) {
    case FOCUS_TYPES.SMALL:    return resolveSmallFocus(enemies, availableMin);
    case FOCUS_TYPES.MEDIUM:   return resolveMediumFocus(enemies, availableMin);
    case FOCUS_TYPES.HEAVY:    return resolveHeavyFocus(enemies, availableMin);
    case FOCUS_TYPES.BALANCED: return resolveBalancedFocus(enemies, availableMin);
    case FOCUS_TYPES.DIVIDED:  return resolveDividedFocus(enemies, availableMin);
    default:                   return { focus, targets: [] };
  }
}
