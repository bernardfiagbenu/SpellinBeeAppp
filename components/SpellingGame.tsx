
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
  speechRate: number;
}

const GAME_TIMER_SECONDS = 120; 

export const SpellingGame: React.FC<SpellingGameProps> = ({ 
  words, initialIndex, solvedWordIds, starredWordIds, onWordSolved, onToggleStar, streak, bestStreak, onStreakReset, isCompetition = false, speechRate
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [userInput, setUserInput] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG' | 'JUDGING'>('IDLE');
  const [revealDefinition, setRevealDefinition] = useState(false);
  const [inputMode, setInputMode] = useState<'VOICE' | 'KEYBOARD'>('VOICE');
  const [timeLeft, setTimeLeft] = useState(GAME_TIMER_SECONDS);
  const [hintUsed, setHintUsed] = useState(false);
  
  const hasFailedCurrentAttempt = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wasListeningRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSpeakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Ref to track which words have auto-pronounced in this specific session
  const sessionHeardIds = useRef<Set<string>>(new Set());
  
  const { speak, isSpeaking, stop: stopSpeaking } = useElevenLabsSpeech(speechRate);
  const { isListening, transcript, interimTranscript, startListening, stopListening, resetTranscript, error: speechError } = useSpeechRecognition();
  
  const currentWord = words[currentIndex];
  const isLastWord = currentIndex === words.length - 1;
  const isFirstWord = currentIndex === 0;
  const wordKey = `${currentWord.difficulty}:${currentWord.word.toLowerCase()}`;
  const isSolved = solvedWordIds.has(wordKey);
  const isStarred = starredWordIds.has(wordKey);

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
    hasFailedCurrentAttempt.current = false;
    
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

    // AUTO-PRONUNCIATION LOGIC
    // 1. Only play if word hasn't been heard in this browser session.
    // 2. Suppress if the user just failed an attempt (waiting for manual click).
    if (!isSolved && !hasFailedCurrentAttempt.current && !sessionHeardIds.current.has(wordKey)) {
        if (autoSpeakTimerRef.current) clearTimeout(autoSpeakTimerRef.current);
        autoSpeakTimerRef.current = setTimeout(() => {
            const prompt = isCompetition ? `The word is ${currentWord.word}.` : currentWord.word;
            speak(prompt);
            sessionHeardIds.current.add(wordKey);
        }, 1000); 
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSpeakTimerRef.current) clearTimeout(autoSpeakTimerRef.current);
      stopSpeaking();
    };
  }, [currentIndex, isCompetition, isSolved, speak, stopSpeaking, wordKey]);

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

    await new Promise(r => setTimeout(r, 600));

    if (cleanedInput === target) {
      if (timerRef.current) clearInterval(timerRef.current);
      setStatus('CORRECT');
      onWordSolved(currentWord);
      triggerConfetti();
      
      const praises = ["Correct!", "Splendid!", "Excellent!", "Masterful!", "Accurate!"];
      const randomPraise = praises[Math.floor(Math.random() * praises.length)];
      speak(randomPraise);
      
      // Moving to next word will automatically trigger the Pronunciation effect
      setTimeout(nextWord, 1800);
    } else {
      setStatus('WRONG');
      hasFailedCurrentAttempt.current = true;
      onStreakReset();
      setRevealDefinition(true);
      speak(`Incorrect. The word is spelled ${currentWord.word.split('').join(' ')}.`);
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
    <div className="w-full flex flex-col gap-2 sm:gap-4 max-w-lg mx-auto pb-4 flex-grow min-h-0 no-select">
      
      <ProgressBar current={currentIndex} total={words.length} level={isCompetition ? 'Competition' : currentWord.difficulty} />

      <div className="flex justify-between items-center px-1 sm:px-4 mb-0.5">
        <button 
          onClick={prevWord} 
          disabled={isFirstWord || status === 'JUDGING' || isCompetition} 
          className="p-2 sm:p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm text-zinc-300 hover:text-black dark:hover:text-jsGold disabled:opacity-20 border border-zinc-100 dark:border-zinc-800 transition-all active:scale-90"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        
        <div className="flex flex-col items-center flex-1 mx-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all duration-300 ${streak >= 5 ? 'bg-zinc-950 text-jsGold border-jsGold shadow-lg animate-pulse' : 'bg-zinc-50 dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-400 border-zinc-100 dark:border-zinc-800'}`}>
             <Flame className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${streak > 0 ? 'fill-current text-orange-500' : ''}`} />
             <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">STREAK: {streak}</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            <Trophy className="w-2.5 h-2.5" /> BEST: {bestStreak}
          </div>
        </div>

        <button 
          onClick={nextWord} 
          disabled={isLastWord || status === 'JUDGING' || (isCompetition && !isSolved)} 
          className="p-2 sm:p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm text-zinc-300 hover:text-black dark:hover:text-jsGold disabled:opacity-20 border border-zinc-100 dark:border-zinc-800 transition-all active:scale-90"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <div className={`bg-white dark:bg-zinc-950 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border-t-8 border-black dark:border-jsGold p-4 sm:p-8 space-y-3 sm:space-y-6 relative transition-all flex-grow min-h-0 flex flex-col justify-center ${status === 'WRONG' ? 'animate-shake' : ''}`}>
        
        <div className="absolute top-4 sm:top-6 right-6 sm:right-8 flex gap-2 sm:gap-3 z-10">
          <button 
            onClick={() => onToggleStar(currentWord)} 
            className={`transition-all active:scale-[1.6] duration-200 transform ${isStarred ? 'text-jsGold fill-jsGold scale-110' : 'text-zinc-200 hover:text-jsGold'}`}
          >
            <Star className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
          {isSolved && <Award className="w-6 h-6 sm:w-7 sm:h-7 text-green-500 animate-in zoom-in" />}
        </div>
        
        <div className={`absolute top-4 sm:top-6 left-6 sm:left-8 px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black border flex items-center gap-1 ${timeLeft < 20 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-100 dark:border-zinc-800'}`}>
          <Timer className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {timeLeft}S
        </div>

        <div className="flex flex-col items-center gap-3 sm:gap-6 pt-6 sm:pt-4">
          <div className="relative group">
            <button 
              onClick={() => speak(currentWord.word)}
              disabled={status === 'JUDGING'}
              className={`w-20 h-20 sm:w-32 sm:h-32 bg-black dark:bg-jsGold text-jsGold dark:text-black rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-zinc-800 transform transition-all active:scale-90 ${isSpeaking ? 'ring-8 ring-jsGold/20 scale-105' : 'hover:scale-105'} disabled:opacity-50 relative`}
            >
              <Volume2 className={`w-8 h-8 sm:w-16 sm:h-16 ${isSpeaking ? 'animate-pulse' : ''}`} />
              <div className="absolute -bottom-1 -right-1 bg-jsGold dark:bg-white text-black p-1.5 rounded-lg shadow-md border-2 border-white dark:border-zinc-800">
                 <Gavel className="w-4 h-4" />
              </div>
            </button>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase text-zinc-400 tracking-widest whitespace-nowrap">Pronounce</span>
          </div>
          
          <div className="flex gap-2 w-full max-w-[280px]">
            {!isCompetition && (
              <button onClick={useHint} disabled={hintUsed || status !== 'IDLE'} className="flex-1 flex items-center justify-center gap-2 bg-zinc-50 dark:bg-zinc-900 hover:bg-jsGold hover:text-black text-black dark:text-jsGold py-2.5 sm:py-3 rounded-2xl font-black text-[9px] uppercase border border-zinc-100 dark:border-zinc-800 transition-all disabled:opacity-40">
                <Lightbulb className="w-3.5 h-3.5" /> Clue
              </button>
            )}
            <button onClick={() => setRevealDefinition(!revealDefinition)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-2xl font-black text-[9px] uppercase border transition-all ${revealDefinition ? 'bg-black text-jsGold border-black dark:bg-jsGold dark:text-black dark:border-jsGold' : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800'}`}>
              <HelpCircle className="w-3.5 h-3.5" /> {isCompetition ? 'Part of Speech' : 'Meaning'}
            </button>
          </div>

          {revealDefinition && (
            <div className="w-full space-y-2 animate-in fade-in slide-in-from-top-2">
              <div className="w-full bg-zinc-50 dark:bg-zinc-900/50 p-3 sm:p-4 rounded-2xl border-l-4 border-black dark:border-jsGold">
                <p className="text-black dark:text-zinc-300 italic serif text-[12px] sm:text-sm leading-relaxed">
                  {isCompetition ? (currentWord.partOfSpeech || "Information restricted for this round.") : (currentWord.definition || "No definition available for this entry.")}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center px-1">
            <button onClick={() => { setInputMode(inputMode === 'VOICE' ? 'KEYBOARD' : 'VOICE'); setStatus('IDLE'); stopListening(); }} className="text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 hover:text-black dark:hover:text-jsGold transition-colors">
              {inputMode === 'VOICE' ? <><Keyboard className="w-3.5 h-3.5" /> Use Keyboard</> : <><Mic className="w-3.5 h-3.5" /> Use Voice</>}
            </button>
            {userInput && status !== 'CORRECT' && (
              <button onClick={() => { setUserInput(''); resetTranscript(); setStatus('IDLE'); }} className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5 px-2 py-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all">
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>

          <div className="relative">
            {status === 'JUDGING' && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 z-20 rounded-3xl backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 sm:w-8 h-8 animate-spin text-black dark:text-jsGold" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase text-black dark:text-jsGold">Deliberating...</span>
                </div>
              </div>
            )}
            <input
              ref={inputRef} type="text" value={userInput} readOnly={inputMode === 'VOICE' || status === 'JUDGING'}
              onChange={(e) => { setStatus('IDLE'); setUserInput(e.target.value); }}
              onKeyDown={(e) => e.key === 'Enter' && checkSpelling()}
              placeholder={inputMode === 'VOICE' ? (isListening ? "Listening..." : "Tap Mic") : "Spell it..."}
              className={`w-full text-center word-input font-black py-6 sm:py-10 bg-zinc-50 dark:bg-zinc-900 rounded-[1.5rem] sm:rounded-3xl border-4 outline-none transition-all uppercase tracking-[0.2em] font-serif
                ${status === 'IDLE' || status === 'JUDGING' ? 'border-zinc-100 dark:border-zinc-800 focus:border-black dark:focus:border-jsGold text-black dark:text-white shadow-inner' : ''}
                ${status === 'CORRECT' ? 'border-green-400 text-green-700 bg-green-50 dark:bg-green-900/20 shadow-[0_0_20px_rgba(74,222,128,0.2)]' : ''}
                ${status === 'WRONG' ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : ''}
              `}
              autoComplete="off" spellCheck="false"
            />
          </div>

          {inputMode === 'VOICE' && status === 'IDLE' && (
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => { resetTranscript(); setUserInput(''); startListening(); }}
                disabled={isListening || isSpeaking}
                className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all shadow-xl border-4 border-white dark:border-zinc-800 ${isListening ? 'bg-red-600 text-white animate-pulse ring-8 ring-red-100 dark:ring-red-900/20' : 'bg-black dark:bg-jsGold text-white dark:text-black hover:scale-105 active:scale-90'}`}
              >
                {isListening ? <MicOff className="w-8 h-8 sm:w-10 sm:h-10" /> : <Mic className="w-8 h-8 sm:w-10 sm:h-10" />}
              </button>
              <p className={`text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] transition-all ${isListening ? 'text-red-600 scale-110' : 'text-zinc-400'}`}>
                {isListening ? 'Spelling in progress...' : 'Hold Mic to Spell'}
              </p>
            </div>
          )}

          {inputMode === 'KEYBOARD' && status === 'IDLE' && (
            <button onClick={checkSpelling} disabled={!userInput.trim()} className="w-full bg-black dark:bg-jsGold text-jsGold dark:text-black py-4 sm:py-6 rounded-[1.5rem] sm:rounded-3xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] shadow-lg active:scale-[0.98] transition-all disabled:opacity-40">
              Submit Answer
            </button>
          )}

          {status === 'WRONG' && (
            <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-bottom-2">
              <button onClick={() => { setStatus('IDLE'); setUserInput(''); resetTranscript(); }} className="bg-black dark:bg-jsGold text-jsGold dark:text-black py-3.5 sm:py-5 rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all">
                Retry Word
              </button>
              <button onClick={() => { setUserInput(currentWord.word); setStatus('IDLE'); }} className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-jsGold text-black dark:text-jsGold py-3.5 sm:py-5 rounded-2xl font-black text-[9px] sm:text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all">
                <Eye className="w-3.5 h-3.5 sm:w-4 h-4" /> Reveal Answer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
