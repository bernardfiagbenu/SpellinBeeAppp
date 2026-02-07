import React, { useEffect, useState, useMemo } from 'react';
import { Header } from './components/Header';
import { SpellingGame } from './components/SpellingGame';
import { WordListView } from './components/WordListView';
import { LegalModal } from './components/LegalModal';
import { wordList } from './data/wordList';
import { Difficulty, SpellingWord } from './types';
import { Shuffle, Hexagon, ArrowDownAZ, Trash2, LayoutGrid, ListFilter } from 'lucide-react';

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

const getWordId = (word: SpellingWord) => `${word.difficulty}:${word.word.toLowerCase()}`;

function App() {
  const [loading, setLoading] = useState(true);
  const [hasConsent, setHasConsent] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);
  const [currentView, setCurrentView] = useState<ViewState>('GAME');
  const [sessionConfig, setSessionConfig] = useState<SessionConfig>({ 
    difficulty: Difficulty.ONE_BEE, 
    order: 'ALPHA',
    letter: null 
  });
  const [activeWordList, setActiveWordList] = useState<SpellingWord[]>([]);
  const [solvedWordIds, setSolvedWordIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const cachedConsent = localStorage.getItem('js_gh_consent_accepted');
    if (cachedConsent === 'true') setHasConsent(true);

    const cachedSolved = localStorage.getItem('bee_judge_solved_ids');
    if (cachedSolved) {
      try {
        setSolvedWordIds(new Set(JSON.parse(cachedSolved)));
      } catch (e) { console.error(e); }
    }
    setLoading(false);
  }, []);

  const handleAcceptConsent = () => {
    setHasConsent(true);
    localStorage.setItem('js_gh_consent_accepted', 'true');
  };

  const wordCounts = useMemo(() => ({
    ALL: wordList.length,
    [Difficulty.ONE_BEE]: wordList.filter(w => w.difficulty === Difficulty.ONE_BEE).length,
    [Difficulty.TWO_BEE]: wordList.filter(w => w.difficulty === Difficulty.TWO_BEE).length,
    [Difficulty.THREE_BEE]: wordList.filter(w => w.difficulty === Difficulty.THREE_BEE).length,
  }), []);

  useEffect(() => {
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
    setInitialIndex(0);
  }, [sessionConfig]);

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
    if (confirm("Reset all solved word progress? This cannot be undone.")) {
      setSolvedWordIds(new Set());
      localStorage.removeItem('bee_judge_solved_ids');
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900">
      {!hasConsent && <LegalModal onAccept={handleAcceptConsent} />}
      
      <Header currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-grow flex flex-col items-center justify-start py-6 px-4 w-full max-w-5xl mx-auto overflow-x-hidden">
        
        {/* Session Config - Mobile Optimized */}
        <div className="w-full space-y-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {/* Master Mix Card */}
             <div className="md:col-span-1 bg-slate-50 border-2 border-[#003366]/10 p-4 rounded-xl flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Competition Mix</span>
                <button
                  onClick={() => setSessionConfig({ difficulty: 'ALL', order: 'RANDOM', letter: null })}
                  className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-all w-full justify-center rounded-lg ${
                    sessionConfig.difficulty === 'ALL' && !sessionConfig.letter
                      ? 'bg-[#003366] text-[#FFD700] shadow-lg'
                      : 'bg-white text-slate-700 border border-slate-200 shadow-sm'
                  }`}
                >
                  <Shuffle className="w-4 h-4" />
                  GRAND FINALE MIX
                </button>
             </div>

             {/* Bee Levels Filter */}
             <div className="md:col-span-2 bg-slate-50 border-2 border-[#003366]/10 p-4 rounded-xl flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Challenge Level</span>
                  <ListFilter className="w-4 h-4 text-slate-300" />
                </div>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {beeLevels.map(level => (
                    <button
                      key={level}
                      onClick={() => setSessionConfig(prev => ({ ...prev, difficulty: level, order: 'ALPHA' }))}
                      className={`flex-1 min-w-[100px] flex flex-col items-center gap-1 p-3 font-bold text-xs transition-all border-2 rounded-lg ${
                        sessionConfig.difficulty === level
                          ? 'bg-[#003366] text-[#FFD700] border-[#003366] shadow-md scale-[1.02]'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-[#003366]'
                      }`}
                    >
                      <Hexagon className={`w-5 h-5 ${sessionConfig.difficulty === level ? 'fill-[#FFD700]' : ''}`} />
                      {level}
                    </button>
                  ))}
                </div>
             </div>
          </div>

          {/* Alphabet Scroller for Mobile */}
          <div className="bg-white p-3 border-b-2 border-slate-100 sticky top-16 z-40">
             <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                <button
                  onClick={() => setSessionConfig(prev => ({ ...prev, letter: null }))}
                  className={`px-4 py-2 text-xs font-black shrink-0 rounded-full border-2 transition-all ${
                    !sessionConfig.letter ? 'bg-[#FFD700] border-[#003366] text-[#003366]' : 'bg-slate-50 border-transparent text-slate-400'
                  }`}
                >
                  ALL A-Z
                </button>
                {alphabet.map(letter => (
                  <button
                    key={letter}
                    onClick={() => setSessionConfig(prev => ({ ...prev, letter }))}
                    className={`h-10 w-10 flex items-center justify-center text-sm font-black shrink-0 rounded-full border-2 transition-all ${
                      sessionConfig.letter === letter ? 'bg-[#FFD700] border-[#003366] text-[#003366] scale-110' : 'bg-slate-50 border-transparent text-slate-400'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {currentView === 'GAME' ? (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
             {activeWordList.length > 0 ? (
               <SpellingGame 
                  key={`${sessionConfig.difficulty}-${sessionConfig.order}-${sessionConfig.letter}`}
                  words={activeWordList} 
                  initialIndex={initialIndex}
                  solvedWordIds={solvedWordIds}
                  onWordSolved={handleWordSolved}
               />
             ) : (
               <div className="text-center py-20">
                  <Hexagon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-400">NO WORDS FOUND</h3>
                  <button onClick={() => setSessionConfig(p => ({...p, letter: null}))} className="mt-4 text-[#003366] font-bold underline">Show all words</button>
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
      
      <footer className="bg-[#003366] text-white py-10 text-center mt-auto border-t-8 border-[#FFD700]">
        <div className="max-w-4xl mx-auto px-4">
          <p className="font-serif font-bold text-2xl mb-1 italic">Junior Speller GH</p>
          <p className="text-[#FFD700] text-[10px] font-bold uppercase tracking-[0.4em] mb-6">Mastering the Art of Spelling</p>
          
          <button 
            onClick={resetAllProgress}
            className="text-[10px] font-bold text-red-300 hover:text-white transition-colors uppercase tracking-[0.2em] flex items-center gap-1 mx-auto border border-red-300/30 px-3 py-1.5 rounded"
          >
            <Trash2 className="w-3 h-3" /> Clear Session Cache
          </button>
          
          <p className="text-blue-300 text-[9px] mt-8 uppercase tracking-widest font-medium opacity-50 italic">
            Developed to the highest academic standards of Ghana
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;