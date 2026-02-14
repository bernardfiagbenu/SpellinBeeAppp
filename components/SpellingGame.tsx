import React, { useState, useEffect, useRef } from 'react';
import { Volume2, HelpCircle, Mic, MicOff, Keyboard, Eye, Timer, ChevronLeft, ChevronRight, Award, RotateCcw, Lightbulb, AlertCircle, Loader2, Star, Flame, Trophy } from 'lucide-react';
import { SpellingWord } from '../types';
import { useElevenLabsSpeech } from '../hooks/useElevenLabsSpeech';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { triggerConfetti } from '../utils/confetti';
import { ProgressBar } from './ProgressBar';

interface SpellingGameProps {
  words: SpellingWord[];
  initialIndex: number;
  solvedWordIds: Set<string>;
  starredWordIds: Set<string>;
  onWordSolved: (word: SpellingWord) => void;
  onToggleStar: (word: SpellingWord) => void;
  streak: number;
  bestStreak: number;
  onStreakReset: () => void;
}

const GAME_TIMER_SECONDS = 80;

export const SpellingGame: React.FC<SpellingGameProps> = ({ 
  words, initialIndex, solvedWordIds, starredWordIds, onWordSolved, onToggleStar, streak, bestStreak, onStreakReset 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [userInput, setUserInput] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG' | 'JUDGING'>('IDLE');
  const [revealDefinition, setRevealDefinition] = useState(false);
  const [inputMode, setInputMode] = useState<'VOICE' | 'KEYBOARD'>('VOICE');
  const [timeLeft, setTimeLeft] = useState(GAME_TIMER_SECONDS);
  const [hintUsed, setHintUsed] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const wasListeningRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const { speak, isSpeaking, stop: stopSpeaking } = useElevenLabsSpeech();
  const { isListening, transcript, interimTranscript, startListening, resetTranscript, error: speechError } = useSpeechRecognition();
  
  const currentWord = words[currentIndex];
  const isLastWord = currentIndex === words.length - 1;
  const isFirstWord = currentIndex === 0;
  const hasDefinition = !!currentWord.definition;
  const isSolved = solvedWordIds.has(`${currentWord.difficulty}:${currentWord.word.toLowerCase()}`);
  const isStarred = starredWordIds.has(`${currentWord.difficulty}:${currentWord.word.toLowerCase()}`);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    setUserInput('');
    setStatus('IDLE');
    setRevealDefinition(false);
    resetTranscript();
    setTimeLeft(GAME_TIMER_SECONDS);
    setHintUsed(false);
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, resetTranscript]);

  useEffect(() => {
    if (transcript || interimTranscript) {
      const raw = transcript + interimTranscript;
      const cleaned = raw.replace(/\s+/g, '').replace(/\./g, '').replace(/,/g, '').toLowerCase();
      setUserInput(cleaned);
    }
  }, [transcript, interimTranscript]);

  const nextWord = () => !isLastWord && setCurrentIndex(p => p + 1);
  const prevWord = () => !isFirstWord && setCurrentIndex(p => p - 1);

  const useHint = () => {
    if (hintUsed || status !== 'IDLE') return;
    setHintUsed(true);
    const firstLetter = currentWord.word.charAt(0).toUpperCase();
    speak(`The word starts with the letter ${firstLetter}.`);
  };

  const checkSpelling = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || status === 'JUDGING' || status === 'CORRECT') return;

    setStatus('JUDGING');
    const cleanedInput = userInput.trim().toLowerCase();
    const target = currentWord.word.toLowerCase();
    const altTarget = currentWord.altSpelling?.toLowerCase();

    setTimeout(() => {
      if (cleanedInput === target || cleanedInput === altTarget) {
        if (timerRef.current) clearInterval(timerRef.current);
        setStatus('CORRECT');
        onWordSolved(currentWord);
        triggerConfetti();
        
        // Milestone logic
        if ((streak + 1) % 5 === 0) {
          speak(`Incredible! You are on a ${streak + 1} word streak!`);
        } else {
          speak(`Correct! Excellence!`);
        }
        
        setTimeout(nextWord, 1800);
      } else {
        setStatus('WRONG');
        onStreakReset();
        setRevealDefinition(true);
        speak(`Incorrect spelling.`);
      }
    }, 400);
  };

  useEffect(() => {
    if (wasListeningRef.current && !isListening && inputMode === 'VOICE') {
      if (userInput.trim().length > 0 && status === 'IDLE') {
        checkSpelling();
      }
    }
    wasListeningRef.current = isListening;
  }, [isListening, inputMode, userInput, status]);

  const getStreakBadge = () => {
    if (streak >= 20) return "UNSTOPPABLE";
    if (streak >= 15) return "LEGENDARY";
    if (streak >= 10) return "ON FIRE";
    if (streak >= 5) return "ELITE";
    return null;
  };

  return (
    <div className="w-full flex flex-col gap-3 max-w-lg mx-auto pb-8">
      
      <ProgressBar current={currentIndex} total={words.length} level={currentWord.difficulty} />

      {/* Nav & Streaks Row */}
      <div className="flex justify-between items-center px-4">
        <button onClick={prevWord} disabled={isFirstWord || status === 'JUDGING'} className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-300 hover:text-jsBlue disabled:opacity-30 transition-all border border-slate-100 dark:border-slate-700">
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col items-center">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${streak >= 5 ? 'bg-orange-500 text-white border-orange-400 shadow-lg animate-pulse' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-900/30'}`}>
             <Flame className={`w-3.5 h-3.5 ${streak > 0 ? 'fill-current' : ''}`} />
             <span className="text-[10px] font-black uppercase tracking-widest">{getStreakBadge() || 'STREAK'}: {streak}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-[8px] font-black text-slate-400 uppercase tracking-widest">
            <Trophy className="w-2.5 h-2.5" /> Best: {bestStreak}
          </div>
        </div>

        <button onClick={nextWord} disabled={isLastWord || status === 'JUDGING'} className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-300 hover:text-jsBlue disabled:opacity-30 transition-all border border-slate-100 dark:border-slate-700">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className={`bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-t-8 border-jsBlue dark:border-blue-600 p-6 md:p-8 space-y-5 relative transition-all ${status === 'WRONG' ? 'animate-shake' : ''}`}>
        
        {/* Elite Study List Star */}
        <div className="absolute top-6 right-8 flex gap-3">
          <button 
            onClick={() => onToggleStar(currentWord)} 
            className={`transition-all active:scale-[1.6] duration-200 transform ${isStarred ? 'text-yellow-400 fill-yellow-400 scale-110' : 'text-slate-200 hover:text-yellow-200 hover:scale-110'}`}
          >
            <Star className="w-7 h-7" />
          </button>
          {isSolved && <Award className="w-7 h-7 text-green-500 animate-in zoom-in" />}
        </div>
        
        <div className={`absolute top-6 left-8 px-3 py-1 rounded-full text-[10px] font-black border flex items-center gap-1 ${timeLeft < 15 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
          <Timer className="w-3 h-3" /> {timeLeft}S
        </div>

        {/* Word Center */}
        <div className="flex flex-col items-center gap-4 pt-6">
          <button 
            onClick={() => speak(currentWord.word)}
            disabled={status === 'JUDGING'}
            className={`w-28 h-28 md:w-36 md:h-36 bg-jsBlue dark:bg-blue-700 text-jsGold rounded-full flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-800 transform transition-all active:scale-90 ${isSpeaking ? 'ring-8 ring-jsGold/20 scale-105' : 'hover:scale-105'} disabled:opacity-50`}
          >
            <Volume2 className={`w-12 h-12 md:w-16 md:h-16 ${isSpeaking ? 'animate-pulse' : ''}`} />
          </button>
          
          <div className="flex gap-2 w-full max-w-[280px]">
            <button onClick={useHint} disabled={hintUsed || status !== 'IDLE'} className="flex-1 flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-jsGold hover:text-jsBlue text-jsBlue dark:text-blue-400 py-3.5 rounded-2xl font-black text-[9px] uppercase border border-slate-100 dark:border-slate-700 transition-all disabled:opacity-40">
              <Lightbulb className="w-3.5 h-3.5" /> Clue
            </button>
            <button onClick={() => setRevealDefinition(!revealDefinition)} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-[9px] uppercase border transition-all ${revealDefinition ? 'bg-jsBlue text-white border-jsBlue' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200'}`}>
              <HelpCircle className="w-3.5 h-3.5" /> Meaning
            </button>
          </div>

          {revealDefinition && hasDefinition && (
            <div className="w-full bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border-l-4 border-jsBlue animate-in fade-in slide-in-from-top-2">
              <p className="text-jsBlue dark:text-blue-300 italic serif text-sm leading-relaxed">"{currentWord.definition}"</p>
            </div>
          )}
        </div>

        {/* Input Controls */}
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center px-1">
            <button onClick={() => { setInputMode(inputMode === 'VOICE' ? 'KEYBOARD' : 'VOICE'); setStatus('IDLE'); }} className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 hover:text-jsBlue transition-colors">
              {inputMode === 'VOICE' ? <><Keyboard className="w-3.5 h-3.5" /> Keyboard Mode</> : <><Mic className="w-3.5 h-3.5" /> Voice Mode</>}
            </button>
            {userInput && status !== 'CORRECT' && (
              <button onClick={() => { setUserInput(''); resetTranscript(); setStatus('IDLE'); }} className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all">
                <RotateCcw className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          <div className="relative">
            {status === 'JUDGING' && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-900/70 z-10 rounded-3xl">
                <Loader2 className="w-8 h-8 animate-spin text-jsBlue dark:text-blue-400" />
              </div>
            )}
            <input
              ref={inputRef} type="text" value={userInput} readOnly={inputMode === 'VOICE' || status === 'JUDGING'}
              onChange={(e) => { setStatus('IDLE'); setUserInput(e.target.value); }}
              placeholder={inputMode === 'VOICE' ? (isListening ? "Listening..." : "Tap Mic to Start") : "Spell the word..."}
              className={`w-full text-center word-input font-black py-9 md:py-11 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-4 outline-none transition-all uppercase tracking-[0.25em] font-serif
                ${status === 'IDLE' || status === 'JUDGING' ? 'border-slate-100 dark:border-slate-800 focus:border-jsBlue text-slate-900 dark:text-white' : ''}
                ${status === 'CORRECT' ? 'border-green-400 text-green-700 bg-green-50 dark:bg-green-900/10' : ''}
                ${status === 'WRONG' ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/10' : ''}
              `}
              autoComplete="off" spellCheck="false"
            />
          </div>

          {inputMode === 'VOICE' && status === 'IDLE' && (
            <div className="flex flex-col items-center gap-4">
              <button 
                onClick={() => { resetTranscript(); setUserInput(''); startListening(); }}
                disabled={isListening || isSpeaking || status === 'JUDGING'}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl border-4 border-white dark:border-slate-800 ${isListening ? 'bg-red-600 text-white animate-pulse ring-8 ring-red-100 dark:ring-red-900/20' : 'bg-jsBlue dark:bg-blue-700 text-white hover:scale-110 active:scale-95'}`}
              >
                {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
              </button>
              <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${isListening ? 'text-red-600 animate-pulse' : 'text-slate-400'}`}>
                {isListening ? 'Stop speaking to submit' : 'Hold Mic and Spell'}
              </p>
            </div>
          )}

          {inputMode === 'KEYBOARD' && status === 'IDLE' && (
            <button onClick={checkSpelling} disabled={!userInput.trim() || status === 'JUDGING'} className="w-full bg-jsBlue dark:bg-blue-700 text-jsGold py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-[0.98] transition-all disabled:opacity-50">
              Submit Answer
            </button>
          )}

          {status === 'WRONG' && (
            <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-bottom-2">
              <button onClick={() => { setStatus('IDLE'); setUserInput(''); }} className="bg-jsBlue text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95">
                Try Again
              </button>
              <button onClick={() => { setUserInput(currentWord.word); setStatus('IDLE'); }} className="bg-white dark:bg-slate-800 border-2 border-jsBlue text-jsBlue dark:text-blue-400 py-5 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95 shadow-sm">
                <Eye className="w-4 h-4" /> Reveal Word
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};