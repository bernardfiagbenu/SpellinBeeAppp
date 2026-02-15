
import React, { useEffect, useState, useRef } from 'react';
import { Header } from './components/Header';
import { SpellingGame } from './components/SpellingGame';
import { WordListView } from './components/WordListView';
import { LegalModal } from './components/LegalModal';
import { TutorialOverlay } from './components/TutorialOverlay';
import { LeaderboardModal } from './components/LeaderboardModal';
import { SettingsModal } from './components/SettingsModal';
import { wordList } from './data/wordList';
import { Difficulty, SpellingWord } from './types';
import { 
  Globe, Facebook, Twitter, Instagram, 
  Youtube, Music, Star, ExternalLink,
  ChevronUp
} from 'lucide-react';
import { useUserIdentity } from './hooks/useUserIdentity';
import { db } from './firebase';
import { doc, setDoc, getDocs, collection, query, orderBy, limit } from 'firebase/firestore';

type ViewState = 'GAME' | 'LIST';
type SessionDifficulty = Difficulty | 'ALL' | 'STARRED' | 'COMPETITION';

interface SessionConfig {
  difficulty: SessionDifficulty;
  letter: string | null;
}

const beeLevels = [Difficulty.ONE_BEE, Difficulty.TWO_BEE, Difficulty.THREE_BEE];
const getWordId = (word: SpellingWord) => `${word.difficulty}:${word.word.toLowerCase()}`;

