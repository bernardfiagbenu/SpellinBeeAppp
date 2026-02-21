export enum Difficulty {
  GRADE_2_4 = 'Grade 2-4',
  GRADE_5_9 = 'Grade 5-9'
}

export interface SpellingWord {
  word: string;
  definition: string;
  difficulty: Difficulty;
  pronunciation?: string;
  origin?: string;
  sentence?: string;
  partOfSpeech?: string;
  altSpelling?: string;
}

export type GameState = 'IDLE' | 'LISTENING' | 'CORRECT' | 'INCORRECT';