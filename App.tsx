
import React, { useEffect, useState, useRef } from 'react';
import { Header } from './components/Header';
import { SpellingGame } from './components/SpellingGame';
import { WordListView } from './components/WordListView';
import { LegalModal } from './components/LegalModal';
import { TutorialOverlay } from './components/TutorialOverlay';
import { LeaderboardModal } from './components/LeaderboardModal';
import { wordList } from './data/wordList';
import { Difficulty, SpellingWord } from './types';
import { 
  Hexagon, Star, Trophy, BookOpen, GraduationCap, 
  MapPin, Phone, Mail, MessageCircle, Instagram, 
  Facebook, Twitter, Music
} from 'lucide-react';
import { useUserIdentity } from './hooks/useUserIdentity';
import { doc, setDoc, getDoc, collection, query, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';
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

export default function App() {
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
    if (!db || !identity || !navigator.onLine) return;
    try {
      const q = query(
        collection(db, 'leaderboard'), 
        orderBy('score', 'desc'), 
        orderBy('timeTaken', 'asc')
      );
      const snapshot = await getDocs(q);
      const index = snapshot.docs.findIndex(doc => doc.id === identity.userId);
      if (index !== -1) setUserRank(index + 1);
    } catch (e: any) {
      if (!e.message?.includes('offline')) {
        console.debug("Rank sync temporarily skipped:", e.message);
      }
    }
  };

  const registerUserInDB = async () => {
    if (!db || !identity) return;
    try {
      const userDocRef = doc(db, 'leaderboard', identity.userId);
      await setDoc(userDocRef, {
        username: identity.username,
        avatarSeed: identity.avatarSeed,
        userId: identity.userId,
        country: identity.country,
        countryCode: identity.countryCode,
        lastUpdated: serverTimestamp()
      }, { merge: true });

      if (navigator.onLine) {
        fetchUserRank();
      }
    } catch (e: any) {
      if (!e.message?.includes('offline')) {
        console.debug("User registration sync pending...");
      }
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
      await setDoc(userDocRef, {
        score: scoreCount,
        timeTaken: timeElapsed, 
        streak: newStreak,
        lastUpdated: serverTimestamp()
      }, { merge: true });
      sessionStartTime.current = Date.now();
      if (navigator.onLine) fetchUserRank();
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
      return next;
    });

    if (sessionConfig.difficulty === 'COMPETITION') {
      submitScoreToGlobal(streak + 1, newSolvedIds.size);
    }
  };

  const handleToggleStar = (word: SpellingWord) => {
    const id = getWordId(word);
    const newStarredIds = new Set(starredWordIds);
    if (newStarredIds.has(id)) {
      newStarredIds.delete(id);
    } else {
      newStarredIds.add(id);
    }
    setStarredWordIds(newStarredIds);
    localStorage.setItem('bee_judge_starred_ids', JSON.stringify(Array.from(newStarredIds)));
  };

  const handleStreakReset = () => {
    setStreak(0);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Header 
        currentView={currentView}
        onViewChange={setCurrentView}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onShowLeaderboard={() => setShowLeaderboard(true)}
        identity={identity}
        userRank={userRank}
      />

      <main className="max-w-5xl mx-auto p-4 sm:p-6 flex flex-col items-center flex-grow w-full">
        {!hasConsent && <LegalModal onAccept={handleAcceptConsent} />}
        {showTutorial && <TutorialOverlay onComplete={handleCompleteTutorial} />}
        {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} currentUserId={identity?.userId} />}

        {currentView === 'GAME' ? (
          <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4">
             <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
               {beeLevels.map(lvl => (
                 <button 
                  key={lvl}
                  onClick={() => setSessionConfig(prev => ({ ...prev, difficulty: lvl }))}
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${sessionConfig.difficulty === lvl ? 'bg-jsBlue text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
                 >
                   {lvl}
                 </button>
               ))}
               <button 
                onClick={() => setSessionConfig(prev => ({ ...prev, difficulty: 'COMPETITION' }))}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${sessionConfig.difficulty === 'COMPETITION' ? 'bg-orange-500 text-white' : 'bg-white text-orange-500 border border-orange-200'}`}
               >
                 Competition
               </button>
               {starredWordIds.size > 0 && (
                 <button 
                  onClick={() => setSessionConfig(prev => ({ ...prev, difficulty: 'STARRED' }))}
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${sessionConfig.difficulty === 'STARRED' ? 'bg-jsGold text-jsBlue' : 'bg-white text-jsGold border border-jsGold'}`}
                 >
                   Starred
                 </button>
               )}
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
               />
             ) : (
               <div className="py-20 text-center text-slate-400 uppercase font-black text-xs tracking-widest">
                 No words found in this category.
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

      <footer className="bg-jsBlue dark:bg-slate-900 text-white pt-12 pb-8 border-t-[6px] border-jsGold transition-colors">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <img src={logoUrl} alt="Junior Speller Ghana" className="h-14 w-auto mb-4" />
              <p className="text-jsGold font-black uppercase text-[10px] tracking-[0.2em] mb-4 opacity-80">
                Learn, Earn and Spell
              </p>
              <p className="text-white/60 text-[11px] font-bold leading-relaxed max-w-xs">
                The official companion study tool for the National Junior Speller Competition champions in Ghana.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-start space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-jsGold shrink-0" />
                <p className="text-[11px] font-bold text-white/80 leading-relaxed">
                  Dansoman Exhibition Roundabout<br/>
                  Dansoman High Street on top of CBG Bank,<br/>
                  Accra – Ghana
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-jsGold shrink-0" />
                <div className="flex flex-col gap-1 text-[11px] font-bold text-white/80">
                  <a href="tel:+233246040422" className="hover:text-jsGold">+233 (0)246040422</a>
                  <a href="tel:+233548119184" className="hover:text-jsGold">+233 (0)548119184</a>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end">
              <a 
                href="mailto:thejuniorspeller@gmail.com" 
                className="bg-jsGold text-jsBlue font-black py-4 px-8 rounded-2xl flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 shadow-xl text-xs uppercase tracking-widest mb-4"
              >
                <Mail className="w-4 h-4" /> Contact Support
              </a>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest text-center md:text-right">
                thejuniorspeller@gmail.com
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col items-center gap-6">
            <div className="flex items-center gap-5">
              <a href="https://wa.link/j9jjk4" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-green-500 rounded-full transition-all group">
                <MessageCircle className="w-5 h-5 text-white/60 group-hover:text-white" />
              </a>
              <a href="https://www.tiktok.com/@juniorspeller?lang=en" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-black rounded-full transition-all group">
                <Music className="w-5 h-5 text-white/60 group-hover:text-white" />
              </a>
              <a href="https://twitter.com/SpellerJun53163" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-black rounded-full transition-all group">
                <Twitter className="w-5 h-5 text-white/60 group-hover:text-white" />
              </a>
              <a href="https://www.facebook.com/nationaljuniorspeller" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-blue-600 rounded-full transition-all group">
                <Facebook className="w-5 h-5 text-white/60 group-hover:text-white" />
              </a>
              <a href="https://www.instagram.com/juniorspeller1/" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-pink-600 rounded-full transition-all group">
                <Instagram className="w-5 h-5 text-white/60 group-hover:text-white" />
              </a>
            </div>
            
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] text-center">
              © 2024 National Junior Speller Ghana
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