export default function App() {
  const identity = useUserIdentity();
  const [appReady, setAppReady] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('GAME');
  const [darkMode, setDarkMode] = useState(false);
  const [userRank, setUserRank] = useState<number | string>('--');
  const [speechRate, setSpeechRate] = useState(0.85);
  
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

  useEffect(() => {
    try {
      setHasConsent(localStorage.getItem('js_gh_consent_accepted') === 'true');
      setDarkMode(localStorage.getItem('js_gh_theme') === 'dark');
      
      const rate = localStorage.getItem('js_gh_speech_rate');
      if (rate) setSpeechRate(parseFloat(rate));

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
    if (!db || !identity || !navigator.onLine) return;
    try {
      const q = query(
        collection(db, 'leaderboard'),
        orderBy('score', 'desc'),
        limit(500)
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs;
      const index = docs.findIndex(d => d.id === identity.userId);
      if (index !== -1) setUserRank(index + 1);
      else setUserRank('>500');
    } catch (e) {
      console.debug("Rank sync skipped", e);
    }
  };

  const registerUserInDB = async () => {
    if (!db || !identity) return;
    try {
      await setDoc(doc(db, 'leaderboard', identity.userId), {
        userId: identity.userId,
        username: identity.username,
        avatarSeed: identity.avatarSeed,
        country: identity.country,
        countryCode: identity.countryCode,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      if (navigator.onLine) fetchUserRank();
    } catch (e) {
      console.debug("User registration sync pending...");
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

  const handleRateChange = (rate: number) => {
    setSpeechRate(rate);
    localStorage.setItem('js_gh_speech_rate', rate.toString());
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
      await setDoc(doc(db, 'leaderboard', identity.userId), {
        userId: identity.userId,
        score: scoreCount,
        timeTaken: timeElapsed, 
        streak: newStreak,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
        
      if (navigator.onLine) fetchUserRank();
    } catch (e) {
      console.debug("Score submission failed", e);
    }
  };

  const handleWordSolved = (word: SpellingWord) => {
    const id = getWordId(word);
    setSolvedWordIds(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('bee_judge_solved_ids', JSON.stringify(Array.from(next)));
      return next;
    });

    const newStreak = streak + 1;
    setStreak(newStreak);
    if (newStreak > bestStreak) {
      setBestStreak(newStreak);
      localStorage.setItem('bee_judge_best_streak', newStreak.toString());
    }

    const solvedCount = solvedWordIds.size + 1;
    submitScoreToGlobal(newStreak, solvedCount);
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

  const handleStreakReset = () => {
    setStreak(0);
    submitScoreToGlobal(0, solvedWordIds.size);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!appReady) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col transition-colors duration-300">
      <Header 
        currentView={currentView}
        onViewChange={setCurrentView}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onShowLeaderboard={() => setShowLeaderboard(true)}
        onShowSettings={() => setShowSettings(true)}
        identity={identity}
        userRank={userRank}
      />

      <main className="flex-grow container max-w-5xl mx-auto px-4 py-4 sm:py-8 flex flex-col items-center justify-start">
        {!hasConsent && <LegalModal onAccept={() => { setHasConsent(true); localStorage.setItem('js_gh_consent_accepted', 'true'); }} />}
        {showTutorial && <TutorialOverlay onComplete={() => { setShowTutorial(false); localStorage.setItem('js_gh_tutorial_viewed', 'true'); }} />}
        {showLeaderboard && (
          <LeaderboardModal 
            onClose={() => setShowLeaderboard(false)} 
            currentUserId={identity?.userId} 
          />
        )}
        {showSettings && (
          <SettingsModal 
            onClose={() => setShowSettings(false)} 
            rate={speechRate}
            onRateChange={handleRateChange}
          />
        )}

        {currentView === 'GAME' ? (
          <div className="w-full flex flex-col gap-6">
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              <button 
                onClick={() => setSessionConfig({ difficulty: 'COMPETITION', letter: null })}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${sessionConfig.difficulty === 'COMPETITION' ? 'bg-black dark:bg-jsGold text-jsGold dark:text-black shadow-lg scale-110' : 'bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-200 dark:border-zinc-800'}`}
              >
                🏆 Grand Finals
              </button>
              {beeLevels.map(level => (
                <button 
                  key={level}
                  onClick={() => setSessionConfig({ difficulty: level, letter: null })}
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${sessionConfig.difficulty === level ? 'bg-black dark:bg-jsGold text-jsGold dark:text-black shadow-lg' : 'bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-200 dark:border-zinc-800'}`}
                >
                  {level}
                </button>
              ))}
              <button 
                onClick={() => setSessionConfig({ difficulty: 'STARRED', letter: null })}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${sessionConfig.difficulty === 'STARRED' ? 'bg-black dark:bg-jsGold text-jsGold dark:text-black shadow-lg' : 'bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-200 dark:border-zinc-800'}`}
              >
                ⭐ Favorites ({starredWordIds.size})
              </button>
            </div>

            {activeWordList.length > 0 ? (
              <SpellingGame 
                words={activeWordList}
                initialIndex={initialIndex}
                solvedWordIds={solvedWordIds}
                starredWordIds={starredWordIds}
                onWordSolved={handleWordSolved}
                onToggleStar={handleToggleStar}
                streak={streak}
                bestStreak={bestStreak}
                onStreakReset={handleStreakReset}
                isCompetition={sessionConfig.difficulty === 'COMPETITION'}
                speechRate={speechRate}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                <Star className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-black text-xs uppercase tracking-[0.2em]">No words in this set</p>
                <button 
                  onClick={() => setSessionConfig({ difficulty: Difficulty.ONE_BEE, letter: null })}
                  className="mt-4 text-black dark:text-jsGold font-bold text-xs underline"
                >
                  Return to One Bee
                </button>
              </div>
            )}
          </div>
        ) : (
          <WordListView 
            words={wordList}
            onBack={() => setCurrentView('GAME')}
            solvedWordIds={solvedWordIds}
            starredWordIds={starredWordIds}
            onToggleStar={handleToggleStar}
          />
        )}
      </main>

      <footer className="w-full mt-auto bg-zinc-50 dark:bg-zinc-950 border-t-4 border-black dark:border-jsGold transition-colors">
        <div className="max-w-5xl mx-auto py-8 px-6 flex flex-col items-center gap-6">
          
          <button 
            onClick={scrollToTop}
            className="flex flex-col items-center gap-1 group text-zinc-300 hover:text-jsGold transition-colors"
          >
            <ChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em]">Top</span>
          </button>

          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-zinc-400 dark:text-zinc-600">
             <a href="https://www.facebook.com/JuniorSpellerGH/" target="_blank" rel="noopener noreferrer" className="hover:text-black dark:hover:text-jsGold transition-all transform hover:scale-125">
              <Facebook className="w-6 h-6" />
             </a>
             <a href="https://twitter.com/juniorspellergh" target="_blank" rel="noopener noreferrer" className="hover:text-black dark:hover:text-jsGold transition-all transform hover:scale-125">
              <Twitter className="w-6 h-6" />
             </a>
             <a href="https://www.instagram.com/juniorspellergh/" target="_blank" rel="noopener noreferrer" className="hover:text-black dark:hover:text-jsGold transition-all transform hover:scale-125">
              <Instagram className="w-6 h-6" />
             </a>
             <a href="https://www.tiktok.com/@juniorspellergh" target="_blank" rel="noopener noreferrer" className="hover:text-black dark:hover:text-jsGold transition-all transform hover:scale-125">
              <Music className="w-6 h-6" />
             </a>
             <a href="https://juniorspellergh.com" target="_blank" rel="noopener noreferrer" className="hover:text-black dark:hover:text-jsGold transition-all transform hover:scale-125">
              <Globe className="w-6 h-6" />
             </a>
          </div>
          
          <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent"></div>

          <div className="space-y-2 text-center pb-4">
            <a 
              href="https://juniorspellergh.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[10px] font-black text-black dark:text-jsGold uppercase tracking-[0.25em] hover:opacity-70 transition-all border-b border-transparent hover:border-current pb-0.5"
            >
              Junior Speller Ghana <ExternalLink className="w-3 h-3" />
            </a>
            <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-loose">
              &copy; 2024-2026 National Junior Speller. Powered by Word of Champions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
