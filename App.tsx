import React, { useEffect, useState, useMemo } from 'react';
import { Header } from './components/Header';
import { SpellingGame } from './components/SpellingGame';
import { WordListView } from './components/WordListView';
import { LegalModal } from './components/LegalModal';
import { wordList } from './data/wordList';
import { Difficulty, SpellingWord } from './types';
import { Shuffle, Hexagon, Trash2, ListFilter } from 'lucide-react';

type ViewState = 'GAME' | 'LIST';
type SessionDifficulty = Difficulty | 'ALL';

interface SessionConfig {
  difficulty: SessionDifficulty;
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
const logoUrl = "https://juniorspellergh.com/wp-content/uploads/2024/01/3d-junior-speller-logo-2048x1172.png";

const getWordId = (word: SpellingWord) => `${word.difficulty}:${word.word.toLowerCase()}`;

function App() {
  const [loading, setLoading] = useState(true);
  const [hasConsent, setHasConsent] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);
  const [currentView, setCurrentView] = useState<ViewState>('GAME');
  const [darkMode, setDarkMode] = useState(false);
  const [sessionConfig, setSessionConfig] = useState<SessionConfig>({ 
    difficulty: Difficulty.ONE_BEE, 
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

    const cachedTheme = localStorage.getItem('js_gh_theme');
    if (cachedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    setLoading(false);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('js_gh_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('js_gh_theme', 'light');
      }
      return next;
    });
  };

  const handleAcceptConsent = () => {
    setHasConsent(true);
    localStorage.setItem('js_gh_consent_accepted', 'true');
  };

  useEffect(() => {
    let words: SpellingWord[] = [];
    const { difficulty, letter } = sessionConfig;

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
      words.sort((a, b) => a.word.localeCompare(b.word));
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
    if (confirm("Reset all solved word progress?")) {
      setSolvedWordIds(new Set());
      localStorage.removeItem('bee_judge_solved_ids');
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {!hasConsent && <LegalModal onAccept={handleAcceptConsent} />}
      
      <Header 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />
      
      <main className="flex-grow flex flex-col items-center justify-start py-6 px-4 w-full max-w-4xl mx-auto overflow-x-hidden">
        
        {/* Session Config */}
        <div className="w-full space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             <button
               onClick={() => setSessionConfig({ difficulty: 'ALL', letter: null })}
               className={`flex items-center gap-3 px-6 py-4 font-black text-sm transition-all rounded-2xl ${
                 sessionConfig.difficulty === 'ALL' && !sessionConfig.letter
                   ? 'bg-[#003366] text-[#FFD700] shadow-xl dark:shadow-[#FFD700]/5'
                   : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-2 border-slate-100 dark:border-slate-800 shadow-sm'
               }`}
             >
               <Shuffle className="w-5 h-5" />
               <span className="uppercase tracking-[0.1em]">Grand Finale Mix</span>
             </button>

             <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-2 rounded-2xl flex gap-2">
                {beeLevels.map(level => (
                  <button
                    key={level}
                    onClick={() => setSessionConfig(prev => ({ ...prev, difficulty: level }))}
                    className={`flex-1 flex flex-col items-center justify-center p-2 font-black text-[9px] transition-all rounded-xl border-2 ${
                      sessionConfig.difficulty === level
                        ? 'bg-[#003366] text-[#FFD700] border-[#003366]'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <Hexagon className={`w-4 h-4 mb-1 ${sessionConfig.difficulty === level ? 'fill-[#FFD700]' : ''}`} />
                    {level.toUpperCase()}
                  </button>
                ))}
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border-2 border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => setSessionConfig(prev => ({ ...prev, letter: null }))}
                  className={`px-4 py-2 text-[10px] font-black shrink-0 rounded-full border-2 transition-all uppercase tracking-widest ${
                    !sessionConfig.letter ? 'bg-[#FFD700] border-[#003366] text-[#003366]' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 dark:text-slate-500'
                  }`}
                >
                  All A-Z
                </button>
                {alphabet.map(letter => (
                  <button
                    key={letter}
                    onClick={() => setSessionConfig(prev => ({ ...prev, letter }))}
                    className={`h-10 w-10 flex items-center justify-center text-xs font-black shrink-0 rounded-full border-2 transition-all ${
                      sessionConfig.letter === letter ? 'bg-[#FFD700] border-[#003366] text-[#003366] scale-110' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {currentView === 'GAME' ? (
          <div className="w-full">
             {activeWordList.length > 0 ? (
               <SpellingGame 
                  key={`${sessionConfig.difficulty}-${sessionConfig.letter}`}
                  words={activeWordList} 
                  initialIndex={initialIndex}
                  solvedWordIds={solvedWordIds}
                  onWordSolved={handleWordSolved}
               />
             ) : (
               <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 w-full">
                  <Hexagon className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                  <p className="font-black text-slate-400 uppercase tracking-widest text-sm">No Words Found</p>
                  <button onClick={() => setSessionConfig(p => ({...p, letter: null}))} className="mt-4 text-[#003366] dark:text-blue-400 font-black text-xs uppercase tracking-widest underline">Reset Filter</button>
               </div>
             )}
          </div>
        ) : (
          <div className="w-full">
            <WordListView 
              words={activeWordList} 
              onBack={() => setCurrentView('GAME')}
              solvedWordIds={solvedWordIds}
            />
          </div>
        )}
      </main>
      
      <footer className="bg-[#003366] dark:bg-slate-950 text-white py-12 text-center mt-auto border-t-[10px] border-[#FFD700]">
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center">
          <img 
            src={logoUrl} 
            alt="Junior Speller Logo" 
            className="h-24 w-auto mb-6"
          />
          <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.5em] mb-8">Learn Earn and Spell like a Champion</p>
          
          <button 
            onClick={resetAllProgress}
            className="text-[9px] font-black text-blue-300 dark:text-slate-500 hover:text-white transition-colors uppercase tracking-[0.3em] flex items-center gap-2 border border-blue-400/20 dark:border-slate-800 px-4 py-2 rounded-full"
          >
            <Trash2 className="w-3 h-3" /> Clear Cached Progress
          </button>
          
          <p className="text-blue-400/40 dark:text-slate-700 text-[9px] mt-10 uppercase tracking-[0.2em] font-bold italic">
            Official Junior Speller GH Digital Platform
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;