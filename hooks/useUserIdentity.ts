
import { useState, useEffect } from 'react';

export interface UserIdentity {
  username: string;
  avatarSeed: string;
  userId: string;
  country: string;
  countryCode: string;
}

const GENERATED_NAMES = [
  'WordWizard', 'BeeMaster', 'LexiconLegend', 'AlphaAce', 
  'SpellBound', 'VocalVictor', 'OrthoStar', 'AzureAce',
  'GoldGrammar', 'SilentSolver', 'MightyMorpheme', 'EpicEnunciator',
  'ChampionSpeller', 'VerbVanguard', 'PhonicPilot'
];

const COUNTRIES = [
  { name: 'Ghana', code: 'GH' },
  { name: 'Nigeria', code: 'NG' },
  { name: 'USA', code: 'US' },
  { name: 'UK', code: 'GB' },
  { name: 'Canada', code: 'CA' },
  { name: 'Kenya', code: 'KE' }
];

const generateId = () => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch (e) {}
  return 'sp-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
};

const createNewIdentity = (): UserIdentity => {
  const randomName = GENERATED_NAMES[Math.floor(Math.random() * GENERATED_NAMES.length)];
  const randomCountry = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  const randomId = Math.floor(1000 + Math.random() * 8999);
  
  return {
    username: `${randomName}_${randomId}`,
    avatarSeed: Math.random().toString(36).substring(7),
    userId: generateId(),
    country: randomCountry.name,
    countryCode: randomCountry.code
  };
};

export const useUserIdentity = () => {
  // Synchronous initialization for zero-flicker on Netlify
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
      console.warn("LocalStorage blocked - using temporary session identity");
      return createNewIdentity();
    }
  });

  // Listen for storage changes across tabs
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
