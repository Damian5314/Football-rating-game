# Roadmap — Voetbal voorspel-app ⚽

Een React Native (Expo) app waar je met vrienden voetbaluitslagen voorspelt,
punten verdient en die punten uitgeeft aan cosmetics voor je profiel/avatar.

> **Status (15-06-2026):** Fase 0 t/m 5 zijn gebouwd ✅. Data komt nu van SportAPI
> (sportapi7/Sofascore). Scoring is client-side (5/2/0). Nog te doen: Fase 6 & 7.

## Hoe starten (door jou)
1. `cd voetbal-app && npm install`
2. Maak `voetbal-app/.env` aan (zie `.env.example`) met je Firebase-config en
   `RAPIDAPI_KEY` / `RAPIDAPI_HOST=sportapi7.p.rapidapi.com`.
3. Zet in Firebase aan: **Authentication → Email/Password** en **Firestore Database**.
4. Plak `voetbal-app/firestore.rules` in **Firestore → Rules** en publiceer.
5. `npx expo start` en scan de QR met Expo Go (of `a`/`i` voor emulator).

## Uitgangspunten
- **Scoring**: exacte score = **5 punten**, juiste richting (1/X/2) = **2 punten**, fout = **0**. (Later te tunen.)
- **Data**: wedstrijden via RapidAPI (SportAPI / sportapi7, Sofascore-data); gebruikersdata via Firebase (Auth + Firestore).
- **Werkwijze**: per fase eerst een deelplan → goedkeuren → bouwen.
- **Secrets** staan in een lokale `.env` (nooit committen). Zie `.env.example`.

---

## Fase 0 ✅ — App weer werkend krijgen (blokkers)
> Doel: van "start niet / crasht" naar "draait stabiel". Geen nieuwe features.

- [x] `.env` + `.env.example` aanmaken (Firebase-keys + RapidAPI-key/host)
- [x] RapidAPI-key uit `services/api.js` halen → naar `.env` (**en key rouleren**, staat in git-historie)
- [x] `getAnalytics` verwijderen uit `firebaseConfig.js` (crasht in React Native)
- [x] Auth-persistence: `getAuth` → `initializeAuth` met AsyncStorage (ingelogd blijven na herstart)
- [x] Auth loading-state in `AuthContext` (splash/spinner i.p.v. flits van loginscherm)
- [x] Home omzetten naar Stack-navigator zodat een wedstrijd-detailscherm bestaat (`MatchDetail`-crash weg)
- [x] Uitlog-knop toevoegen

**Nodig van jou:** Firebase-configwaarden + (geroteerde) RapidAPI-key in `.env`.

---

## Fase 1 ✅ — Fundering: Firestore-datamodel + persistente coins
> Doel: echte gebruikersdata i.p.v. lokale `useState` en `randomuser.me`.

- [x] Firestore-datamodel opzetten (zie schema onderaan)
- [x] Bij registratie een `users/{uid}`-document aanmaken (startcoins, username, default avatar)
- [x] Coins persistent maken (weg met `useState(220)` in `App.js`) via een UserContext
- [x] Firestore security rules schrijven (alleen eigen doc; punten/coins niet client-side ophogen)

---

## Fase 2 ✅ — Voorspellen (kern van de game)
> Doel: op een wedstrijd tikken → score voorspellen → opslaan.

- [x] Voorspel-scherm (MatchDetail): teams, tijd, league + invoer thuis/uit-score, opslaan
- [x] Deadline-logica: voorspellen alleen vóór aftrap, daarna read-only
- [x] Status in HomeScreen: voorspeld / niet voorspeld / afgelopen
- [x] PredictionScreen echt maken: lijst eigen voorspellingen + uitkomst

---

## Fase 3 ✅ — Uitslagen verwerken & punten toekennen
> Doel: na afloop voorspelling vs. echte uitslag → punten (5/2/0). Gevoeligst qua betrouwbaarheid.

- [x] **Beslissing:** Cloud Function (aanbevolen, Blaze-plan) of client-side afrekenen
- [x] Resultaten ophalen voor afgelopen wedstrijden
- [x] Punten berekenen volgens scoringsmodel en toekennen aan `points` + coins
- [x] Voorspelling markeren als afgerekend (`awardedPoints`, status)

---

## Fase 4 ✅ — Store & cosmetics
> Doel: coins uitgeven aan echte cosmetics en die tonen op je profiel.

- [x] Cosmetics-catalogus definiëren (id, naam, prijs, type)
- [x] StoreScreen ombouwen: echte items, kopen kost coins + saldocheck, naar `ownedCosmetics`
- [x] Cosmetic uitrusten/toepassen → zichtbaar op profiel/avatar
- [x] **Beslissing:** welke cosmetic-types (frames/badges/kleuren/…) + richtprijzen

---

## Fase 5 ✅ — Profiel echt maken
- [x] Avatar/username uit `users`-doc i.p.v. `randomuser.me`
- [x] Echte stats uit Firestore i.p.v. hardcoded 70/20/5
- [x] Gekochte/uitgeruste cosmetics tonen

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

## Open beslissingen
_Beslist:_ scoring = uitslag+richting (5/2/0); Fase 3 = client-side; cosmetics = frames/personages/badges/naamkleuren. _Nog open:_
1. Fase 3: Cloud Function (Blaze) of client-side afrekenen?
2. Fase 4: welke cosmetic-types + richtprijzen?
3. Fase 6: "Leagues" = vriendencompetities of echte competitie-standen?
4. Username vrij kiezen bij registratie — akkoord?
