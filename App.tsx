import React, { useEffect, useState, useMemo } from 'react';
import { Header } from './components/Header';
import { SpellingGame } from './components/SpellingGame';
import { WordListView } from './components/WordListView';
import { LegalModal } from './components/LegalModal';
import { wordList } from './data/wordList';
import { Difficulty, SpellingWord } from './types';
import { Shuffle, Hexagon, Trash2, Star, Trophy } from 'lucide-react';

type ViewState = 'GAME' | 'LIST';
type SessionDifficulty = Difficulty | 'ALL' | 'STARRED';

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
  const [starredWordIds, setStarredWordIds] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  // Initialization Effect
  useEffect(() => {
    try {
      const cachedConsent = localStorage.getItem('js_gh_consent_accepted');
      if (cachedConsent === 'true') setHasConsent(true);

      const cachedSolved = localStorage.getItem('bee_judge_solved_ids');
      if (cachedSolved) {
        const parsed = JSON.parse(cachedSolved);
        if (Array.isArray(parsed)) setSolvedWordIds(new Set(parsed));
      }

      const cachedStarred = localStorage.getItem('bee_judge_starred_ids');
      if (cachedStarred) {
        const parsed = JSON.parse(cachedStarred);
        if (Array.isArray(parsed)) setStarredWordIds(new Set(parsed));
      }

      const cachedBest = localStorage.getItem('bee_judge_best_streak');
      if (cachedBest) setBestStreak(parseInt(cachedBest, 10));

      const cachedTheme = localStorage.getItem('js_gh_theme');
      if (cachedTheme === 'dark') setDarkMode(true);
    } catch (e) {
      console.warn("Storage access failed during init", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Theme Sync
  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) html.classList.add('dark');
    else html.classList.remove('dark');
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('js_gh_theme', next ? 'dark' : 'light');
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
    } else if (difficulty === 'STARRED') {
      words = wordList.filter(w => starredWordIds.has(getWordId(w)));
    } else {
      words = wordList.filter(w => w.difficulty === difficulty);
    }

    if (letter) {
      words = words.filter(w => w.word.toLowerCase().startsWith(letter.toLowerCase()));
    }

    setActiveWordList(words);
    setInitialIndex(0);
  }, [sessionConfig, starredWordIds]);

  const handleWordSolved = (word: SpellingWord) => {
    const id = getWordId(word);
    setSolvedWordIds(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('bee_judge_solved_ids', JSON.stringify(Array.from(next)));
      return next;
    });
    
    setStreak(s => {
      const newStreak = s + 1;
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
        localStorage.setItem('bee_judge_best_streak', newStreak.toString());
      }
      return newStreak;
    });
  };

  const handleToggleStar = (word: SpellingWord) => {
    const id = getWordId(word);
    setStarredWordIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('bee_judge_starred_ids', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const resetAllProgress = () => {
    if (window.confirm("Delete all spelling history and trophies?")) {
      setSolvedWordIds(new Set());
      setStarredWordIds(new Set());
      setStreak(0);
      setBestStreak(0);
      localStorage.removeItem('bee_judge_solved_ids');
      localStorage.removeItem('bee_judge_starred_ids');
      localStorage.removeItem('bee_judge_best_streak');
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
        {/* Professional Filter UI */}
        <div className="w-full space-y-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
             <div className="flex gap-2 flex-1">
               <button
                 onClick={() => setSessionConfig({ difficulty: 'ALL', letter: null })}
                 className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 font-black text-[10px] transition-all rounded-2xl border-2 active:scale-95 ${
                   sessionConfig.difficulty === 'ALL' && !sessionConfig.letter
                     ? 'bg-jsBlue text-jsGold border-jsBlue shadow-lg'
                     : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800'
                 }`}
               >
                 <Shuffle className="w-3.5 h-3.5" />
                 <span className="uppercase tracking-widest">Master Mix</span>
               </button>
               <button
                 onClick={() => setSessionConfig({ difficulty: 'STARRED', letter: null })}
                 className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 font-black text-[10px] transition-all rounded-2xl border-2 active:scale-95 ${
                   sessionConfig.difficulty === 'STARRED'
                     ? 'bg-yellow-400 text-jsBlue border-yellow-400 shadow-lg'
                     : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800'
                 }`}
               >
                 <Star className={`w-3.5 h-3.5 ${sessionConfig.difficulty === 'STARRED' ? 'fill-jsBlue' : ''}`} />
                 <span className="uppercase tracking-widest">Study List</span>
               </button>
             </div>

             <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-2 rounded-2xl flex gap-2 flex-1">
                {beeLevels.map(level => (
                  <button
                    key={level}
                    onClick={() => setSessionConfig(prev => ({ ...prev, difficulty: level }))}
                    className={`flex-1 flex flex-col items-center justify-center p-2.5 font-black text-[8px] transition-all rounded-xl border-2 active:scale-95 ${
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

        {/* Dynamic View Selection */}
        {currentView === 'GAME' ? (
          <div className="w-full">
             {activeWordList.length > 0 ? (
               <SpellingGame 
                  key={`${sessionConfig.difficulty}-${sessionConfig.letter}`}
                  words={activeWordList} 
                  initialIndex={initialIndex}
                  solvedWordIds={solvedWordIds}
                  onWordSolved={handleWordSolved}
                  starredWordIds={starredWordIds}
                  onToggleStar={handleToggleStar}
                  streak={streak}
                  bestStreak={bestStreak}
                  onStreakReset={() => setStreak(0)}
               />
             ) : (
               <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 w-full animate-in fade-in zoom-in-95">
                  {sessionConfig.difficulty === 'STARRED' ? (
                    <>
                      <Star className="w-12 h-12 text-yellow-200 dark:text-yellow-900/40 mx-auto mb-4" />
                      <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm mb-2">Study List Empty</h3>
                      <p className="text-xs text-slate-400 max-w-[200px] mx-auto leading-relaxed">Go to the dictionary and star words you want to practice specifically!</p>
                      <button onClick={() => setCurrentView('LIST')} className="mt-6 bg-jsBlue text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">Open Dictionary</button>
                    </>
                  ) : (
                    <>
                      <Hexagon className="w-12 h-12 text-slate-100 dark:text-slate-800 mx-auto mb-4" />
                      <p className="font-black text-slate-400 uppercase tracking-widest text-xs">No matching words</p>
                      <button onClick={() => setSessionConfig({ difficulty: Difficulty.ONE_BEE, letter: null })} className="mt-4 text-jsBlue dark:text-blue-400 font-black text-[10px] uppercase tracking-widest underline">Reset Filters</button>
                    </>
                  )}
               </div>
             )}
          </div>
        ) : (
          <div className="w-full">
            <WordListView 
              words={activeWordList} 
              onBack={() => setCurrentView('GAME')}
              solvedWordIds={solvedWordIds}
              starredWordIds={starredWordIds}
              onToggleStar={handleToggleStar}
            />
          </div>
        )}
      </main>
      
      <footer className="bg-jsBlue dark:bg-slate-950 text-white py-12 text-center mt-auto border-t-[8px] border-jsGold">
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center">
          <img src={logoUrl} alt="Junior Speller Logo" className="h-20 w-auto mb-6" />
          <p className="text-jsGold text-[9px] font-black uppercase tracking-[0.4em] mb-10">Learn Earn and Spell like a Champion</p>
          <button onClick={resetAllProgress} className="text-[8px] font-black text-blue-300/60 hover:text-white transition-all uppercase tracking-[0.2em] flex items-center gap-2 border border-blue-400/10 px-5 py-2.5 rounded-full hover:bg-blue-900/40">
            <Trash2 className="w-3 h-3" /> Factory Reset App Data
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;