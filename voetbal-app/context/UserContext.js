import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import {
  ensureUserProfile,
  subscribeUserProfile,
  changeCoins,
  updateUserProfile,
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

  const value = {
    profile,
    loadingProfile,
    coins: profile?.coins ?? 0,
    points: profile?.points ?? 0,
    // Helpers (uid veilig afgeleid van de ingelogde gebruiker)
    addCoins: (delta) => user && changeCoins(user.uid, delta),
    updateProfile: (data) => user && updateUserProfile(user.uid, data),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
