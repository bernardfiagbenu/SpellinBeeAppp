
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, HelpCircle, Mic, MicOff, Keyboard, Eye, Timer, ChevronLeft, ChevronRight, Award, RotateCcw, Lightbulb, AlertCircle, Loader2 } from 'lucide-react';
import { SpellingWord } from '../types';
import { useElevenLabsSpeech } from '../hooks/useElevenLabsSpeech';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { triggerConfetti } from '../utils/confetti';
import { ProgressBar } from './ProgressBar';

interface SpellingGameProps {
  words: SpellingWord[];
  initialIndex: number;
  solvedWordIds: Set<string>;
  onWordSolved: (word: SpellingWord) => void;
}

const GAME_TIMER_SECONDS = 80;

export const SpellingGame: React.FC<SpellingGameProps> = ({ words, initialIndex, solvedWordIds, onWordSolved }) => {
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
  const isAlreadySolved = solvedWordIds.has(`${currentWord.difficulty}:${currentWord.word.toLowerCase()}`);

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

  // Fix: Implemented the useHint function to provide a first-letter clue to the student.
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

    // Small delay to simulate the "Judge" thinking
    setTimeout(() => {
      if (cleanedInput === target || cleanedInput === altTarget) {
        if (timerRef.current) clearInterval(timerRef.current);
        setStatus('CORRECT');
        onWordSolved(currentWord);
        triggerConfetti();
        speak(`Correct! well done.`);
        setTimeout(nextWord, 1800);
      } else {
        setStatus('WRONG');
        setRevealDefinition(true);
        speak(`Incorrect.`);
      }
    }, 400);
  };

  // VITAL: Automatic validation only for Voice mode when speech stops
  useEffect(() => {
    if (wasListeningRef.current && !isListening && inputMode === 'VOICE') {
      if (userInput.trim().length > 0 && status === 'IDLE') {
        checkSpelling();
      }
    }
    wasListeningRef.current = isListening;
  }, [isListening, inputMode, userInput, status]);

  return (
    <div className="w-full flex flex-col gap-3 max-w-lg mx-auto pb-8">
      
      <ProgressBar current={currentIndex} total={words.length} level={currentWord.difficulty} />

      {/* Navigation Row */}
      <div className="flex justify-between items-center px-4">
        <button 
          onClick={prevWord} 
          disabled={isFirstWord || status === 'JUDGING'} 
          className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-300 hover:text-jsBlue disabled:opacity-30 transition-all border border-slate-100 dark:border-slate-700"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="text-sm font-black text-jsBlue dark:text-blue-400 uppercase tracking-widest">{currentWord.difficulty}</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{currentIndex + 1} / {words.length}</p>
        </div>
        <button 
          onClick={nextWord} 
          disabled={isLastWord || status === 'JUDGING'} 
          className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-300 hover:text-jsBlue disabled:opacity-30 transition-all border border-slate-100 dark:border-slate-700"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className={`bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border-t-8 border-jsBlue dark:border-blue-600 p-5 md:p-8 space-y-5 relative transition-all ${status === 'WRONG' ? 'animate-shake' : ''}`}>
        
        {isAlreadySolved && <div className="absolute top-4 right-6 text-green-500"><Award className="w-5 h-5" /></div>}
        
        <div className={`absolute top-4 left-6 px-3 py-1 rounded-full text-[10px] font-black border flex items-center gap-1 transition-all ${timeLeft < 15 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
          <Timer className="w-3 h-3" /> {timeLeft}S
        </div>

        {/* Judge Section */}
        <div className="flex flex-col items-center gap-4 pt-4">
          <button 
            onClick={() => speak(currentWord.word)}
            disabled={status === 'JUDGING'}
            className={`w-24 h-24 md:w-28 md:h-28 bg-jsBlue dark:bg-blue-700 text-jsGold rounded-full flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-800 transform transition-all active:scale-90 ${isSpeaking ? 'ring-8 ring-jsGold/20 scale-105' : ''} disabled:opacity-50`}
          >
            <Volume2 className={`w-10 h-10 md:w-12 md:h-12 ${isSpeaking ? 'animate-pulse' : ''}`} />
          </button>
          
          <div className="flex gap-2 w-full">
            <button 
              onClick={useHint} 
              disabled={hintUsed || status !== 'IDLE'} 
              className="flex-1 flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-jsGold hover:text-jsBlue text-jsBlue dark:text-blue-400 py-3 rounded-xl font-black text-[10px] uppercase border border-slate-100 dark:border-slate-700 transition-all disabled:opacity-40"
            >
              <Lightbulb className="w-4 h-4" /> {hintUsed ? 'Clue Used' : 'Clue'}
            </button>
            <button 
              onClick={() => setRevealDefinition(!revealDefinition)} 
              className="flex-1 flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-jsBlue dark:hover:bg-blue-600 hover:text-white text-jsBlue dark:text-blue-400 py-3 rounded-xl font-black text-[10px] uppercase border border-slate-100 dark:border-slate-700 transition-all"
            >
              <HelpCircle className="w-4 h-4" /> {revealDefinition ? 'Hide Info' : 'Meaning'}
            </button>
          </div>

          {revealDefinition && hasDefinition && (
            <div className="w-full bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border-l-4 border-jsBlue animate-in fade-in slide-in-from-top-2 max-h-24 overflow-y-auto no-scrollbar">
              <p className="text-jsBlue dark:text-blue-300 italic serif text-sm leading-snug">"{currentWord.definition}"</p>
            </div>
          )}
        </div>

        {/* Input Controls */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <button 
              onClick={() => { setInputMode(inputMode === 'VOICE' ? 'KEYBOARD' : 'VOICE'); setStatus('IDLE'); }} 
              className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
            >
              {inputMode === 'VOICE' ? <><Keyboard className="w-3.5 h-3.5" /> Type Answer</> : <><Mic className="w-3.5 h-3.5" /> Voice Entry</>}
            </button>
            
            {userInput && status !== 'CORRECT' && (
              <button 
                onClick={() => { setUserInput(''); resetTranscript(); setStatus('IDLE'); }} 
                className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5 px-2 py-1 hover:bg-red-50 rounded-lg transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          <div className="relative">
            {status === 'CORRECT' && (
              <div className="absolute -top-7 left-0 w-full flex justify-center pointer-events-none">
                <span className="text-green-600 font-black italic serif text-xs animate-bounce tracking-widest">PERFECT!</span>
              </div>
            )}
            
            {status === 'JUDGING' && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 z-10 rounded-2xl">
                <div className="flex items-center gap-2 text-jsBlue dark:text-blue-400 font-black text-xs uppercase tracking-widest">
                  <Loader2 className="w-4 h-4 animate-spin" /> Judging...
                </div>
              </div>
            )}

            <input
              ref={inputRef}
              type="text"
              value={userInput}
              readOnly={inputMode === 'VOICE' || status === 'JUDGING'}
              onChange={(e) => { setStatus('IDLE'); setUserInput(e.target.value); }}
              placeholder={inputMode === 'VOICE' ? (isListening ? "Listening..." : "Tap Mic") : "Start spelling..."}
              className={`w-full text-center word-input font-black py-7 md:py-9 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-4 outline-none transition-all uppercase tracking-[0.2em] font-serif
                ${status === 'IDLE' || status === 'JUDGING' ? 'border-slate-100 dark:border-slate-800 focus:border-jsBlue text-slate-900 dark:text-white' : ''}
                ${status === 'CORRECT' ? 'border-green-400 text-green-700 bg-green-50' : ''}
                ${status === 'WRONG' ? 'border-red-500 text-red-600 bg-red-50' : ''}
              `}
              autoComplete="off" spellCheck="false"
            />
          </div>

          {inputMode === 'VOICE' && status === 'IDLE' && (
            <div className="flex flex-col items-center gap-3">
              <button 
                onClick={() => { resetTranscript(); setUserInput(''); startListening(); }}
                disabled={isListening || isSpeaking || status === 'JUDGING'}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all shadow-lg border-4 border-white dark:border-slate-800 ${isListening ? 'bg-red-600 text-white animate-pulse ring-8 ring-red-100' : 'bg-jsBlue dark:bg-blue-700 text-white hover:bg-slate-900'}`}
              >
                {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              </button>
              
              <div className="h-4 flex items-center">
                {speechError ? (
                  <p className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {speechError}
                  </p>
                ) : (
                  <p className={`text-[8px] font-black uppercase tracking-widest ${isListening ? 'text-red-600 animate-pulse' : 'text-slate-400'}`}>
                    {isListening ? 'Validation starts when you stop' : 'Tap to Voice Entry'}
                  </p>
                )}
              </div>
            </div>
          )}

          {inputMode === 'KEYBOARD' && status === 'IDLE' && (
            <button 
              onClick={checkSpelling} 
              disabled={!userInput.trim() || status === 'JUDGING'} 
              className="w-full bg-jsBlue dark:bg-blue-700 text-jsGold py-4 md:py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              Verify Submission
            </button>
          )}

          {status === 'WRONG' && (
            <div className="flex flex-col gap-2 animate-in fade-in">
              <button 
                onClick={() => { setStatus('IDLE'); setUserInput(''); }} 
                className="w-full bg-jsBlue text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest"
              >
                Try Again
              </button>
              <button 
                onClick={() => { setUserInput(currentWord.word); setStatus('IDLE'); }} 
                className="w-full bg-white border-2 border-jsBlue text-jsBlue py-3.5 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" /> Reveal Word
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
