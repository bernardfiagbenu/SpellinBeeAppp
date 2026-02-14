
import { useState, useEffect } from 'react';

export interface UserIdentity {
  username: string;
  avatarSeed: string;
  userId: string;
  country: string;
  countryCode: string;
  ipAddress?: string;
}

const GENERATED_NAMES = [
  'WordWizard', 'BeeMaster', 'LexiconLegend', 'AlphaAce', 
  'SpellBound', 'VocalVictor', 'OrthoStar', 'AzureAce',
  'GoldGrammar', 'SilentSolver', 'MightyMorpheme', 'EpicEnunciator',
  'ChampionSpeller', 'VerbVanguard', 'PhonicPilot'
];

const generateId = () => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch (e) {}
  return 'sp-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
};

const createNewIdentity = (country = 'Ghana', code = 'GH'): UserIdentity => {
  const randomName = GENERATED_NAMES[Math.floor(Math.random() * GENERATED_NAMES.length)];
  const randomId = Math.floor(1000 + Math.random() * 8999);
  
  return {
    username: `${randomName}_${randomId}`,
    avatarSeed: Math.random().toString(36).substring(7),
    userId: generateId(),
    country: country,
    countryCode: code
  };
};

export const useUserIdentity = () => {
  const [identity, setIdentity] = useState<UserIdentity>(() => {
    if (typeof window === 'undefined') return createNewIdentity();
    
    try {
      const stored = localStorage.getItem('bee_user_identity');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.userId) return parsed;
      }
      
      const newId = createNewIdentity();
      localStorage.setItem('bee_user_identity', JSON.stringify(newId));
      return newId;
    } catch (e) {
      return createNewIdentity();
    }
  });

  // Fetch Country by IP
  useEffect(() => {
    const detectLocation = async () => {
      // Only fetch if country hasn't been set by IP yet or if it's the default
      // We check a flag to avoid repeated lookups if it's already "verified"
      const isVerified = localStorage.getItem('bee_identity_verified') === 'true';
      if (isVerified) return;

      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data && data.country_name && data.country_code) {
          setIdentity(prev => {
            const updated = {
              ...prev,
              country: data.country_name,
              countryCode: data.country_code,
              ipAddress: data.ip
            };
            localStorage.setItem('bee_user_identity', JSON.stringify(updated));
            localStorage.setItem('bee_identity_verified', 'true');
            return updated;
          });
        }
      } catch (e) {
        console.warn("Location detection failed, using defaults", e);
      }
    };

    detectLocation();
  }, []);

  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key === 'bee_user_identity' && e.newValue) {
        try { setIdentity(JSON.parse(e.newValue)); } catch (err) {}
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  return identity;
};

export const getAvatarStyle = (seed: string) => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
    'bg-orange-500', 'bg-pink-500', 'bg-indigo-500', 
    'bg-amber-500', 'bg-teal-500'
  ];
  if (!seed) return colors[0];
  const charSum = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[charSum % colors.length];
};

export const getCountryFlag = (code: string) => {
  return `https://flagcdn.com/w40/${(code || 'gh').toLowerCase()}.png`;
};
