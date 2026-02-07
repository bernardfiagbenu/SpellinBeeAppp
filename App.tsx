
import React, { useEffect, useState, useMemo } from 'react';
import { Header } from './components/Header';
import { SpellingGame } from './components/SpellingGame';
import { WordListView } from './components/WordListView';
import { wordList } from './data/wordList';
import { Difficulty, SpellingWord } from './types';
import { Shuffle, Hexagon, ArrowDownAZ, Trash2 } from 'lucide-react';

type ViewState = 'GAME' | 'LIST';
type SessionDifficulty = Difficulty | 'ALL';
type SessionOrder = 'ALPHA' | 'RANDOM';

interface SessionConfig {
  difficulty: SessionDifficulty;
  order: SessionOrder;
  letter: string | null;
}

const shuffleArray = (array: SpellingWord[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const beeLevels = [Difficulty.ONE_BEE, Difficulty.TWO_BEE, Difficulty.THREE_BEE];
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

// Helper to create a unique ID for each word
const getWordId = (word: SpellingWord) => `${word.difficulty}:${word.word.toLowerCase()}`;

function App() {
  const [loading, setLoading] = useState(true);
  const [initialIndex, setInitialIndex] = useState(0);
  const [currentView, setCurrentView] = useState<ViewState>('GAME');
  const [sessionConfig, setSessionConfig] = useState<SessionConfig>({ 
    difficulty: Difficulty.ONE_BEE, 
    order: 'ALPHA',
    letter: null 
  });
  const [activeWordList, setActiveWordList] = useState<SpellingWord[]>([]);
  const [solvedWordIds, setSolvedWordIds] = useState<Set<string>>(new Set());

  // Load solved words from cache on mount
  useEffect(() => {
    const cached = localStorage.getItem('bee_judge_solved_ids');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setSolvedWordIds(new Set(parsed));
      } catch (e) {
        console.error("Failed to load solved words cache", e);
      }
    }
  }, []);

  const wordCounts = useMemo(() => ({
    ALL: wordList.length,
    [Difficulty.ONE_BEE]: wordList.filter(w => w.difficulty === Difficulty.ONE_BEE).length,
    [Difficulty.TWO_BEE]: wordList.filter(w => w.difficulty === Difficulty.TWO_BEE).length,
    [Difficulty.THREE_BEE]: wordList.filter(w => w.difficulty === Difficulty.THREE_BEE).length,
  }), []);

  useEffect(() => {
    setLoading(true);
    let words: SpellingWord[] = [];
    const { difficulty, order, letter } = sessionConfig;

    if (difficulty === 'ALL') {
      words = [...wordList];
    } else {
      words = wordList.filter(w => w.difficulty === difficulty);
    }

    if (letter) {
      words = words.filter(w => w.word.toLowerCase().startsWith(letter.toLowerCase()));
    }

    if (difficulty === 'ALL' && !letter) {
      words = shuffleArray(words);
    } else {
      if (order === 'ALPHA') {
        words.sort((a, b) => a.word.localeCompare(b.word));
      } else {
        words = shuffleArray(words);
      }
    }

    setActiveWordList(words);
    
    // When filters change, specifically the letter or level, we start from word 1 (index 0)
    // as requested by the user.
    setInitialIndex(0);
    setLoading(false);
  }, [sessionConfig.difficulty, sessionConfig.letter, sessionConfig.order]);

  const handleWordSolved = (word: SpellingWord) => {
    const id = getWordId(word);
    setSolvedWordIds(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('bee_judge_solved_ids', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const resetAllProgress = () => {
    if (confirm("Are you sure you want to clear all solved word progress?")) {
      setSolvedWordIds(new Set());
      localStorage.removeItem('bee_judge_solved_ids');
    }
  };

  const getSessionTitle = () => {
    const { difficulty, letter } = sessionConfig;
    const prefix = difficulty === 'ALL' ? "Champion's Mix" : difficulty;
    const letterSuffix = letter ? ` - Letter ${letter}` : '';
    return `${prefix}${letterSuffix}`;
  };

  const updateLetter = (letter: string | null) => {
    setSessionConfig(prev => ({ ...prev, letter }));
  };

  if (loading && activeWordList.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#fdb714]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-grow flex flex-col items-center justify-start pt-8 md:pt-10 pb-12 px-4 w-full">
        
        <div className="w-full max-w-5xl mb-10 space-y-8">
          <div className="flex flex-col md:flex-row md:justify-center items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Master List</h3>
              <button
                onClick={() => setSessionConfig({ difficulty: 'ALL', order: 'RANDOM', letter: null })}
                className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-all transform hover:-translate-y-0.5 w-64 justify-center border-2 ${
                  sessionConfig.difficulty === 'ALL' && !sessionConfig.letter
                    ? 'bg-black text-[#fdb714] border-black shadow-xl'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-black hover:text-black'
                }`}
              >
                <Shuffle className="w-4 h-4" />
                Random Mix <span className="text-[10px] ml-1 px-1.5 py-0.5 bg-slate-100 text-slate-500">{wordCounts.ALL}</span>
              </button>
            </div>
            
            <div className="flex justify-center gap-4">
              {beeLevels.map(level => (
                <div key={level} className="flex flex-col items-center gap-2">
                  <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
                    <Hexagon className="w-3 h-3 text-[#fdb714]"/> {level}
                  </h3>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setSessionConfig(prev => ({ ...prev, difficulty: level, order: 'ALPHA' }))}
                      className={`flex items-center gap-2 px-4 py-2 font-bold text-xs transition-colors w-40 justify-center border ${
                        sessionConfig.difficulty === level && sessionConfig.order === 'ALPHA'
                          ? 'bg-black text-[#fdb714] border-black shadow-lg'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-black hover:text-black'
                      }`}
                    >
                      <ArrowDownAZ className="w-4 h-4" /> Alphabetical
                    </button>
                     <button
                      onClick={() => setSessionConfig(prev => ({ ...prev, difficulty: level, order: 'RANDOM' }))}
                      className={`flex items-center gap-2 px-4 py-2 font-bold text-xs transition-colors w-40 justify-center border ${
                        sessionConfig.difficulty === level && sessionConfig.order === 'RANDOM'
                          ? 'bg-black text-[#fdb714] border-black shadow-lg'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-black hover:text-black'
                      }`}
                    >
                      <Shuffle className="w-4 h-4" /> Random
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50/80 p-6 border-y border-slate-200 backdrop-blur-sm">
             <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
                <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Jump to Alphabetical Group</h3>
                <div className="flex flex-wrap justify-center gap-1.5">
                  <button
                    onClick={() => updateLetter(null)}
                    className={`px-3 py-1.5 h-10 min-w-[50px] text-xs font-black transition-all border ${
                      !sessionConfig.letter
                        ? 'bg-black text-[#fdb714] border-black shadow-md'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-black'
                    }`}
                  >
                    ALL
                  </button>
                  {alphabet.map(letter => (
                    <button
                      key={letter}
                      onClick={() => updateLetter(letter)}
                      className={`flex items-center justify-center h-10 w-10 text-xs font-black transition-all border ${
                        sessionConfig.letter === letter
                          ? 'bg-black text-[#fdb714] border-black shadow-md'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-black'
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
             </div>
          </div>
        </div>

        {currentView === 'GAME' ? (
          <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="text-center mb-10">
               <div className="inline-flex items-center gap-2 mb-2">
                  <Hexagon className="w-5 h-5 text-[#fdb714] fill-[#fdb714]" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Stage Session</span>
                  <Hexagon className="w-5 h-5 text-[#fdb714] fill-[#fdb714]" />
               </div>
               <h2 className="text-4xl md:text-5xl font-black text-black mb-3 font-serif tracking-tight">
                 {getSessionTitle()}
               </h2>
               <p className="text-slate-500 font-medium">
                 {activeWordList.length > 0 ? `Word ${initialIndex + 1} of ${activeWordList.length}` : 'No words found in this selection'}
               </p>
             </div>
             
             {activeWordList.length > 0 ? (
               <SpellingGame 
                  key={`${sessionConfig.difficulty}-${sessionConfig.order}-${sessionConfig.letter}`}
                  words={activeWordList} 
                  initialIndex={initialIndex}
                  solvedWordIds={solvedWordIds}
                  onWordSolved={handleWordSolved}
               />
             ) : (
               <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-none">
                  <Hexagon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">No words start with "{sessionConfig.letter}" in this level</h3>
                  <button 
                    onClick={() => setSessionConfig(prev => ({ ...prev, letter: null }))}
                    className="mt-6 text-[#fdb714] bg-black px-6 py-2 font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform"
                  >
                    Clear Filter
                  </button>
               </div>
             )}
          </div>
        ) : (
          <div className="w-full animate-in fade-in slide-in-from-right-4 duration-500">
            <WordListView 
              words={activeWordList} 
              onBack={() => setCurrentView('GAME')}
              solvedWordIds={solvedWordIds}
            />
          </div>
        )}
      </main>
      
      <footer className="bg-black text-white py-12 border-t-8 border-[#fdb714] text-center mt-auto">
        <div className="max-w-4xl mx-auto px-4">
          <Hexagon className="w-10 h-10 text-[#fdb714] mx-auto mb-6" />
          <p className="font-serif font-bold text-2xl mb-2">Scripps National Spelling Bee</p>
          <p className="text-slate-400 text-xs uppercase tracking-[0.3em] mb-8">Official Words of the Champions 2026</p>
          
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="flex justify-center gap-8 text-[10px] uppercase tracking-widest font-bold text-slate-500">
               <span>Level: {sessionConfig.difficulty}</span>
               <span>Filter: {sessionConfig.letter || 'None'}</span>
               <span>Solved: {solvedWordIds.size}</span>
            </div>
            <button 
              onClick={resetAllProgress}
              className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-[0.2em]"
            >
              <Trash2 className="w-3 h-3" /> Reset Solved Progress
            </button>
          </div>

          <p className="text-slate-700 text-[10px]">© {new Date().getFullYear()} Scripps National Spelling Bee. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
