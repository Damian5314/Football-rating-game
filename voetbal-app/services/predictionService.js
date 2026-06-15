// Firestore-laag voor voorspellingen: users/{uid}/predictions/{fixtureId}
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

const predRef = (uid, fixtureId) =>
  doc(db, 'users', uid, 'predictions', String(fixtureId));
const predCol = (uid) => collection(db, 'users', uid, 'predictions');

// Sla een voorspelling op (of werk hem bij). We bewaren een compacte snapshot
// van de wedstrijd zodat het overzicht ook zonder API-call te tonen is.
// Teamlogo's slaan we NIET op (die bevatten de API-key); we bewaren team-id's.
export const savePrediction = (uid, match, homeScore, awayScore) =>
  setDoc(
    predRef(uid, match.id),
    {
      fixtureId: match.id,
      homeScore,
      awayScore,
      status: 'pending', // pending | scored
      awardedPoints: null,
      actual: null,
      match: {
        homeId: match.home.id,
        homeName: match.home.name,
        awayId: match.away.id,
        awayName: match.away.name,
        tournamentName: match.tournamentName,
        startTimestamp: match.startTimestamp,
        timestamp: match.timestamp,
      },
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

export const getPrediction = async (uid, fixtureId) => {
  const snap = await getDoc(predRef(uid, fixtureId));
  return snap.exists() ? snap.data() : null;
};

export const getAllPredictions = async (uid) => {
  const snap = await getDocs(query(predCol(uid), orderBy('match.timestamp', 'desc')));
  return snap.docs.map((d) => d.data());
};

export const subscribePredictions = (uid, cb) =>
  onSnapshot(predCol(uid), (snap) => cb(snap.docs.map((d) => d.data())));

// Markeer een voorspelling als afgerekend (door de scoring in Fase 3).
export const markPredictionScored = (uid, fixtureId, actual, awardedPoints) =>
  setDoc(
    predRef(uid, fixtureId),
    { status: 'scored', actual, awardedPoints },
    { merge: true }
  );
