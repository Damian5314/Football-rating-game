// Client-side afrekenen van voorspellingen.
// Bij app-openen vergelijken we afgelopen, nog niet afgerekende voorspellingen
// met de echte uitslag en kennen punten + coins toe.
//
// NB: dit draait in de client en is dus niet volledig fraudebestendig. Voor
// productie verplaats je dit naar een Cloud Function (zie ROADMAP, Fase 3).
import { getEventResult } from './api';
import { getAllPredictions, markPredictionScored } from './predictionService';
import { awardPointsAndCoins } from './userService';
import { scorePrediction, coinsForPoints } from './gameConfig';

// Een wedstrijd is normaal binnen ~2,5 uur afgelopen; pas daarna API bevragen.
const LIKELY_FINISHED_MS = 2.5 * 60 * 60 * 1000;

export const settlePredictions = async (uid) => {
  let preds;
  try {
    preds = await getAllPredictions(uid);
  } catch (e) {
    console.error('Voorspellingen ophalen mislukt:', e);
    return { settled: 0, totalPoints: 0 };
  }

  const now = Date.now();
  const pending = preds.filter(
    (p) =>
      p.status === 'pending' &&
      p.match?.startTimestamp &&
      p.match.startTimestamp * 1000 + LIKELY_FINISHED_MS < now
  );

  let settled = 0;
  let totalPoints = 0;

  for (const p of pending) {
    try {
      const result = await getEventResult(p.fixtureId);
      if (result.statusType !== 'finished' || result.homeScore == null) continue;

      const actual = { homeScore: result.homeScore, awayScore: result.awayScore };
      const points = scorePrediction(p, actual);

      // Eerst markeren als afgerekend (voorkomt dubbel toekennen bij herhaald draaien),
      // daarna pas punten/coins toekennen.
      await markPredictionScored(uid, p.fixtureId, actual, points);
      if (points > 0) {
        await awardPointsAndCoins(uid, points, coinsForPoints(points));
      }

      settled++;
      totalPoints += points;
    } catch (e) {
      console.error('Afrekenen mislukt voor wedstrijd', p.fixtureId, e);
    }
  }

  return { settled, totalPoints };
};
