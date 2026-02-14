
import { useState, useEffect } from 'react';

export interface UserIdentity {
  username: string;
  avatarSeed: string;
  userId: string;
}

const GENERATED_NAMES = [
  'WordWizard', 'Speller', 'BeeMaster', 'LexiconLegend', 'AlphaAce', 
  'SpellBound', 'VocalVictor', 'OrthoStar', 'GlintSpeller', 'AzureAce',
  'GoldGrammar', 'SilentSolver', 'MightyMorpheme', 'EpicEnunciator'
];

export const useUserIdentity = () => {
  const [identity, setIdentity] = useState<UserIdentity | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('bee_user_identity');
    if (stored) {
      setIdentity(JSON.parse(stored));
    } else {
      const randomName = GENERATED_NAMES[Math.floor(Math.random() * GENERATED_NAMES.length)];
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const uniqueId = crypto.randomUUID();
      const newIdentity: UserIdentity = {
        username: `${randomName}_${randomId}`,
        avatarSeed: Math.random().toString(36).substring(7),
        userId: uniqueId
      };
      localStorage.setItem('bee_user_identity', JSON.stringify(newIdentity));
      setIdentity(newIdentity);
    }
  }, []);

  return identity;
};

// Simple hash-based avatar generation for UI use
export const getAvatarStyle = (seed: string) => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
    'bg-orange-500', 'bg-pink-500', 'bg-indigo-500', 
    'bg-amber-500', 'bg-teal-500'
  ];
  const index = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};
