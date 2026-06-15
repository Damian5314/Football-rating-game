// Centraal thema — kleuren, spacing en schaduwen op één plek zodat de hele
// app dezelfde look heeft.

export const colors = {
  primary: '#15803D', // groen
  primaryDark: '#166534',
  primaryLight: '#DCFCE7',
  accent: '#FBBF24', // goud (coins)
  bg: '#F1F5F9',
  card: '#FFFFFF',
  border: '#E5E7EB',
  text: '#0F172A',
  muted: '#64748B',
  live: '#DC2626',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

// Zachte schaduw voor kaarten (werkt op iOS en Android).
export const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 2,
};
