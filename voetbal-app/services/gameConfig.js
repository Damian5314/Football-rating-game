// Centrale spelinstellingen — op één plek zodat balans makkelijk te tunen is.

export const STARTING_COINS = 500;

// Scoring bij een afgeronde wedstrijd
export const SCORING = {
  EXACT: 5, // exacte uitslag goed (bv. 2-1 voorspeld én 2-1 geworden)
  DIRECTION: 2, // alleen juiste richting (1 / X / 2) goed
  WRONG: 0,
};

// Verdiende coins = verdiende punten (spelen levert munten op voor de store).
export const coinsForPoints = (points) => points;

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
