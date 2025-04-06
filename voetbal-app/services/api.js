import axios from 'axios';

const API_KEY = '0e70c974ffmsh29d5107dbf05cb1p145d19jsn5d7af76e4a93';
const API_HOST = 'api-football-v1.p.rapidapi.com';

const api = axios.create({
  baseURL: 'https://api-football-v1.p.rapidapi.com/v3',
  headers: {
    'x-rapidapi-key': API_KEY,
    'x-rapidapi-host': API_HOST,
  },
});

// 🔥 Functie om leagues op te halen
export const getLeagues = async () => {
  const response = await api.get('/leagues');
  return response.data.response;
};

// 🔥 Functie om wedstrijden van vandaag op te halen
export const getTodayMatches = async () => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const response = await api.get(`/fixtures?date=${today}`);
  return response.data.response;
};
