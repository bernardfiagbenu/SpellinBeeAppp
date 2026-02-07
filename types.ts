export enum Difficulty {
  ONE_BEE = 'One Bee',
  TWO_BEE = 'Two Bee',
  THREE_BEE = 'Three Bee'
}

export interface SpellingWord {
  word: string;
  definition: string;
  difficulty: Difficulty;
  partOfSpeech?: string; // Optional extension
  altSpelling?: string; // For British/American variations
}

export type GameState = 'IDLE' | 'LISTENING' | 'CORRECT' | 'INCORRECT';