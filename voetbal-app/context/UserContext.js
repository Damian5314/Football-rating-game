import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import {
  ensureUserProfile,
  subscribeUserProfile,
  changeCoins,
  updateUserProfile,
  buyCosmetic,
  equipCosmetic,
} from '../services/userService';
import { settlePredictions } from '../services/scoringService';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoadingProfile(false);
      return;
    }

    let unsub = () => {};
    let active = true;
    setLoadingProfile(true);

    (async () => {
      try {
        await ensureUserProfile(user);
        if (!active) return;
        unsub = subscribeUserProfile(user.uid, (data) => {
          setProfile(data);
          setLoadingProfile(false);
        });
        // Afgelopen voorspellingen afrekenen (punten + coins). Fire-and-forget;
        // het profiel-abonnement hierboven toont de nieuwe stand vanzelf.
        settlePredictions(user.uid).catch((e) =>
          console.error('Afrekenen mislukt:', e)
        );
      } catch (e) {
        console.error('Profiel laden mislukt:', e);
        setLoadingProfile(false);
      }
    })();

    return () => {
      active = false;
      unsub();
    };
  }, [user]);

  const ownedCosmetics = profile?.ownedCosmetics ?? [];
  const equipped = profile?.equipped ?? {};

  const value = {
    profile,
    loadingProfile,
    coins: profile?.coins ?? 0,
    points: profile?.points ?? 0,
    ownedCosmetics,
    equipped,
    // Helpers (uid veilig afgeleid van de ingelogde gebruiker)
    addCoins: (delta) => user && changeCoins(user.uid, delta),
    updateProfile: (data) => user && updateUserProfile(user.uid, data),
    // Koop een cosmetic als je 'm nog niet hebt én genoeg coins hebt.
    purchaseCosmetic: (cosmetic) => {
      if (!user) return Promise.reject(new Error('Niet ingelogd'));
      if (ownedCosmetics.includes(cosmetic.id)) {
        return Promise.reject(new Error('Al in bezit'));
      }
      if ((profile?.coins ?? 0) < cosmetic.price) {
        return Promise.reject(new Error('Niet genoeg coins'));
      }
      return buyCosmetic(user.uid, cosmetic.id, cosmetic.price);
    },
    equip: (type, cosmeticId) => user && equipCosmetic(user.uid, type, cosmeticId),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
