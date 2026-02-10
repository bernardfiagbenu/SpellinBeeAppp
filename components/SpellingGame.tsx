import React, { useState, useEffect, useRef } from 'react';
import { Volume2, HelpCircle, CheckCircle, XCircle, AlertCircle, Mic, MicOff, Keyboard, Eye, Timer, ChevronLeft, ChevronRight, Award, RotateCcw, Lightbulb, Loader2, AlertTriangle } from 'lucide-react';
import { SpellingWord, Difficulty } from '../types';
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
  
  const { speak, isSpeaking, isGenerating, stop: stopSpeaking } = useElevenLabsSpeech();
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
    if (!userInput.trim()) return;

    const cleanedInput = userInput.trim().toLowerCase();
    const target = currentWord.word.toLowerCase();
    const altTarget = currentWord.altSpelling?.toLowerCase();

    if (timerRef.current) clearInterval(timerRef.current);

    if (cleanedInput === target || cleanedInput === altTarget) {
      setStatus('CORRECT');
      onWordSolved(currentWord);
      triggerConfetti();
      speak(`Correct. Well done.`, () => {
        setTimeout(nextWord, 1200);
      });
    } else {
      setStatus('WRONG');
      setAttempts(p => p + 1);
      setRevealDefinition(true);
      speak(`That is incorrect.`);
    }
  };

  const useHint = () => {
    if (hintUsed || status !== 'IDLE' || isGenerating) return;
    setHintUsed(true);
    setRevealDefinition(true);
    const firstLetter = currentWord.word.charAt(0).toUpperCase();
    setUserInput(firstLetter);
    speak(`The word starts with the letter ${firstLetter}.`);
  };

  useEffect(() => {
    if (wasListeningRef.current && !isListening && inputMode === 'VOICE' && userInput.trim().length > 0 && status === 'IDLE') {
      checkSpelling();
    }
    wasListeningRef.current = isListening;
  }, [isListening, inputMode, userInput, status]);

  // Handle microphone usage: stop listening if judge starts speaking
  useEffect(() => {
    if (isSpeaking && isListening) {
      // Browser recognition usually stops itself when audio output starts on some devices, 
      // but we should manage it explicitly if possible.
    }
  }, [isSpeaking, isListening]);

  return (
    <div className="w-full flex flex-col gap-3 max-w-lg mx-auto">
      
      <ProgressBar current={currentIndex} total={words.length} level={currentWord.difficulty} />

      {/* Navigation & Header */}
      <div className="flex justify-between items-center px-4">
        <button 
          onClick={prevWord} 
          disabled={isFirstWord} 
          className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-300 hover:text-jsBlue dark:hover:text-jsGold disabled:opacity-30 transition-all border border-slate-100 dark:border-slate-700"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="text-base font-black text-jsBlue dark:text-blue-400 uppercase tracking-tighter">{currentWord.difficulty}</h2>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">{currentIndex + 1} / {words.length}</p>
        </div>
        <button 
          onClick={nextWord} 
          disabled={isLastWord} 
          className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-300 hover:text-jsBlue dark:hover:text-jsGold disabled:opacity-30 transition-all border border-slate-100 dark:border-slate-700"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className={`bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border-t-8 border-jsBlue dark:border-blue-600 overflow-hidden p-5 md:p-8 space-y-5 relative transition-all ${status === 'WRONG' ? 'animate-shake' : ''}`}>
        
        {isAlreadySolved && <div className="absolute top-4 right-6 text-green-500"><Award className="w-6 h-6" /></div>}
        
        <div className={`absolute top-4 left-6 px-3 py-1 rounded-full text-[10px] font-black border flex items-center gap-1 transition-all ${timeLeft < 15 ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30 animate-pulse' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700'}`}>
          <Timer className="w-3 h-3" /> {timeLeft}S
        </div>

        {/* Word Speaker & Info Toggle */}
        <div className="flex flex-col items-center gap-4 pt-4">
          <button 
            onClick={() => { speak(currentWord.word); setHasSpoken(true); }}
            disabled={isGenerating}
            className={`w-24 h-24 md:w-32 md:h-32 bg-jsBlue dark:bg-blue-700 text-jsGold rounded-full flex items-center justify-center shadow-2xl border-4 border-white dark:border-slate-800 transform transition-all active:scale-90 disabled:opacity-80 ${isSpeaking ? 'ring-8 ring-jsGold/20 dark:ring-blue-500/20' : ''}`}
            aria-label="Hear the word"
          >
            {isGenerating ? (
              <Loader2 className="w-10 h-10 md:w-14 md:h-14 animate-spin" />
            ) : (
              <Volume2 className={`w-10 h-10 md:w-14 md:h-14 ${isSpeaking ? 'animate-pulse' : ''}`} />
            )}
          </button>
          
          <div className="flex gap-2 w-full">
            <button 
              onClick={useHint} 
              disabled={hintUsed || status !== 'IDLE' || isGenerating} 
              className="flex-1 flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-jsGold hover:text-jsBlue text-jsBlue dark:text-blue-400 py-3.5 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase border border-slate-100 dark:border-slate-700 transition-all disabled:opacity-40"
            >
              <Lightbulb className="w-4 h-4" /> {hintUsed ? 'Hint Applied' : 'Clue'}
            </button>
            <button 
              onClick={() => setRevealDefinition(!revealDefinition)} 
              className="flex-1 flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-jsBlue dark:hover:bg-blue-600 hover:text-white text-jsBlue dark:text-blue-400 py-3.5 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase border border-slate-100 dark:border-slate-700 transition-all"
            >
              <HelpCircle className="w-4 h-4" /> {revealDefinition ? 'Hide Info' : 'Definition'}
            </button>
          </div>

          {revealDefinition && hasDefinition && (
            <div className="w-full bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border-l-4 border-jsBlue dark:border-blue-600 animate-in fade-in slide-in-from-top-2 overflow-y-auto max-h-24 no-scrollbar">
              <p className="text-jsBlue dark:text-blue-300 italic serif text-sm md:text-base leading-relaxed">"{currentWord.definition}"</p>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="space-y-4 pt-2">
          {/* Controls Row */}
          <div className="flex justify-between items-end px-1 h-8">
            <button 
              onClick={() => { setInputMode(inputMode === 'VOICE' ? 'KEYBOARD' : 'VOICE'); setStatus('IDLE'); }} 
              className="text-[8px] md:text-[9px] font-black text-slate-500 dark:text-slate-400 hover:text-jsBlue dark:hover:text-blue-400 uppercase tracking-widest flex items-center gap-1.5 transition-colors py-1.5"
            >
              {inputMode === 'VOICE' ? <><Keyboard className="w-3.5 h-3.5" /> Keyboard</> : <><Mic className="w-3.5 h-3.5" /> Voice Mode</>}
            </button>
            
            {userInput && status !== 'CORRECT' && (
              <button 
                onClick={() => { setUserInput(''); resetTranscript(); setStatus('IDLE'); }} 
                className="text-[8px] md:text-[9px] font-black text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 px-3 py-1.5 rounded-lg uppercase tracking-widest flex items-center gap-1.5 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          <div className="relative">
            {status === 'CORRECT' && (
              <div className="absolute -top-7 left-0 w-full flex justify-center pointer-events-none">
                <span className="text-green-600 dark:text-green-400 font-black italic serif text-xs md:text-sm animate-bounce tracking-widest">PERFECT!</span>
              </div>
            )}

            <input
              ref={inputRef}
              type="text"
              value={userInput}
              readOnly={inputMode === 'VOICE'}
              onChange={(e) => { setStatus('IDLE'); setUserInput(e.target.value); }}
              placeholder={inputMode === 'VOICE' ? (isListening ? "I'm listening..." : "Tap the Mic") : "Spell here..."}
              className={`w-full text-center word-input font-black py-7 md:py-10 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] md:rounded-[2rem] border-4 outline-none transition-all uppercase tracking-[0.2em] font-serif
                ${status === 'IDLE' ? 'border-slate-100 dark:border-slate-800 focus:border-jsBlue dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white' : ''}
                ${status === 'CORRECT' ? 'border-green-400 dark:border-green-600 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/10' : ''}
                ${status === 'WRONG' ? 'border-red-500 dark:border-red-700 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10' : ''}
              `}
              autoComplete="off" spellCheck="false"
            />
          </div>

          {inputMode === 'VOICE' && status === 'IDLE' && (
            <div className="flex flex-col items-center gap-3 py-2">
              <button 
                onClick={() => { resetTranscript(); setUserInput(''); startListening(); }}
                disabled={isListening || isSpeaking || isGenerating}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all shadow-xl border-4 border-white dark:border-slate-800 ${isListening ? 'bg-red-600 text-white animate-pulse ring-[12px] ring-red-100 dark:ring-red-900/20' : 'bg-jsBlue dark:bg-blue-700 text-white hover:bg-slate-900 dark:hover:bg-blue-600'}`}
                aria-label={isListening ? "Stop listening" : "Start listening"}
              >
                {isListening ? <MicOff className="w-7 h-7 md:w-8 md:h-8" /> : <Mic className="w-7 h-7 md:w-8 md:h-8" />}
              </button>
              
              <div className="h-6 flex items-center justify-center">
                {speechError ? (
                  <div className="flex items-center gap-1.5 text-red-500 dark:text-red-400 animate-in fade-in duration-300">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <p className="text-[9px] font-black uppercase tracking-widest">{speechError}</p>
                  </div>
                ) : (
                  <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] ${isListening ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-slate-400 dark:text-slate-500'}`}>
                    {isListening ? 'Capture Active' : 'Voice Entry Disabled'}
                  </p>
                )}
              </div>
            </div>
          )}

          {inputMode === 'KEYBOARD' && status === 'IDLE' && (
            <button 
              onClick={checkSpelling} 
              disabled={!userInput.trim() || isGenerating} 
              className="w-full bg-jsBlue dark:bg-blue-700 text-jsGold py-5 md:py-6 rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              Verify Spelling
            </button>
          )}

          {status === 'WRONG' && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-300">
              <button 
                onClick={() => { setStatus('IDLE'); setUserInput(''); }} 
                className="w-full bg-jsBlue dark:bg-blue-700 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
              >
                Try Current Word Again
              </button>
              <button 
                onClick={() => { setUserInput(currentWord.word); setStatus('IDLE'); }} 
                className="w-full bg-white dark:bg-slate-800 border-2 border-jsBlue dark:border-blue-600 text-jsBlue dark:text-blue-400 py-4 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Eye className="w-4 h-4" /> Reveal Answer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};