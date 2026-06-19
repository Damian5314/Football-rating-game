// Centraal thema — huisstijl "Voorspel & Win".
// Kleuren, fonts, spacing en schaduwen op één plek.

export const colors = {
  primary: '#15C26B', // Pitch (primair groen)
  primaryDark: '#0B8C4D', // Deep
  ink: '#0E2A1E', // bijna-zwart groen (koppen/tekst)
  text: '#0E2A1E',
  muted: '#6B8478', // grijsgroen
  coin: '#FFC23C', // goud
  coinSoft: '#FFF3D6', // zachte gouden pill-achtergrond
  live: '#FF5A5F', // rood/koraal
  liveSoft: '#FFE3E4',
  bg: '#EAF4EC', // Mint achtergrond
  card: '#FFFFFF',
  cardSoft: '#F3FAF5', // zachte groen-tint kaart
  border: '#DCEAE0',
  white: '#FFFFFF',
};

// Lettertypes (geladen in App.js via @expo-google-fonts).
export const fonts = {
  heading: 'Fredoka_600SemiBold',
  headingBold: 'Fredoka_700Bold',
  headingMed: 'Fredoka_500Medium',
  body: 'Nunito_400Regular',
  bodyMed: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
  bodyExtra: 'Nunito_800ExtraBold',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };

export const shadow = {
  shadowColor: '#0E2A1E',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 3,
};

export const shadowSoft = {
  shadowColor: '#0E2A1E',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 6,
  elevation: 2,
};
