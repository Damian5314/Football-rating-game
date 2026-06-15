import axios from 'axios';
import { RAPIDAPI_KEY, RAPIDAPI_HOST } from '@env';

// SportAPI (sportapi7 op RapidAPI, Sofascore-data)
const api = axios.create({
  baseURL: `https://${RAPIDAPI_HOST}/api/v1`,
  headers: {
    'x-rapidapi-key': RAPIDAPI_KEY,
    'x-rapidapi-host': RAPIDAPI_HOST,
  },
});

// Competities die we tonen (uniqueTournament.id van Sofascore)
export const ALLOWED_TOURNAMENTS = {
  16: 'FIFA World Cup',
  1: 'UEFA Euro',
  7: 'Champions League',
  679: 'Europa League',
  17: 'Premier League',
  8: 'LaLiga',
  35: 'Bundesliga',
  23: 'Serie A',
  34: 'Ligue 1',
  37: 'Eredivisie',
};
const ALLOWED_IDS = Object.keys(ALLOWED_TOURNAMENTS).map(Number);

// Teamlogo: het RapidAPI-image-endpoint vereist de auth-headers,
// dus we geven een { uri, headers }-object terug dat <Image source={...}> begrijpt.
export const teamLogo = (teamId) => ({
  uri: `https://${RAPIDAPI_HOST}/api/v1/team/${teamId}/image`,
  headers: {
    'x-rapidapi-key': RAPIDAPI_KEY,
    'x-rapidapi-host': RAPIDAPI_HOST,
  },
});

// Zet een ruwe Sofascore-event om naar een simpel, stabiel object voor de UI.
export const normalizeEvent = (e) => ({
  id: e.id,
  timestamp: (e.startTimestamp || 0) * 1000, // ms
  startTimestamp: e.startTimestamp || 0, // seconden
  statusType: e.status?.type || 'notstarted', // notstarted | inprogress | finished
  statusText: e.status?.description || '',
  tournamentId: e.tournament?.uniqueTournament?.id ?? null,
  tournamentName:
    e.tournament?.uniqueTournament?.name || e.tournament?.name || 'Onbekend',
  home: {
    id: e.homeTeam?.id,
    name: e.homeTeam?.name || '?',
    logo: e.homeTeam?.id ? teamLogo(e.homeTeam.id) : null,
  },
  away: {
    id: e.awayTeam?.id,
    name: e.awayTeam?.name || '?',
    logo: e.awayTeam?.id ? teamLogo(e.awayTeam.id) : null,
  },
  homeScore: e.homeScore?.current ?? null,
  awayScore: e.awayScore?.current ?? null,
});

// YYYY-MM-DD
const toDateString = (d) => d.toISOString().split('T')[0];

// Wedstrijden voor een specifieke datum (default: vandaag), gefilterd op onze competities.
export const getMatchesByDate = async (date = new Date()) => {
  const dateStr = typeof date === 'string' ? date : toDateString(date);
  const { data } = await api.get(`/sport/football/scheduled-events/${dateStr}`);
  const events = (data?.events || []).map(normalizeEvent);
  const filtered = events.filter((e) => ALLOWED_IDS.includes(e.tournamentId));
  // Sorteer op begintijd
  return filtered.sort((a, b) => a.startTimestamp - b.startTimestamp);
};

// Alias voor backwards-compat / leesbaarheid
export const getTodayMatches = () => getMatchesByDate(new Date());

// Live football events (gefilterd op onze competities).
export const getLiveMatches = async () => {
  const { data } = await api.get('/sport/football/events/live');
  return (data?.events || [])
    .map(normalizeEvent)
    .filter((e) => ALLOWED_IDS.includes(e.tournamentId));
};

// Eindresultaat van één wedstrijd ophalen (voor het afrekenen van voorspellingen).
export const getEventResult = async (eventId) => {
  const { data } = await api.get(`/event/${eventId}`);
  return normalizeEvent(data?.event || {});
};
