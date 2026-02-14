
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, HelpCircle, Mic, MicOff, Keyboard, Eye, Timer, ChevronLeft, ChevronRight, Award, RotateCcw, Lightbulb, AlertCircle, Loader2, Star, Flame, Trophy, ShieldCheck, Gavel } from 'lucide-react';
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
  isCompetition?: boolean;
}

const GAME_TIMER_SECONDS = 80;

export const SpellingGame: React.FC<SpellingGameProps> = ({ 
  words, initialIndex, solvedWordIds, starredWordIds, onWordSolved, onToggleStar, streak, bestStreak, onStreakReset, isCompetition = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [userInput, setUserInput] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG' | 'JUDGING'>('IDLE');
  const [revealDefinition, setRevealDefinition] = useState(false);
  const [inputMode, setInputMode] = useState<'VOICE' | 'KEYBOARD'>('VOICE');
  const [timeLeft, setTimeLeft] = useState(GAME_TIMER_SECONDS);
  const [hintUsed, setHintUsed] = useState(false);
  
  // Ref to track if we just came from a failure to prevent auto-speaking when user hits "Try Again"
  const hasFailedCurrentAttempt = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wasListeningRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSpeakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { speak, isSpeaking, stop: stopSpeaking } = useElevenLabsSpeech();
  const { isListening, transcript, interimTranscript, startListening, resetTranscript, error: speechError } = useSpeechRecognition();
  
  const currentWord = words[currentIndex];
  const isLastWord = currentIndex === words.length - 1;
  const isFirstWord = currentIndex === 0;
  const isSolved = solvedWordIds.has(`${currentWord.difficulty}:${currentWord.word.toLowerCase()}`);
  const isStarred = starredWordIds.has(`${currentWord.difficulty}:${currentWord.word.toLowerCase()}`);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Handle word transitions
  useEffect(() => {
    setUserInput('');
    setStatus('IDLE');
    setRevealDefinition(false);
    resetTranscript();
    setTimeLeft(GAME_TIMER_SECONDS);
    setHintUsed(false);
    hasFailedCurrentAttempt.current = false; // Reset failure flag for new word
    
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

    // Auto-speak logic: Only if unsolved AND we haven't failed this attempt yet
    if (!isSolved && !hasFailedCurrentAttempt.current) {
        if (autoSpeakTimerRef.current) clearTimeout(autoSpeakTimerRef.current);
        autoSpeakTimerRef.current = setTimeout(() => {
            const prompt = isCompetition ? `The word is ${currentWord.word}.` : currentWord.word;
            speak(prompt);
        }, 1200);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSpeakTimerRef.current) clearTimeout(autoSpeakTimerRef.current);
    };
  }, [currentIndex, isCompetition, isSolved]);

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
    if (hintUsed || status !== 'IDLE' || isCompetition) return;
    setHintUsed(true);
    const firstLetter = currentWord.word.charAt(0).toUpperCase();
    speak(`The word starts with the letter ${firstLetter}.`);
  };

  const checkSpelling = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || status === 'JUDGING' || status === 'CORRECT') return;

    setStatus('JUDGING');
    const cleanedInput = userInput.trim().toLowerCase();
    const target = currentWord.word.toLowerCase();
    const altTarget = currentWord.altSpelling?.toLowerCase();

    await new Promise(r => setTimeout(r, 800));

    if (cleanedInput === target || cleanedInput === altTarget) {
      if (timerRef.current) clearInterval(timerRef.current);
      setStatus('CORRECT');
      onWordSolved(currentWord);
      triggerConfetti();
      
      const praises = ["Correct!", "Splendid!", "Excellent!", "Masterful!", "Accurate!"];
      const randomPraise = praises[Math.floor(Math.random() * praises.length)];
      speak(randomPraise);
      
      setTimeout(nextWord, 1800);
    } else {
      setStatus('WRONG');
      hasFailedCurrentAttempt.current = true; // Mark as failed so auto-speak won't trigger if they reset
      onStreakReset();
      setRevealDefinition(true);
      speak(`Incorrect. The correct spelling is ${currentWord.word.split('').join(' ')}.`);
    }
  };

  useEffect(() => {
    if (wasListeningRef.current && !isListening && inputMode === 'VOICE') {
      if (userInput.trim().length > 0 && status === 'IDLE') {
        checkSpelling();
      }
    }
    wasListeningRef.current = isListening;
  }, [isListening, inputMode, userInput, status]);

  return (
    <div className="w-full flex flex-col gap-2 sm:gap-4 max-w-lg mx-auto pb-4 sm:pb-8 flex-grow min-h-0">
      
      <ProgressBar current={currentIndex} total={words.length} level={isCompetition ? 'Competition' : currentWord.difficulty} />

      <div className="flex justify-between items-center px-2 sm:px-4 mb-1">
        <button 
          onClick={prevWord} 
          disabled={isFirstWord || status === 'JUDGING' || isCompetition} 
          className="p-2 sm:p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm text-zinc-300 hover:text-black dark:hover:text-jsGold disabled:opacity-30 border border-zinc-100 dark:border-zinc-800 transition-all active:scale-90"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        
        <div className="flex flex-col items-center flex-1 mx-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-full border transition-all duration-300 ${streak >= 5 ? 'bg-zinc-950 text-jsGold border-jsGold shadow-lg animate-pulse' : 'bg-zinc-50 dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-400 border-zinc-100 dark:border-zinc-800'}`}>
             <Flame className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${streak > 0 ? 'fill-current' : ''}`} />
             <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">STREAK: {streak}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            <Trophy className="w-2.5 h-2.5" /> BEST: {bestStreak}
          </div>
        </div>

        <button 
          onClick={nextWord} 
          disabled={isLastWord || status === 'JUDGING' || (isCompetition && !isSolved)} 
          className="p-2 sm:p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm text-zinc-300 hover:text-black dark:hover:text-jsGold disabled:opacity-30 border border-zinc-100 dark:border-zinc-800 transition-all active:scale-90"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <div className={`bg-white dark:bg-zinc-950 rounded-[2.5rem] shadow-2xl border-t-8 border-black dark:border-jsGold p-5 sm:p-8 space-y-4 sm:space-y-6 relative transition-all flex-grow min-h-0 flex flex-col justify-center ${status === 'WRONG' ? 'animate-shake' : ''}`}>
        
        <div className="absolute top-5 sm:top-6 right-7 sm:right-8 flex gap-3 z-10">
          <button 
            onClick={() => onToggleStar(currentWord)} 
            className={`transition-all active:scale-[1.6] duration-200 transform ${isStarred ? 'text-jsGold fill-jsGold scale-110' : 'text-zinc-200 hover:text-jsGold'}`}
          >
            <Star className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
          {isSolved && <Award className="w-6 h-6 sm:w-7 sm:h-7 text-green-500 animate-in zoom-in" />}
        </div>
        
        <div className={`absolute top-5 sm:top-6 left-7 sm:left-8 px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-black border flex items-center gap-1 ${timeLeft < 15 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-100 dark:border-zinc-800'}`}>
          <Timer className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {timeLeft}S
        </div>

        <div className="flex flex-col items-center gap-4 sm:gap-6 pt-6 sm:pt-4">
          <div className="relative group">
            <div className="absolute -inset-4 bg-jsGold/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <button 
              onClick={() => speak(currentWord.word)}
              disabled={status === 'JUDGING'}
              className={`w-24 h-24 sm:w-32 sm:h-32 bg-black dark:bg-jsGold text-jsGold dark:text-black rounded-full flex items-center justify-center shadow-xl border-4 border-white dark:border-zinc-800 transform transition-all active:scale-90 ${isSpeaking ? 'ring-8 ring-jsGold/20 scale-105' : 'hover:scale-105'} disabled:opacity-50 relative`}
            >
              <Volume2 className={`w-10 h-10 sm:w-16 sm:h-16 ${isSpeaking ? 'animate-pulse' : ''}`} />
              <div className="absolute -bottom-1 -right-1 bg-jsGold dark:bg-white text-black p-1.5 rounded-lg shadow-md border-2 border-white dark:border-zinc-800">
                 <Gavel className="w-4 h-4" />
              </div>
            </button>
          </div>
          
          <div className="flex gap-2 w-full max-w-[280px]">
            {!isCompetition && (
              <button onClick={useHint} disabled={hintUsed || status !== 'IDLE'} className="flex-1 flex items-center justify-center gap-2 bg-zinc-50 dark:bg-zinc-900 hover:bg-jsGold hover:text-black text-black dark:text-jsGold py-3 rounded-2xl font-black text-[9px] uppercase border border-zinc-100 dark:border-zinc-800 transition-all disabled:opacity-40">
                <Lightbulb className="w-3.5 h-3.5" /> Clue
              </button>
            )}
            <button onClick={() => setRevealDefinition(!revealDefinition)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[9px] uppercase border transition-all ${revealDefinition ? 'bg-black text-jsGold border-black dark:bg-jsGold dark:text-black dark:border-jsGold' : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800'}`}>
              <HelpCircle className="w-3.5 h-3.5" /> {isCompetition ? 'Part of Speech' : 'Meaning'}
            </button>
          </div>

          {revealDefinition && (
            <div className="w-full space-y-2 animate-in fade-in slide-in-from-top-2">
              <div className="w-full bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border-l-4 border-black dark:border-jsGold">
                <p className="text-black dark:text-zinc-300 italic serif text-sm leading-relaxed">
                  {isCompetition ? (currentWord.partOfSpeech || "N/A") : (currentWord.definition || "No definition available.")}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center px-1">
            <button onClick={() => { setInputMode(inputMode === 'VOICE' ? 'KEYBOARD' : 'VOICE'); setStatus('IDLE'); }} className="text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 hover:text-black dark:hover:text-jsGold transition-colors">
              {inputMode === 'VOICE' ? <><Keyboard className="w-3.5 h-3.5" /> Use Keyboard</> : <><Mic className="w-3.5 h-3.5" /> Use Voice</>}
            </button>
            {userInput && status !== 'CORRECT' && (
              <button onClick={() => { setUserInput(''); resetTranscript(); setStatus('IDLE'); }} className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all">
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>

          <div className="relative">
            {status === 'JUDGING' && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-black/70 z-10 rounded-3xl">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-black dark:text-jsGold" />
                    <span className="text-[10px] font-black uppercase text-black dark:text-jsGold">The Judge is deciding...</span>
                </div>
              </div>
            )}
            <input
              ref={inputRef} type="text" value={userInput} readOnly={inputMode === 'VOICE' || status === 'JUDGING'}
              onChange={(e) => { setStatus('IDLE'); setUserInput(e.target.value); }}
              placeholder={inputMode === 'VOICE' ? (isListening ? "Listening..." : "Tap Mic") : "Spell it..."}
              className={`w-full text-center word-input font-black py-7 sm:py-10 bg-zinc-50 dark:bg-zinc-900 rounded-[1.8rem] sm:rounded-3xl border-4 outline-none transition-all uppercase tracking-[0.2em] font-serif
                ${status === 'IDLE' || status === 'JUDGING' ? 'border-zinc-100 dark:border-zinc-800 focus:border-black dark:focus:border-jsGold text-black dark:text-white' : ''}
                ${status === 'CORRECT' ? 'border-green-400 text-green-700 bg-green-50 dark:bg-green-900/20' : ''}
                ${status === 'WRONG' ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/20' : ''}
              `}
              autoComplete="off" spellCheck="false"
            />
          </div>

          {inputMode === 'VOICE' && status === 'IDLE' && (
            <div className="flex flex-col items-center gap-3">
              <button 
                onClick={() => { resetTranscript(); setUserInput(''); startListening(); }}
                disabled={isListening || isSpeaking}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all shadow-2xl border-4 border-white dark:border-zinc-800 ${isListening ? 'bg-red-600 text-white animate-pulse ring-8 ring-red-100 dark:ring-red-900/20' : 'bg-black dark:bg-jsGold text-white dark:text-black hover:scale-110 active:scale-95'}`}
              >
                {isListening ? <MicOff className="w-9 h-9 sm:w-10 sm:h-10" /> : <Mic className="w-9 h-9 sm:w-10 sm:h-10" />}
              </button>
              <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${isListening ? 'text-red-600 animate-pulse' : 'text-zinc-400'}`}>
                {isListening ? 'Speak your spelling' : 'Hold Mic and Spell Out Loud'}
              </p>
            </div>
          )}

          {inputMode === 'KEYBOARD' && status === 'IDLE' && (
            <button onClick={checkSpelling} disabled={!userInput.trim()} className="w-full bg-black dark:bg-jsGold text-jsGold dark:text-black py-5 sm:py-6 rounded-[1.8rem] sm:rounded-3xl font-black text-[11px] sm:text-xs uppercase tracking-[0.2em] shadow-xl active:scale-[0.98] transition-all disabled:opacity-50">
              Finalize Answer
            </button>
          )}

          {status === 'WRONG' && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3 animate-in slide-in-from-bottom-2">
              <button onClick={() => { setStatus('IDLE'); setUserInput(''); }} className="bg-black dark:bg-jsGold text-jsGold dark:text-black py-4 sm:py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95">
                Try Again
              </button>
              <button onClick={() => { setUserInput(currentWord.word); setStatus('IDLE'); }} className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-jsGold text-black dark:text-jsGold py-4 sm:py-5 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95">
                <Eye className="w-4 h-4" /> Correct Answer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
