
import React, { useEffect, useState, useRef } from 'react';
import { Header } from './components/Header';
import { SpellingGame } from './components/SpellingGame';
import { WordListView } from './components/WordListView';
import { LegalModal } from './components/LegalModal';
import { TutorialOverlay } from './components/TutorialOverlay';
import { LeaderboardModal } from './components/LeaderboardModal';
import { wordList } from './data/wordList';
import { Difficulty, SpellingWord } from './types';
import { Hexagon, Trash2, Star, Trophy, BookOpen, Mail, GraduationCap } from 'lucide-react';
import { useUserIdentity } from './hooks/useUserIdentity';
import { doc, setDoc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from './firebase';

type ViewState = 'GAME' | 'LIST';
type SessionDifficulty = Difficulty | 'ALL' | 'STARRED' | 'COMPETITION';

interface SessionConfig {
  difficulty: SessionDifficulty;
  letter: string | null;
}

const beeLevels = [Difficulty.ONE_BEE, Difficulty.TWO_BEE, Difficulty.THREE_BEE];
const logoUrl = "https://juniorspellergh.com/wp-content/uploads/2024/01/3d-junior-speller-logo-2048x1172.png";

const getWordId = (word: SpellingWord) => `${word.difficulty}:${word.word.toLowerCase()}`;

function App() {
  const identity = useUserIdentity();
  const [appReady, setAppReady] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('GAME');
  const [darkMode, setDarkMode] = useState(false);
  const [userRank, setUserRank] = useState<number | string>('--');
  
  const [sessionConfig, setSessionConfig] = useState<SessionConfig>({ 
    difficulty: Difficulty.ONE_BEE, 
    letter: null 
  });
  const [activeWordList, setActiveWordList] = useState<SpellingWord[]>([]);
  const [solvedWordIds, setSolvedWordIds] = useState<Set<string>>(new Set());
  const [starredWordIds, setStarredWordIds] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [initialIndex, setInitialIndex] = useState(0);

  const sessionStartTime = useRef<number>(Date.now());

  // Initialization
  useEffect(() => {
    try {
      setHasConsent(localStorage.getItem('js_gh_consent_accepted') === 'true');
      setDarkMode(localStorage.getItem('js_gh_theme') === 'dark');
      
      const solved = localStorage.getItem('bee_judge_solved_ids');
      if (solved) setSolvedWordIds(new Set(JSON.parse(solved)));

      const starred = localStorage.getItem('bee_judge_starred_ids');
      if (starred) setStarredWordIds(new Set(JSON.parse(starred)));

      const best = localStorage.getItem('bee_judge_best_streak');
      if (best) setBestStreak(parseInt(best, 10));

    } catch (e) {
      console.warn("Settings load failed", e);
    } finally {
      setAppReady(true);
    }
  }, []);

  const fetchUserRank = async () => {
    if (!db || !identity) return;
    try {
      const q = query(
        collection(db, 'leaderboard'), 
        orderBy('score', 'desc'), 
        orderBy('timeTaken', 'asc')
      );
      const snapshot = await getDocs(q);
      const index = snapshot.docs.findIndex(doc => doc.id === identity.userId);
      if (index !== -1) setUserRank(index + 1);
    } catch (e) {
      console.warn("Rank fetch failed", e);
    }
  };

  const registerUserInDB = async () => {
    if (!db || !identity) return;
    try {
      const userDocRef = doc(db, 'leaderboard', identity.userId);
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists() || docSnap.data().countryCode !== identity.countryCode) {
        await setDoc(userDocRef, {
          username: identity.username,
          score: 0,
          timeTaken: 0,
          streak: 0,
          avatarSeed: identity.avatarSeed,
          userId: identity.userId,
          country: identity.country,
          countryCode: identity.countryCode,
          createdAt: docSnap.exists() ? docSnap.data().createdAt : Date.now(),
          lastUpdated: Date.now()
        }, { merge: true });
      }
      fetchUserRank();
    } catch (e) {
      console.error("User registration failed", e);
    }
  };

  useEffect(() => {
    if (appReady && hasConsent && identity) {
      registerUserInDB();
      if (localStorage.getItem('js_gh_tutorial_viewed') !== 'true') {
        setShowTutorial(true);
      }
    }
  }, [appReady, hasConsent, identity]);

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
    } else if (difficulty === 'COMPETITION') {
      words = [...wordList];
    } else {
      words = wordList.filter(w => w.difficulty === difficulty);
    }

    if (letter && difficulty !== 'COMPETITION') {
      words = words.filter(w => w.word.toLowerCase().startsWith(letter.toLowerCase()));
    }

    setActiveWordList(words);
    
    if (difficulty === 'COMPETITION') {
      const firstUnsolved = words.findIndex(w => !solvedWordIds.has(getWordId(w)));
      setInitialIndex(firstUnsolved !== -1 ? firstUnsolved : 0);
    } else {
      setInitialIndex(0);
    }
  }, [sessionConfig, starredWordIds, solvedWordIds]);

  const submitScoreToGlobal = async (newStreak: number, scoreCount: number) => {
    if (!db || !identity) return;
    const timeElapsed = Math.floor((Date.now() - sessionStartTime.current) / 1000);
    try {
      const userDocRef = doc(db, 'leaderboard', identity.userId);
      const docSnap = await getDoc(userDocRef);
      let existingScore = 0, existingStreak = 0, existingTime = 0;
      if (docSnap.exists()) {
        const d = docSnap.data();
        existingScore = d.score || 0;
        existingStreak = d.streak || 0;
        existingTime = d.timeTaken || 0;
      }
      await setDoc(userDocRef, {
        score: Math.max(existingScore, scoreCount),
        timeTaken: existingTime + timeElapsed,
        streak: Math.max(existingStreak, newStreak),
        lastUpdated: Date.now()
      }, { merge: true });
      sessionStartTime.current = Date.now();
      fetchUserRank();
    } catch (e) {}
  };

  const handleWordSolved = (word: SpellingWord) => {
    const id = getWordId(word);
    const newSolvedIds = new Set(solvedWordIds);
    newSolvedIds.add(id);
    setSolvedWordIds(newSolvedIds);
    localStorage.setItem('bee_judge_solved_ids', JSON.stringify(Array.from(newSolvedIds)));
    
    setStreak(s => {
      const next = s + 1;
      if (next > bestStreak) {
        setBestStreak(next);
        localStorage.setItem('bee_judge_best_streak', next.toString());
      }
      if (next % 2 === 0) submitScoreToGlobal(next, newSolvedIds.size);
      return next;
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

  if (!appReady) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {!hasConsent && <LegalModal onAccept={handleAcceptConsent} />}
      {hasConsent && showTutorial && <TutorialOverlay onComplete={handleCompleteTutorial} />}
      {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} currentUserId={identity.userId} />}
      
      <Header 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onShowLeaderboard={() => setShowLeaderboard(true)}
        identity={identity}
        userRank={userRank}
      />
      
      <main className="flex-grow flex flex-col items-center justify-start py-2 sm:py-4 px-3 sm:px-4 w-full max-w-2xl mx-auto overflow-x-hidden">
        <div className="w-full space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
             <div className="flex gap-2 flex-1">
               <button
                 onClick={() => setSessionConfig({ difficulty: 'COMPETITION', letter: null })}
                 className={`flex-1 flex items-center justify-center gap-2 px-2 py-3.5 sm:py-5 font-black text-[9px] sm:text-[10px] transition-all rounded-2xl border-2 active:scale-95 ${
                   sessionConfig.difficulty === 'COMPETITION'
                     ? 'bg-jsBlue text-jsGold border-jsBlue shadow-lg'
                     : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800'
                 }`}
               >
                 <GraduationCap className="w-3.5 h-3.5" />
                 <span className="uppercase tracking-widest">Competition Stage</span>
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
                 <span className="uppercase tracking-widest">Personal List</span>
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
        </div>

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
                  isCompetition={sessionConfig.difficulty === 'COMPETITION'}
               />
             ) : (
               <div className="flex-grow flex flex-col items-center justify-center py-10 px-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center animate-in fade-in zoom-in-95">
                  <Star className="w-12 h-12 text-slate-100 dark:text-slate-800 mb-4" />
                  <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">No words to display</p>
                  <button onClick={() => setSessionConfig({ difficulty: Difficulty.ONE_BEE, letter: null })} className="mt-3 text-jsBlue dark:text-blue-400 font-black text-[10px] uppercase tracking-widest underline">Reset Filters</button>
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
      
      <footer className="bg-jsBlue dark:bg-slate-950 text-white py-12 text-center mt-auto border-t-[8px] border-jsGold relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center relative z-10">
          <img src={logoUrl} alt="Logo" className="h-12 w-auto mb-4 opacity-90" />
          <p className="text-jsGold text-[8px] font-black uppercase tracking-[0.4em] mb-8 opacity-70 italic">Learn Earn and Spell like a Champion</p>
          <div className="flex items-center gap-4">
            <button onClick={() => { if(confirm("This will clear all your progress. Continue?")) { localStorage.clear(); location.reload(); }}} className="text-[7px] font-black text-blue-300/40 uppercase tracking-[0.2em] border border-blue-400/5 px-4 py-2 rounded-full">Reset App Data</button>
            <a href="mailto:dev@juniorspellergh.com" className="text-[7px] font-black text-jsGold/40 uppercase tracking-[0.2em] border border-jsGold/5 px-4 py-2 rounded-full">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
