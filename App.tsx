import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { SpellingGame } from './components/SpellingGame';
import { WordListView } from './components/WordListView';
import { LegalModal } from './components/LegalModal';
import { TutorialOverlay } from './components/TutorialOverlay';
import { wordList } from './data/wordList';
import { Difficulty, SpellingWord } from './types';
import { Shuffle, Hexagon, Trash2, Star, Trophy, BookOpen } from 'lucide-react';

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
  const [showTutorial, setShowTutorial] = useState(false);
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

  useEffect(() => {
    try {
      const cachedConsent = localStorage.getItem('js_gh_consent_accepted');
      if (cachedConsent === 'true') setHasConsent(true);

      const cachedTutorial = localStorage.getItem('js_gh_tutorial_viewed');
      // Only show tutorial if they haven't seen it and have accepted consent
      if (!cachedTutorial && cachedConsent === 'true') setShowTutorial(true);

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
    const cachedTutorial = localStorage.getItem('js_gh_tutorial_viewed');
    if (!cachedTutorial) setShowTutorial(true);
  };

  const handleCompleteTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('js_gh_tutorial_viewed', 'true');
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
      localStorage.clear();
      window.location.reload();
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {!hasConsent && <LegalModal onAccept={handleAcceptConsent} />}
      {hasConsent && showTutorial && <TutorialOverlay onComplete={handleCompleteTutorial} />}
      
      <Header 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />
      
      <main className="flex-grow flex flex-col items-center justify-start py-2 sm:py-4 px-3 sm:px-4 w-full max-w-2xl mx-auto overflow-x-hidden">
        {/* Mobile-Optimized Filters */}
        <div className="w-full space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
             <div className="flex gap-2 flex-1">
               <button
                 onClick={() => setSessionConfig({ difficulty: 'ALL', letter: null })}
                 className={`flex-1 flex items-center justify-center gap-2 px-2 py-3.5 sm:py-5 font-black text-[9px] sm:text-[10px] transition-all rounded-2xl border-2 active:scale-95 ${
                   sessionConfig.difficulty === 'ALL' && !sessionConfig.letter
                     ? 'bg-jsBlue text-jsGold border-jsBlue shadow-lg'
                     : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800'
                 }`}
               >
                 <Shuffle className="w-3.5 h-3.5" />
                 <span className="uppercase tracking-widest">Mix</span>
               </button>
               <button
                 onClick={() => setSessionConfig({ difficulty: 'STARRED', letter: null })}
                 className={`flex-1 flex items-center justify-center gap-2 px-2 py-3.5 sm:py-5 font-black text-[9px] sm:text-[10px] transition-all rounded-2xl border-2 active:scale-95 ${
                   sessionConfig.difficulty === 'STARRED'
                     ? 'bg-yellow-400 text-jsBlue border-yellow-400 shadow-lg'
                     : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800'
                 }`}
               >
                 <Star className={`w-3.5 h-3.5 ${sessionConfig.difficulty === 'STARRED' ? 'fill-jsBlue' : ''}`} />
                 <span className="uppercase tracking-widest">Study</span>
               </button>
             </div>

             <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-1.5 rounded-2xl flex gap-1.5 flex-1">
                {beeLevels.map(level => (
                  <button
                    key={level}
                    onClick={() => setSessionConfig(prev => ({ ...prev, difficulty: level }))}
                    className={`flex-1 flex flex-col items-center justify-center p-1.5 font-black text-[7px] sm:text-[8px] transition-all rounded-xl border-2 active:scale-95 ${
                      sessionConfig.difficulty === level
                        ? 'bg-jsBlue text-jsGold border-jsBlue shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-transparent'
                    }`}
                  >
                    <Hexagon className={`w-2.5 h-2.5 mb-1 ${sessionConfig.difficulty === level ? 'fill-jsGold' : ''}`} />
                    {level.split(' ')[0].toUpperCase()}
                  </button>
                ))}
             </div>
          </div>

          {/* Letter Bar */}
          <div className="bg-white dark:bg-slate-900 p-2 sm:p-3 rounded-2xl shadow-sm border-2 border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-0.5">
                <button
                  onClick={() => setSessionConfig(prev => ({ ...prev, letter: null }))}
                  className={`px-3 py-2 text-[9px] sm:text-[10px] font-black shrink-0 rounded-full border-2 transition-all uppercase tracking-widest ${
                    !sessionConfig.letter ? 'bg-jsGold border-jsBlue text-jsBlue shadow-md' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 dark:text-slate-500'
                  }`}
                >
                  ALL
                </button>
                {alphabet.map(letter => (
                  <button
                    key={letter}
                    onClick={() => setSessionConfig(prev => ({ ...prev, letter }))}
                    className={`h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center text-[9px] sm:text-[10px] font-black shrink-0 rounded-full border-2 transition-all active:scale-110 ${
                      sessionConfig.letter === letter ? 'bg-jsGold border-jsBlue text-jsBlue shadow-md scale-105' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Dynamic View */}
        {currentView === 'GAME' ? (
          <div className="w-full flex-grow flex flex-col min-h-0">
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
               <div className="flex-grow flex flex-col items-center justify-center py-10 px-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center animate-in fade-in zoom-in-95">
                  {sessionConfig.difficulty === 'STARRED' ? (
                    <>
                      <div className="w-16 h-16 bg-yellow-50 dark:bg-yellow-900/10 rounded-full flex items-center justify-center mb-4">
                        <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                      </div>
                      <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm mb-2">No Starred Words</h3>
                      <p className="text-[10px] sm:text-xs text-slate-400 max-w-[200px] leading-relaxed mb-6">
                        Star words you find difficult in the Dictionary to build your study list.
                      </p>
                      <button 
                        onClick={() => setCurrentView('LIST')} 
                        className="bg-jsBlue text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center gap-2"
                      >
                        <BookOpen className="w-3.5 h-3.5" /> Open Dictionary
                      </button>
                    </>
                  ) : (
                    <>
                      <Hexagon className="w-10 h-10 text-slate-100 dark:text-slate-800 mx-auto mb-3" />
                      <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">No matches found</p>
                      <button onClick={() => setSessionConfig({ difficulty: Difficulty.ONE_BEE, letter: null })} className="mt-3 text-jsBlue dark:text-blue-400 font-black text-[10px] uppercase tracking-widest underline">Reset</button>
                    </>
                  )}
               </div>
             )}
          </div>
        ) : (
          <div className="w-full">
            <WordListView 
              words={wordList} 
              onBack={() => setCurrentView('GAME')}
              solvedWordIds={solvedWordIds}
              starredWordIds={starredWordIds}
              onToggleStar={handleToggleStar}
            />
          </div>
        )}
      </main>
      
      <footer className="bg-jsBlue dark:bg-slate-950 text-white py-10 text-center mt-auto border-t-[8px] border-jsGold">
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center">
          <img src={logoUrl} alt="Logo" className="h-12 w-auto mb-4 opacity-90" />
          <p className="text-jsGold text-[8px] font-black uppercase tracking-[0.4em] mb-8 opacity-70">Learn Earn and Spell like a Champion</p>
          <button onClick={resetAllProgress} className="text-[7px] font-black text-blue-300/40 hover:text-white transition-all uppercase tracking-[0.2em] flex items-center gap-2 border border-blue-400/5 px-4 py-2 rounded-full">
            <Trash2 className="w-3 h-3" /> System Reset
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;