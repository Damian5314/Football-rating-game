// Centrale spelinstellingen — op één plek zodat balans makkelijk te tunen is.

export const STARTING_COINS = 500;

// Scoring bij een afgeronde wedstrijd
export const SCORING = {
  EXACT: 5, // exacte uitslag goed (bv. 2-1 voorspeld én 2-1 geworden)
  DIRECTION: 2, // alleen juiste richting (1 / X / 2) goed
  WRONG: 0,
};

// Verdiende coins = 2× de verdiende punten (spelen levert munten op voor de store).
export const coinsForPoints = (points) => points * 2;

// Level-systeem: drempel (min punten) + naam per level.
export const LEVELS = [
  { level: 1, min: 0, name: 'Pupil' },
  { level: 2, min: 100, name: 'Talent' },
  { level: 3, min: 200, name: 'Uitblinker' },
  { level: 4, min: 300, name: 'Spelmaker' },
  { level: 5, min: 500, name: 'Topscorer' },
  { level: 6, min: 750, name: 'Aanvoerder' },
  { level: 7, min: 1000, name: 'Legende' },
];

// Bepaal het huidige level + voortgang naar het volgende.
export const getLevel = (points = 0) => {
  let current = LEVELS[0];
  for (const l of LEVELS) if (points >= l.min) current = l;
  const next = LEVELS.find((l) => l.min > current.min) || null;
  const pointsToNext = next ? next.min - points : 0;
  const span = next ? next.min - current.min : 1;
  const progress = next ? Math.min(1, (points - current.min) / span) : 1;
  return { ...current, next, pointsToNext, progress };
};

// Bepaal punten voor een voorspelling t.o.v. de echte uitslag.
export const scorePrediction = (pred, actual) => {
  if (
    pred == null ||
    actual == null ||
    actual.homeScore == null ||
    actual.awayScore == null
  ) {
    return SCORING.WRONG;
  }
  const exact =
    pred.homeScore === actual.homeScore && pred.awayScore === actual.awayScore;
  if (exact) return SCORING.EXACT;

  const dir = (h, a) => (h === a ? 'X' : h > a ? '1' : '2');
  const sameDirection =
    dir(pred.homeScore, pred.awayScore) ===
    dir(actual.homeScore, actual.awayScore);
  return sameDirection ? SCORING.DIRECTION : SCORING.WRONG;
};
