import React, { useEffect, useState, useMemo } from 'react';
import { Header } from './components/Header';
import { SpellingGame } from './components/SpellingGame';
import { WordListView } from './components/WordListView';
import { LegalModal } from './components/LegalModal';
import { wordList } from './data/wordList';
import { Difficulty, SpellingWord } from './types';
import { Shuffle, Hexagon, Trash2 } from 'lucide-react';

type ViewState = 'GAME' | 'LIST';
type SessionDifficulty = Difficulty | 'ALL';

interface SessionConfig {
  difficulty: SessionDifficulty;
  letter: string | null;
}

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

  // Initialization Effect
  useEffect(() => {
    try {
      const cachedConsent = localStorage.getItem('js_gh_consent_accepted');
      if (cachedConsent === 'true') setHasConsent(true);

      const cachedSolved = localStorage.getItem('bee_judge_solved_ids');
      if (cachedSolved) {
        try {
          const parsed = JSON.parse(cachedSolved);
          if (Array.isArray(parsed)) {
            setSolvedWordIds(new Set(parsed));
          }
        } catch (e) { 
          console.warn("Could not parse solved words cache", e); 
        }
      }

      const cachedTheme = localStorage.getItem('js_gh_theme');
      if (cachedTheme === 'dark') {
        setDarkMode(true);
      }
    } catch (e) {
      console.warn("Storage access failed during init", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Theme Sync
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (darkMode) {
      html.classList.add('dark');
      body.classList.add('dark');
      html.style.backgroundColor = '#020617';
    } else {
      html.classList.remove('dark');
      body.classList.remove('dark');
      html.style.backgroundColor = '#f8fafc';
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('js_gh_theme', next ? 'dark' : 'light');
      } catch (e) {}
      return next;
    });
  };

  const handleAcceptConsent = () => {
    setHasConsent(true);
    try {
      localStorage.setItem('js_gh_consent_accepted', 'true');
    } catch (e) {}
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
      try {
        localStorage.setItem('bee_judge_solved_ids', JSON.stringify(Array.from(next)));
      } catch (e) {}
      return next;
    });
  };

  const resetAllProgress = () => {
    if (window.confirm("Delete all spelling history and trophies?")) {
      setSolvedWordIds(new Set());
      try {
        localStorage.removeItem('bee_judge_solved_ids');
      } catch (e) {}
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
      
      <main className="flex-grow flex flex-col items-center justify-start py-4 px-4 w-full max-w-2xl mx-auto overflow-x-hidden">
        {/* Level & Filter Section */}
        <div className="w-full space-y-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
             <button
               onClick={() => setSessionConfig({ difficulty: 'ALL', letter: null })}
               className={`flex-1 flex items-center justify-center gap-3 px-6 py-5 font-black text-xs transition-all rounded-2xl border-2 active:scale-95 ${
                 sessionConfig.difficulty === 'ALL' && !sessionConfig.letter
                   ? 'bg-jsBlue text-jsGold border-jsBlue shadow-lg'
                   : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 shadow-sm'
               }`}
             >
               <Shuffle className="w-4 h-4" />
               <span className="uppercase tracking-widest">Master Mix</span>
             </button>

             <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-2 rounded-2xl flex gap-2 flex-[2]">
                {beeLevels.map(level => (
                  <button
                    key={level}
                    onClick={() => setSessionConfig(prev => ({ ...prev, difficulty: level }))}
                    className={`flex-1 flex flex-col items-center justify-center p-2.5 font-black text-[8px] md:text-[9px] transition-all rounded-xl border-2 active:scale-95 ${
                      sessionConfig.difficulty === level
                        ? 'bg-jsBlue text-jsGold border-jsBlue shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-transparent'
                    }`}
                  >
                    <Hexagon className={`w-3.5 h-3.5 mb-1 ${sessionConfig.difficulty === level ? 'fill-jsGold' : ''}`} />
                    {level.replace('_BEE', '').toUpperCase()}
                  </button>
                ))}
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border-2 border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => setSessionConfig(prev => ({ ...prev, letter: null }))}
                  className={`px-4 py-2 text-[9px] font-black shrink-0 rounded-full border-2 transition-all uppercase tracking-widest ${
                    !sessionConfig.letter ? 'bg-jsGold border-jsBlue text-jsBlue shadow-md' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 dark:text-slate-500'
                  }`}
                >
                  A-Z
                </button>
                {alphabet.map(letter => (
                  <button
                    key={letter}
                    onClick={() => setSessionConfig(prev => ({ ...prev, letter }))}
                    className={`h-9 w-9 flex items-center justify-center text-[10px] font-black shrink-0 rounded-full border-2 transition-all active:scale-110 ${
                      sessionConfig.letter === letter ? 'bg-jsGold border-jsBlue text-jsBlue shadow-md scale-105' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Game Area */}
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
               <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 w-full animate-in fade-in zoom-in-95">
                  <Hexagon className="w-12 h-12 text-slate-100 dark:text-slate-800 mx-auto mb-4" />
                  <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Category empty</p>
                  <button onClick={() => setSessionConfig(p => ({...p, letter: null}))} className="mt-4 text-jsBlue dark:text-blue-400 font-black text-[10px] uppercase tracking-widest underline">Reset filter</button>
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
      
      <footer className="bg-jsBlue dark:bg-slate-950 text-white py-12 text-center mt-auto border-t-[8px] border-jsGold">
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center">
          <img 
            src={logoUrl} 
            alt="Junior Speller Logo" 
            className="h-20 w-auto mb-6"
          />
          <p className="text-jsGold text-[9px] font-black uppercase tracking-[0.4em] mb-10">Learn Earn and Spell like a Champion</p>
          
          <button 
            onClick={resetAllProgress}
            className="text-[8px] font-black text-blue-300/60 hover:text-white transition-all uppercase tracking-[0.2em] flex items-center gap-2 border border-blue-400/10 px-5 py-2.5 rounded-full hover:bg-blue-900/40"
          >
            <Trash2 className="w-3 h-3" /> Factory Reset App Data
          </button>
          
          <p className="text-blue-400/20 dark:text-slate-800 text-[8px] mt-12 uppercase tracking-[0.2em] font-bold">
            © 2026 Junior Speller GH Digital Arena
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;