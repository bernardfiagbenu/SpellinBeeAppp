import React, { useState, useEffect, useRef } from 'react';
import { Volume2, HelpCircle, CheckCircle, XCircle, AlertCircle, Mic, MicOff, Keyboard, Eye, Timer, ChevronLeft, ChevronRight, Award, RotateCcw, Lightbulb } from 'lucide-react';
import { SpellingWord, Difficulty } from '../types';
import { useSpeech } from '../hooks/useSpeech';
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
  const [status, setStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  const [revealDefinition, setRevealDefinition] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);
  const [inputMode, setInputMode] = useState<'VOICE' | 'KEYBOARD'>('VOICE');
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIMER_SECONDS);
  const [hintUsed, setHintUsed] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const wasListeningRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const { speak, isSpeaking, stop: stopSpeaking } = useSpeech();
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
    setHasSpoken(false);
    resetTranscript();
    setAttempts(0);
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

  const checkSpelling = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanedInput = userInput.trim().toLowerCase();
    const target = currentWord.word.toLowerCase();
    const altTarget = currentWord.altSpelling?.toLowerCase();

    if (timerRef.current) clearInterval(timerRef.current);

    if (cleanedInput === target || cleanedInput === altTarget) {
      setStatus('CORRECT');
      onWordSolved(currentWord);
      triggerConfetti();
      speak(`Correct.`, () => {
        setTimeout(nextWord, 1000);
      });
    } else {
      setStatus('WRONG');
      setAttempts(p => p + 1);
      setRevealDefinition(true);
      speak(`Incorrect spelling.`);
    }
  };

  const useHint = () => {
    if (hintUsed || status !== 'IDLE') return;
    setHintUsed(true);
    setRevealDefinition(true);
    const firstLetter = currentWord.word.charAt(0).toUpperCase();
    setUserInput(firstLetter);
    speak(`The word starts with ${firstLetter}. Definition follows.`);
  };

  useEffect(() => {
    if (wasListeningRef.current && !isListening && inputMode === 'VOICE' && userInput.trim().length > 0 && status === 'IDLE') {
      checkSpelling();
    }
    wasListeningRef.current = isListening;
  }, [isListening, inputMode, userInput, status]);

  return (
    <div className="w-full flex flex-col gap-4 max-w-lg mx-auto">
      
      <ProgressBar current={currentIndex} total={words.length} level={currentWord.difficulty} />

      <div className="flex justify-between items-center px-2">
        <button onClick={prevWord} disabled={isFirstWord} className="p-3 text-slate-300 hover:text-[#003366] dark:hover:text-[#FFD700] disabled:opacity-30 transition-colors"><ChevronLeft className="w-8 h-8" /></button>
        <div className="text-center">
          <h2 className="text-lg font-black text-[#003366] dark:text-blue-400 uppercase tracking-tighter">{currentWord.difficulty}</h2>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">{currentIndex + 1} / {words.length}</p>
        </div>
        <button onClick={nextWord} disabled={isLastWord} className="p-3 text-slate-300 hover:text-[#003366] dark:hover:text-[#FFD700] disabled:opacity-30 transition-colors"><ChevronRight className="w-8 h-8" /></button>
      </div>

      <div className={`bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-t-8 border-[#003366] dark:border-blue-600 overflow-hidden p-6 md:p-8 space-y-6 relative transition-all ${status === 'WRONG' ? 'animate-shake' : ''}`}>
        
        {isAlreadySolved && <div className="absolute top-4 right-6 text-green-500"><Award className="w-6 h-6" /></div>}
        
        <div className={`absolute top-4 left-6 px-3 py-1 rounded-full text-[10px] font-black border flex items-center gap-1 transition-all ${timeLeft < 15 ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30 animate-pulse' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700'}`}>
          <Timer className="w-3 h-3" /> {timeLeft}S
        </div>

        <div className="flex flex-col items-center gap-6 pt-4">
          <button 
            onClick={() => { speak(currentWord.word); setHasSpoken(true); }}
            className={`w-28 h-28 bg-[#003366] dark:bg-blue-700 text-[#FFD700] rounded-full flex items-center justify-center shadow-2xl border-4 border-white dark:border-slate-800 transform transition-all active:scale-90 ${isSpeaking ? 'ring-8 ring-[#FFD700]/20 dark:ring-blue-500/20' : ''}`}
          >
            <Volume2 className={`w-12 h-12 ${isSpeaking ? 'animate-pulse' : ''}`} />
          </button>
          
          <div className="flex gap-2 w-full">
            <button onClick={useHint} disabled={hintUsed || status !== 'IDLE'} className="flex-1 flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-[#FFD700] hover:text-[#003366] text-[#003366] dark:text-blue-400 py-3.5 rounded-2xl font-black text-[10px] uppercase border border-slate-100 dark:border-slate-700 transition-all disabled:opacity-40">
              <Lightbulb className="w-4 h-4" /> {hintUsed ? 'Hint Used' : 'Need a Hint?'}
            </button>
            <button onClick={() => setRevealDefinition(!revealDefinition)} className="flex-1 flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-[#003366] dark:hover:bg-blue-600 hover:text-white text-[#003366] dark:text-blue-400 py-3.5 rounded-2xl font-black text-[10px] uppercase border border-slate-100 dark:border-slate-700 transition-all">
              <HelpCircle className="w-4 h-4" /> {revealDefinition ? 'Hide Info' : 'Word Info'}
            </button>
          </div>

          {revealDefinition && hasDefinition && (
            <div className="w-full bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-3xl border-l-4 border-[#003366] dark:border-blue-600 animate-in fade-in slide-in-from-top-2">
              <p className="text-[#003366] dark:text-blue-300 italic serif text-base leading-relaxed">"{currentWord.definition}"</p>
            </div>
          )}
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex justify-between items-center px-1">
            <button 
              onClick={() => { setInputMode(inputMode === 'VOICE' ? 'KEYBOARD' : 'VOICE'); setStatus('IDLE'); }} 
              className="text-[9px] font-black text-slate-400 dark:text-slate-500 hover:text-[#003366] dark:hover:text-blue-400 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
            >
              {inputMode === 'VOICE' ? <><Keyboard className="w-3.5 h-3.5" /> Type Instead</> : <><Mic className="w-3.5 h-3.5" /> Use Voice</>}
            </button>
            {userInput && status !== 'CORRECT' && (
              <button 
                onClick={() => { setUserInput(''); resetTranscript(); setStatus('IDLE'); }} 
                className="text-[9px] font-black text-red-400 dark:text-red-500 hover:text-red-600 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          <div className="relative">
            {status === 'CORRECT' && (
              <div className="absolute -top-8 left-0 w-full flex justify-center pointer-events-none">
                <span className="text-green-600 dark:text-green-400 font-black italic serif text-sm animate-bounce">EXCELLENT!</span>
              </div>
            )}

            <input
              ref={inputRef}
              type="text"
              value={userInput}
              readOnly={inputMode === 'VOICE'}
              onChange={(e) => { setStatus('IDLE'); setUserInput(e.target.value); }}
              placeholder={inputMode === 'VOICE' ? (isListening ? "Listening..." : "Tap Mic") : "Enter Spelling..."}
              className={`w-full text-center word-input font-black py-10 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-4 outline-none transition-all uppercase tracking-[0.2em] font-serif
                ${status === 'IDLE' ? 'border-slate-100 dark:border-slate-800 focus:border-[#003366] dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white' : ''}
                ${status === 'CORRECT' ? 'border-green-400 dark:border-green-600 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/10' : ''}
                ${status === 'WRONG' ? 'border-red-500 dark:border-red-700 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10' : ''}
              `}
              autoComplete="off" spellCheck="false"
            />
          </div>

          {inputMode === 'VOICE' && status === 'IDLE' && (
            <div className="flex flex-col items-center gap-4 py-2">
              <button 
                onClick={() => { resetTranscript(); setUserInput(''); startListening(); }}
                disabled={isListening || isSpeaking}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl border-4 border-white dark:border-slate-800 ${isListening ? 'bg-red-600 text-white animate-pulse ring-8 ring-red-100 dark:ring-red-900/20' : 'bg-[#003366] dark:bg-blue-700 text-white hover:bg-slate-900 dark:hover:bg-blue-600'}`}
              >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
              <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${isListening ? 'text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {isListening ? 'Spelling Capture Active' : 'Tap to Start Voice Entry'}
              </p>
            </div>
          )}

          {inputMode === 'KEYBOARD' && status === 'IDLE' && (
            <button onClick={checkSpelling} disabled={!userInput} className="w-full bg-[#003366] dark:bg-blue-700 text-[#FFD700] py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all disabled:opacity-50">
              Judge Submission
            </button>
          )}

          {status === 'WRONG' && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-300">
              <button onClick={() => { setStatus('IDLE'); setUserInput(''); }} className="w-full bg-[#003366] dark:bg-blue-700 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Try Word Again</button>
              <button onClick={() => { setUserInput(currentWord.word); setStatus('IDLE'); }} className="w-full border-2 border-[#003366] dark:border-blue-600 text-[#003366] dark:text-blue-400 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" /> Show Correct Spelling
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};