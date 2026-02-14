
import { useState, useEffect } from 'react';

export interface UserIdentity {
  username: string;
  avatarSeed: string;
  userId: string;
  country: string;
  countryCode: string;
}

const GENERATED_NAMES = [
  'WordWizard', 'Speller', 'BeeMaster', 'LexiconLegend', 'AlphaAce', 
  'SpellBound', 'VocalVictor', 'OrthoStar', 'GlintSpeller', 'AzureAce',
  'GoldGrammar', 'SilentSolver', 'MightyMorpheme', 'EpicEnunciator',
  'ChampionSpeller', 'BeeKeepeer', 'VerbVanguard', 'PhonicPilot'
];

const COUNTRIES = [
  { name: 'Ghana', code: 'GH' },
  { name: 'Nigeria', code: 'NG' },
  { name: 'USA', code: 'US' },
  { name: 'UK', code: 'GB' },
  { name: 'South Africa', code: 'ZA' },
  { name: 'Canada', code: 'CA' },
  { name: 'Kenya', code: 'KE' }
];

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'user-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now();
};

const createNewIdentity = (): UserIdentity => {
  const randomName = GENERATED_NAMES[Math.floor(Math.random() * GENERATED_NAMES.length)];
  const randomCountry = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  const randomId = Math.floor(1000 + Math.random() * 9000);
  const uniqueId = generateId();
  
  return {
    username: `${randomName}_${randomId}`,
    avatarSeed: Math.random().toString(36).substring(7),
    userId: uniqueId,
    country: randomCountry.name,
    countryCode: randomCountry.code
  };
};

export const useUserIdentity = () => {
  // Initialize state directly from localStorage if available to avoid hydration flicker
  const [identity, setIdentity] = useState<UserIdentity | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('bee_user_identity');
      if (stored) return JSON.parse(stored);
      
      // If not stored, generate it now
      const newIdentity = createNewIdentity();
      localStorage.setItem('bee_user_identity', JSON.stringify(newIdentity));
      return newIdentity;
    } catch (e) {
      console.warn("Storage access or identity creation failed", e);
      // Fallback for private modes where localStorage is blocked
      return createNewIdentity();
    }
  });

  // Ensure consistency if multiple components use this hook
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'bee_user_identity' && e.newValue) {
        setIdentity(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
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
  const index = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

export const getCountryFlag = (code: string) => {
  if (!code) return 'https://flagcdn.com/w40/gh.png';
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
};
