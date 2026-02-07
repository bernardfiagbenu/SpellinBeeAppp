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

  const spellOutWord = (text: string) => text.split('').join('. ');

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
      speak(`Correct. ${currentWord.word}.`, () => {
        setTimeout(nextWord, 1500);
      });
    } else {
      setStatus('WRONG');
      setAttempts(p => p + 1);
      setRevealDefinition(true);
      speak(`Incorrect. The word was ${currentWord.word}.`);
    }
  };

  const useHint = () => {
    if (hintUsed || status !== 'IDLE') return;
    setHintUsed(true);
    setRevealDefinition(true);
    const firstLetter = currentWord.word.charAt(0).toUpperCase();
    setUserInput(firstLetter);
    speak(`The word starts with ${firstLetter}. Definition: ${currentWord.definition}`);
  };

  useEffect(() => {
    if (wasListeningRef.current && !isListening && inputMode === 'VOICE' && userInput.trim().length > 0 && status === 'IDLE') {
      checkSpelling();
    }
    wasListeningRef.current = isListening;
  }, [isListening, inputMode, userInput, status]);

  return (
    <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
      
      <ProgressBar current={currentIndex} total={words.length} level={currentWord.difficulty} />

      {/* Control Bar */}
      <div className="flex justify-between items-center px-1">
        <button onClick={prevWord} disabled={isFirstWord} className="p-2 text-slate-400 hover:text-[#003366] disabled:opacity-20"><ChevronLeft className="w-8 h-8" /></button>
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-black font-serif italic text-[#003366]">{currentWord.difficulty} Stage</h2>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentIndex + 1} OF {words.length}</span>
        </div>
        <button onClick={nextWord} disabled={isLastWord} className="p-2 text-slate-400 hover:text-[#003366] disabled:opacity-20"><ChevronRight className="w-8 h-8" /></button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border-t-8 border-[#003366] overflow-hidden p-6 md:p-10 space-y-8 relative">
        {isAlreadySolved && <div className="absolute top-4 right-4 text-green-500 animate-bounce"><Award className="w-6 h-6" /></div>}
        
        {/* Timer UI */}
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 transition-all ${timeLeft < 15 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
          <Timer className="w-3 h-3" /> {timeLeft}s
        </div>

        {/* Action Section */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative group">
            <div className={`absolute -inset-4 bg-[#FFD700] rounded-full blur-xl opacity-20 ${isSpeaking ? 'animate-pulse' : 'hidden'}`}></div>
            <button 
              onClick={() => { speak(currentWord.word); setHasSpoken(true); }}
              className="relative w-28 h-28 bg-[#003366] text-[#FFD700] rounded-full flex items-center justify-center shadow-2xl border-4 border-white transform transition-transform active:scale-90"
            >
              <Volume2 className={`w-12 h-12 ${isSpeaking ? 'animate-bounce' : ''}`} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            <button onClick={useHint} disabled={hintUsed || status !== 'IDLE'} className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-[#FFD700] text-[#003366] py-3 rounded-xl font-bold text-xs uppercase border border-slate-100 disabled:opacity-40 transition-all">
              <Lightbulb className="w-4 h-4" /> Hint {hintUsed ? '(Used)' : ''}
            </button>
            <button onClick={() => setRevealDefinition(!revealDefinition)} className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-[#003366] hover:text-white text-[#003366] py-3 rounded-xl font-bold text-xs uppercase border border-slate-100 transition-all">
              <HelpCircle className="w-4 h-4" /> Info
            </button>
          </div>

          {revealDefinition && hasDefinition && (
            <div className="w-full bg-blue-50/50 p-4 rounded-2xl border-l-4 border-[#003366] animate-in slide-in-from-top-2">
              <p className="text-[#003366] italic serif text-base md:text-lg leading-relaxed">"{currentWord.definition}"</p>
            </div>
          )}
        </div>

        {/* Input Section - Optimized for Mobile Typing */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <button onClick={() => setInputMode(inputMode === 'VOICE' ? 'KEYBOARD' : 'VOICE')} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              {inputMode === 'VOICE' ? <><Keyboard className="w-3 h-3" /> Switch to Typing</> : <><Mic className="w-3 h-3" /> Switch to Voice</>}
            </button>
            {userInput && <button onClick={() => { setUserInput(''); resetTranscript(); }} className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Reset</button>}
          </div>

          <div className="relative">
            {/* Judge Feedback Overlay */}
            <div className="absolute -top-10 left-0 w-full flex justify-center pointer-events-none">
              {status === 'CORRECT' && <span className="text-green-600 font-black italic serif text-xl animate-bounce">ELIMINATED (Correct!)</span>}
              {status === 'WRONG' && <span className="text-red-600 font-black italic serif text-xl animate-shake">INCORRECT</span>}
            </div>

            <input
              ref={inputRef}
              type="text"
              value={userInput}
              readOnly={inputMode === 'VOICE'}
              onChange={(e) => setStatus('IDLE') || setUserInput(e.target.value)}
              placeholder={inputMode === 'VOICE' ? (isListening ? "Listening..." : "Tap Mic Below") : "Tap to type..."}
              className={`w-full text-center word-input font-black py-8 bg-slate-50 rounded-2xl border-4 outline-none transition-all uppercase tracking-[0.2em] font-serif
                ${status === 'IDLE' ? 'border-slate-100 focus:border-[#003366] focus:bg-white' : ''}
                ${status === 'CORRECT' ? 'border-green-400 text-green-700 bg-green-50' : ''}
                ${status === 'WRONG' ? 'border-red-400 text-red-700 bg-red-50' : ''}
              `}
              autoComplete="off" spellCheck="false"
            />
          </div>

          {inputMode === 'VOICE' && status === 'IDLE' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <button 
                onClick={() => { resetTranscript(); setUserInput(''); startListening(); }}
                disabled={isListening || isSpeaking}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl border-4 border-white ${isListening ? 'bg-red-600 text-white animate-pulse ring-8 ring-red-100' : 'bg-[#003366] text-white'}`}
              >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${isListening ? 'text-red-600' : 'text-slate-400'}`}>
                {isListening ? 'Voice Capture Active...' : 'Tap Mic to Start Spelling'}
              </p>
              {speechError && <p className="text-xs text-red-500 font-medium">{speechError}</p>}
            </div>
          )}

          {inputMode === 'KEYBOARD' && status === 'IDLE' && (
            <button onClick={checkSpelling} disabled={!userInput} className="w-full bg-[#003366] text-[#FFD700] py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all">
              Evaluate Spelling
            </button>
          )}

          {status === 'WRONG' && (
            <div className="flex flex-col gap-3">
              <button onClick={() => { setStatus('IDLE'); setUserInput(''); }} className="w-full bg-black text-white py-4 rounded-xl font-bold text-xs uppercase">Try Again</button>
              <button onClick={() => setUserInput(currentWord.word)} className="w-full border-2 border-[#003366] text-[#003366] py-4 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" /> Reveal Correction
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};