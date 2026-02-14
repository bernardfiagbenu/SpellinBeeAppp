
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

// Fallback for non-secure contexts where crypto.randomUUID might be missing
const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'user-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now();
};

export const useUserIdentity = () => {
  const [identity, setIdentity] = useState<UserIdentity | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bee_user_identity');
      if (stored) {
        setIdentity(JSON.parse(stored));
      } else {
        const randomName = GENERATED_NAMES[Math.floor(Math.random() * GENERATED_NAMES.length)];
        const randomCountry = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
        const randomId = Math.floor(1000 + Math.random() * 9000);
        const uniqueId = generateId();
        
        const newIdentity: UserIdentity = {
          username: `${randomName}_${randomId}`,
          avatarSeed: Math.random().toString(36).substring(7),
          userId: uniqueId,
          country: randomCountry.name,
          countryCode: randomCountry.code
        };
        
        localStorage.setItem('bee_user_identity', JSON.stringify(newIdentity));
        setIdentity(newIdentity);
      }
    } catch (e) {
      console.error("Identity generation failed", e);
    }
  }, []);

  return identity;
};

export const getAvatarStyle = (seed: string) => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
    'bg-orange-500', 'bg-pink-500', 'bg-indigo-500', 
    'bg-amber-500', 'bg-teal-500'
  ];
  const index = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

export const getCountryFlag = (code: string) => {
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
};
