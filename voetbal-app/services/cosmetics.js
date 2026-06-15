// Catalogus van cosmetics. `value` is een kleur (frame/naamkleur) of een emoji
// (badge/personage). Types worden los "uitgerust" via equipped[type].

export const COSMETIC_TYPES = {
  avatarFrame: 'Avatar-randen',
  character: 'Personages',
  badge: 'Badges',
  nameColor: 'Naamkleuren',
};

export const COSMETICS = [
  // Avatar-randen (gekleurde ring om de profielfoto)
  { id: 'frame_silver', type: 'avatarFrame', name: 'Zilveren rand', price: 150, value: '#C0C0C0' },
  { id: 'frame_red', type: 'avatarFrame', name: 'Rode rand', price: 200, value: '#E53935' },
  { id: 'frame_neon', type: 'avatarFrame', name: 'Neon rand', price: 250, value: '#39FF14' },
  { id: 'frame_gold', type: 'avatarFrame', name: 'Gouden rand', price: 300, value: '#FFD700' },

  // Personages (emoji-avatar i.p.v. foto)
  { id: 'char_ref', type: 'character', name: 'Scheidsrechter', price: 150, value: '🧑‍⚖️' },
  { id: 'char_striker', type: 'character', name: 'Spits', price: 200, value: '⚽' },
  { id: 'char_keeper', type: 'character', name: 'Keeper', price: 200, value: '🧤' },
  { id: 'char_trophy', type: 'character', name: 'Kampioen', price: 600, value: '🏆' },

  // Badges (klein insigne op je profiel)
  { id: 'badge_star', type: 'badge', name: 'Ster', price: 100, value: '⭐' },
  { id: 'badge_fire', type: 'badge', name: 'Vuur', price: 150, value: '🔥' },
  { id: 'badge_crown', type: 'badge', name: 'Kroon', price: 400, value: '👑' },
  { id: 'badge_goat', type: 'badge', name: 'GOAT', price: 500, value: '🐐' },

  // Naamkleuren
  { id: 'name_blue', type: 'nameColor', name: 'Blauwe naam', price: 120, value: '#1976D2' },
  { id: 'name_green', type: 'nameColor', name: 'Groene naam', price: 120, value: '#2E7D32' },
  { id: 'name_purple', type: 'nameColor', name: 'Paarse naam', price: 180, value: '#8E24AA' },
  { id: 'name_gold', type: 'nameColor', name: 'Gouden naam', price: 350, value: '#FFB300' },
];

export const getCosmeticById = (id) => COSMETICS.find((c) => c.id === id) || null;

export const cosmeticsByType = (type) => COSMETICS.filter((c) => c.type === type);
