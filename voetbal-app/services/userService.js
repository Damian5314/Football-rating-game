// Firestore-laag voor het gebruikersprofiel.
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  updateDoc,
  increment,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { STARTING_COINS } from './gameConfig';

const userRef = (uid) => doc(db, 'users', uid);

// Standaard username afleiden uit het e-mailadres.
const defaultUsername = (user) =>
  (user.email ? user.email.split('@')[0] : 'speler') + '';

// Maakt het profiel aan als het nog niet bestaat. Idempotent: bestaande
// gebruikers (zonder doc) krijgen er ook één.
export const ensureUserProfile = async (user) => {
  const ref = userRef(user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();

  const profile = {
    uid: user.uid,
    email: user.email || null,
    username: defaultUsername(user),
    avatarUrl: null,
    coins: STARTING_COINS,
    points: 0,
    stats: { viewed: 0, correctPredictions: 0, friends: 0 },
    ownedCosmetics: [],
    equipped: { avatarFrame: null, badge: null, nameColor: null, character: null },
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, profile);
  return profile;
};

// Realtime abonnement op het profiel.
export const subscribeUserProfile = (uid, cb) =>
  onSnapshot(userRef(uid), (snap) => cb(snap.exists() ? snap.data() : null));

// Profielvelden bijwerken (bv. username, avatarUrl, equipped).
export const updateUserProfile = (uid, data) =>
  updateDoc(userRef(uid), data);

// Coins verhogen/verlagen (delta mag negatief zijn).
export const changeCoins = (uid, delta) =>
  updateDoc(userRef(uid), { coins: increment(delta) });

// Punten + coins toekennen na een correcte voorspelling.
export const awardPointsAndCoins = (uid, points, coins) =>
  updateDoc(userRef(uid), {
    points: increment(points),
    coins: increment(coins),
    'stats.correctPredictions': increment(points > 0 ? 1 : 0),
  });

// Cosmetic kopen: voeg toe aan bezit en trek de prijs van de coins af.
// (Affordability/bezit-check gebeurt in de UI vóór deze call.)
export const buyCosmetic = (uid, cosmeticId, price) =>
  updateDoc(userRef(uid), {
    ownedCosmetics: arrayUnion(cosmeticId),
    coins: increment(-price),
  });

// Cosmetic uitrusten of weghalen (cosmeticId = null om te verwijderen).
export const equipCosmetic = (uid, type, cosmeticId) =>
  updateDoc(userRef(uid), { [`equipped.${type}`]: cosmeticId });
