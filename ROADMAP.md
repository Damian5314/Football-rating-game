# Roadmap — Voetbal voorspel-app ⚽

Een React Native (Expo) app waar je met vrienden voetbaluitslagen voorspelt,
punten verdient en die punten uitgeeft aan cosmetics voor je profiel/avatar.

## Uitgangspunten
- **Scoring**: exacte score = **5 punten**, juiste richting (1/X/2) = **2 punten**, fout = **0**. (Later te tunen.)
- **Data**: wedstrijden via RapidAPI (API-Football); gebruikersdata via Firebase (Auth + Firestore).
- **Werkwijze**: per fase eerst een deelplan → goedkeuren → bouwen.
- **Secrets** staan in een lokale `.env` (nooit committen). Zie `.env.example`.

---

## Fase 0 — App weer werkend krijgen (blokkers)
> Doel: van "start niet / crasht" naar "draait stabiel". Geen nieuwe features.

- [ ] `.env` + `.env.example` aanmaken (Firebase-keys + RapidAPI-key/host)
- [ ] RapidAPI-key uit `services/api.js` halen → naar `.env` (**en key rouleren**, staat in git-historie)
- [ ] `getAnalytics` verwijderen uit `firebaseConfig.js` (crasht in React Native)
- [ ] Auth-persistence: `getAuth` → `initializeAuth` met AsyncStorage (ingelogd blijven na herstart)
- [ ] Auth loading-state in `AuthContext` (splash/spinner i.p.v. flits van loginscherm)
- [ ] Home omzetten naar Stack-navigator zodat een wedstrijd-detailscherm bestaat (`MatchDetail`-crash weg)
- [ ] Uitlog-knop toevoegen

**Nodig van jou:** Firebase-configwaarden + (geroteerde) RapidAPI-key in `.env`.

---

## Fase 1 — Fundering: Firestore-datamodel + persistente coins
> Doel: echte gebruikersdata i.p.v. lokale `useState` en `randomuser.me`.

- [ ] Firestore-datamodel opzetten (zie schema onderaan)
- [ ] Bij registratie een `users/{uid}`-document aanmaken (startcoins, username, default avatar)
- [ ] Coins persistent maken (weg met `useState(220)` in `App.js`) via een UserContext
- [ ] Firestore security rules schrijven (alleen eigen doc; punten/coins niet client-side ophogen)

---

## Fase 2 — Voorspellen (kern van de game)
> Doel: op een wedstrijd tikken → score voorspellen → opslaan.

- [ ] Voorspel-scherm (MatchDetail): teams, tijd, league + invoer thuis/uit-score, opslaan
- [ ] Deadline-logica: voorspellen alleen vóór aftrap, daarna read-only
- [ ] Status in HomeScreen: voorspeld / niet voorspeld / afgelopen
- [ ] PredictionScreen echt maken: lijst eigen voorspellingen + uitkomst

---

## Fase 3 — Uitslagen verwerken & punten toekennen
> Doel: na afloop voorspelling vs. echte uitslag → punten (5/2/0). Gevoeligst qua betrouwbaarheid.

- [ ] **Beslissing:** Cloud Function (aanbevolen, Blaze-plan) of client-side afrekenen
- [ ] Resultaten ophalen voor afgelopen wedstrijden
- [ ] Punten berekenen volgens scoringsmodel en toekennen aan `points` + coins
- [ ] Voorspelling markeren als afgerekend (`awardedPoints`, status)

---

## Fase 4 — Store & cosmetics
> Doel: coins uitgeven aan echte cosmetics en die tonen op je profiel.

- [ ] Cosmetics-catalogus definiëren (id, naam, prijs, type)
- [ ] StoreScreen ombouwen: echte items, kopen kost coins + saldocheck, naar `ownedCosmetics`
- [ ] Cosmetic uitrusten/toepassen → zichtbaar op profiel/avatar
- [ ] **Beslissing:** welke cosmetic-types (frames/badges/kleuren/…) + richtprijzen

---

## Fase 5 — Profiel echt maken
- [ ] Avatar/username uit `users`-doc i.p.v. `randomuser.me`
- [ ] Echte stats uit Firestore i.p.v. hardcoded 70/20/5
- [ ] Gekochte/uitgeruste cosmetics tonen

---

## Fase 6 — Sociaal: vrienden, leagues, ranglijst
- [ ] Vrienden toevoegen via username + verzoeken accepteren
- [ ] **Beslissing:** "Leagues" = vriendencompetities/ranglijst of echte competitie-standen?
- [ ] Leaderboard op punten (globaal en/of per vriendengroep)

---

## Fase 7 — Polish & robuustheid
- [ ] API-foutafhandeling/retry, lege staten ("geen wedstrijden vandaag"), caching (RapidAPI-limieten)
- [ ] Loading-skeletons, nette styling, dark/light
- [ ] Optioneel: TypeScript + tests rond scoring-logica

---

## Firestore-datamodel (voorstel)
```
users/{uid}
  username, avatarUrl, coins, points,
  stats: { viewed, correctPredictions, friends }
  ownedCosmetics: [cosmeticId, ...]
  equipped: { avatarFrame, badge, ... }

users/{uid}/predictions/{fixtureId}
  homeScore, awayScore, createdAt, status, awardedPoints

matchesCache/{fixtureId}   (optioneel; API-calls beperken)
friends / friendRequests   (Fase 6)
```

## Open beslissingen (mogen later)
1. Fase 3: Cloud Function (Blaze) of client-side afrekenen?
2. Fase 4: welke cosmetic-types + richtprijzen?
3. Fase 6: "Leagues" = vriendencompetities of echte competitie-standen?
4. Username vrij kiezen bij registratie — akkoord?
