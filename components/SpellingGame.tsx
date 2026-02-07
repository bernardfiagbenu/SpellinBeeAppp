import React, { useState, useEffect, useRef } from 'react';
import { Volume2, HelpCircle, CheckCircle, XCircle, AlertCircle, Mic, MicOff, Keyboard, Trash2, RefreshCcw, Eye, Timer, ChevronLeft, ChevronRight, Save, Award, RotateCcw, Lightbulb } from 'lucide-react';
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
    setInputMode('VOICE');
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
    if (timeLeft === 0 && status !== 'CORRECT') {
      setUserInput(currentWord.word);
      setRevealDefinition(true);
    }
  }, [timeLeft, status, currentWord.word]);

  useEffect(() => {
    if (transcript || interimTranscript) {
      const raw = transcript + interimTranscript;
      const cleaned = raw.replace(/\s+/g, '').replace(/\./g, '').replace(/,/g, '').toLowerCase();
      setUserInput(cleaned);
    }
  }, [transcript, interimTranscript]);

  const spellOutWord = (text: string) => {
    return text.split('').join('. ');
  };

  const nextWord = () => {
    if (!isLastWord) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevWord = () => {
    if (!isFirstWord) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const checkSpelling = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const cleanedInput = userInput.trim().toLowerCase();
    const target = currentWord.word.toLowerCase();
    const altTarget = currentWord.altSpelling?.toLowerCase();
    const spellingString = spellOutWord(currentWord.word);

    if (timerRef.current) clearInterval(timerRef.current);

    if (cleanedInput === target || cleanedInput === altTarget) {
      setStatus('CORRECT');
      onWordSolved(currentWord);
      triggerConfetti();
      speak(`Correct. ${currentWord.word}. ${spellingString}`, () => {
        setTimeout(() => {
          nextWord();
        }, 1200);
      });
    } else {
      setStatus('WRONG');
      setAttempts(prev => prev + 1);
      if (hasDefinition) {
         setRevealDefinition(true); 
      }
      speak(`Incorrect. The word was ${currentWord.word}. The correct spelling is. ${spellingString}`);
    }
  };

  const revealSpelling = () => {
    setUserInput(currentWord.word);
    if (inputRef.current) inputRef.current.focus();
  };

  const useHint = () => {
    if (hintUsed || status === 'CORRECT' || status === 'WRONG') return;
    
    setHintUsed(true);
    setRevealDefinition(true);
    
    const firstLetter = currentWord.word.charAt(0).toUpperCase();
    setUserInput(firstLetter);
    
    let hintText = `The word begins with the letter ${firstLetter}.`;
    if (hasDefinition) {
      hintText += ` The definition is: ${currentWord.definition}`;
    }
    
    speak(hintText);
  };

  useEffect(() => {
    if (wasListeningRef.current && !isListening) {
      const isCriticalError = speechError && (speechError.includes('permission') || speechError.includes('supported'));
      
      if (inputMode === 'VOICE' && userInput.trim().length > 0 && status === 'IDLE' && !isCriticalError) {
        checkSpelling();
      }
    }
    wasListeningRef.current = isListening;
  }, [isListening, inputMode, userInput, status, speechError]);

  const handleSpeakWord = () => {
    speak(currentWord.word);
    setHasSpoken(true);
  };

  const handleSpeakDefinition = () => {
    if (hasDefinition) {
      speak(`The definition is: ${currentWord.definition}`);
    }
  };

  const handleMicClick = () => {
    if (isSpeaking) stopSpeaking();
    resetTranscript();
    setUserInput('');
    setStatus('IDLE');
    startListening();
    setInputMode('VOICE');
  };

  const clearInput = () => {
    setUserInput('');
    resetTranscript();
    if (inputMode === 'KEYBOARD') {
      inputRef.current?.focus();
    }
  };

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case Difficulty.ONE_BEE:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case Difficulty.TWO_BEE:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case Difficulty.THREE_BEE:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const isCriticalError = speechError && (speechError.includes('permission') || speechError.includes('supported') || speechError.includes('found'));

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      
      <ProgressBar 
        current={currentIndex} 
        total={words.length} 
        level={currentWord.difficulty} 
      />

      <div className="flex justify-between items-center mb-4 px-2">
        <button 
          onClick={prevWord}
          disabled={isFirstWord}
          className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-black disabled:opacity-30 transition-colors uppercase tracking-wider"
        >
          <ChevronLeft className="w-5 h-5" /> Previous
        </button>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-widest">
           {isAlreadySolved ? (
             <span className="flex items-center gap-1 text-green-500">
               <Award className="w-3 h-3" /> Solved
             </span>
           ) : (
             <span className="flex items-center gap-1">
               <Save className="w-3 h-3" /> Active Session
             </span>
           )}
        </div>
        <button 
          onClick={nextWord}
          disabled={isLastWord}
          className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-black disabled:opacity-30 transition-colors uppercase tracking-wider"
        >
          Next <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white rounded-none shadow-2xl border border-slate-200 overflow-hidden relative transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#fdb714] via-yellow-300 to-[#fdb714]"></div>

        <div className="absolute top-4 right-4 z-10">
          <span className={`px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold border ${getDifficultyColor(currentWord.difficulty)}`}>
            {currentWord.difficulty}
          </span>
        </div>

        <div className="absolute top-4 left-4 z-10">
          <div className={`px-3 py-1 text-xs font-bold border flex items-center gap-1 transition-colors ${timeLeft < 10 && status === 'IDLE' ? 'bg-red-100 text-red-700 border-red-200 animate-pulse' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            <Timer className="w-3 h-3" />
            {timeLeft}s
          </div>
        </div>

        <div className="p-8 md:p-12 flex flex-col items-center text-center space-y-8">
          
          <div className="space-y-6 w-full">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className={`absolute -inset-1 bg-[#fdb714] rounded-full blur opacity-30 ${isSpeaking ? 'animate-pulse' : 'hidden'}`}></div>
                <button 
                  onClick={handleSpeakWord}
                  disabled={isSpeaking}
                  className={`relative w-24 h-24 bg-black hover:bg-neutral-800 text-[#fdb714] rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-lg border-4 border-white ring-4 ring-slate-100 disabled:opacity-50`}
                  aria-label="Speak word"
                >
                  <Volume2 className={`w-10 h-10 ${isSpeaking ? 'animate-bounce' : ''}`} />
                </button>
              </div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] min-h-[1.25em] pt-1">
                {hasSpoken ? "Pronounce Again" : "Listen to Word"}
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="flex justify-center flex-wrap gap-4">
                <button 
                  type="button"
                  onClick={() => setRevealDefinition(!revealDefinition)}
                  className="text-[10px] flex items-center gap-1 text-slate-500 hover:text-black font-black uppercase tracking-widest transition-colors"
                >
                  <HelpCircle className="w-3 h-3" />
                  {revealDefinition ? 'Hide Definition' : 'Show Definition'}
                </button>
                <button 
                  type="button"
                  onClick={handleSpeakDefinition}
                  disabled={isSpeaking}
                  className="text-[10px] flex items-center gap-1 text-slate-500 hover:text-black font-black uppercase tracking-widest transition-colors disabled:opacity-50"
                >
                  <Mic className="w-3 h-3" />
                  Read Definition
                </button>
                <button 
                  type="button"
                  onClick={useHint}
                  disabled={hintUsed || status !== 'IDLE'}
                  className={`text-[10px] flex items-center gap-1 font-black uppercase tracking-widest transition-all ${hintUsed || status !== 'IDLE' ? 'text-slate-300 cursor-not-allowed' : 'text-amber-600 hover:text-amber-700'}`}
                >
                  <Lightbulb className={`w-3 h-3 ${hintUsed || status !== 'IDLE' ? '' : 'animate-pulse'}`} />
                  {hintUsed ? 'Hint Used' : 'Use Hint (1/1)'}
                </button>
              </div>

              {revealDefinition && (
                <div className="bg-slate-50 p-6 border-l-4 border-black animate-in fade-in slide-in-from-top-2 text-left w-full">
                  <p className="text-slate-800 font-serif text-lg italic leading-relaxed">
                    "{currentWord.definition || 'No official definition available for this entry.'}"
                  </p>
                </div>
              )}
            </div>

            <div className="w-full max-w-md mx-auto mt-8 space-y-4">
              
              {inputMode === 'VOICE' && status === 'IDLE' && (
                <div className="flex flex-col items-center gap-4 py-4">
                   <button
                    onClick={handleMicClick}
                    disabled={isListening || isSpeaking}
                    className={`
                      w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg transform hover:scale-105 active:scale-95 border-4 border-white
                      ${isListening 
                        ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-100' 
                        : 'bg-[#005eb8] text-white hover:bg-[#004c97] ring-4 ring-blue-50'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                   >
                     {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                   </button>
                   <div className="min-h-[1.5em]">
                     {speechError ? (
                       <p className={`text-sm font-bold animate-in fade-in flex items-center gap-1 ${isCriticalError ? 'text-red-500' : 'text-orange-500'}`}>
                         <AlertCircle className="w-4 h-4 inline" /> {speechError}
                       </p>
                     ) : (
                       <p className={`text-sm font-bold uppercase tracking-widest transition-colors ${isListening ? 'text-red-500' : 'text-slate-400'}`}>
                         {isListening ? 'Listening...' : 'Tap Mic to Start Spelling'}
                       </p>
                     )}
                   </div>
                </div>
              )}

              {/* Action Bar Above Input */}
              <div className="flex justify-between items-center px-1 mb-2">
                 <button 
                  type="button"
                  onClick={() => {
                    setInputMode(prev => prev === 'VOICE' ? 'KEYBOARD' : 'VOICE');
                    if (inputMode === 'VOICE') {
                       setTimeout(() => inputRef.current?.focus(), 100);
                    }
                  }}
                  className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 hover:text-black flex items-center gap-1 transition-colors"
                >
                  {inputMode === 'VOICE' ? <><Keyboard className="w-3 h-3" /> Keyboard Mode</> : <><Mic className="w-3 h-3" /> Voice Mode</>}
                </button>

                {userInput && status !== 'CORRECT' && (
                  <button
                    type="button"
                    onClick={clearInput}
                    className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear Field
                  </button>
                )}
              </div>

              <form onSubmit={checkSpelling} className="relative">
                <div className="relative">
                  {/* Status Overlay - Positioned above input specifically to not block letters */}
                  <div className="absolute -top-12 left-0 w-full flex justify-center pointer-events-none">
                     {status === 'CORRECT' && (
                       <div className="flex items-center gap-2 text-green-600 animate-in zoom-in slide-in-from-bottom-2">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-serif italic font-black text-lg">Correct!</span>
                       </div>
                     )}
                     {status === 'WRONG' && (
                       <div className="flex items-center gap-2 text-red-600 animate-in zoom-in slide-in-from-bottom-2">
                          <XCircle className="w-5 h-5" />
                          <span className="font-serif italic font-black text-lg">Incorrect</span>
                       </div>
                     )}
                  </div>

                  <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    readOnly={inputMode === 'VOICE'}
                    onChange={(e) => {
                      setUserInput(e.target.value);
                      if (status === 'WRONG') setStatus('IDLE');
                    }}
                    placeholder={inputMode === 'VOICE' ? (isListening ? "Listening..." : "") : "Start typing..."}
                    className={`
                      w-full text-center text-3xl md:text-4xl font-bold py-10 px-4 bg-slate-50 border-b-4 outline-none transition-all font-serif tracking-[0.2em] uppercase
                      placeholder:text-slate-300 placeholder:font-sans placeholder:normal-case placeholder:tracking-[0.1em] placeholder:text-lg
                      ${status === 'IDLE' 
                        ? (isListening ? 'border-[#005eb8] bg-blue-50/50' : 'border-slate-200 focus:border-black focus:bg-white') 
                        : ''}
                      ${status === 'CORRECT' ? 'border-green-500 bg-green-50 text-green-700' : ''}
                      ${status === 'WRONG' ? 'border-red-500 bg-red-50 text-red-700 animate-shake' : ''}
                    `}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                </div>
                
                <div className="mt-8 flex flex-col gap-3 justify-center items-center min-h-[84px]">
                  {status === 'IDLE' && inputMode === 'KEYBOARD' && (
                    <button 
                      type="submit" 
                      disabled={!userInput || isListening}
                      className="bg-[#fdb714] text-black font-black uppercase tracking-widest py-4 px-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full md:w-auto text-sm"
                    >
                      Judge Spelling
                    </button>
                  )}

                  {status === 'IDLE' && inputMode === 'VOICE' && userInput.length > 0 && !isListening && (
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Evaluating Entry...</p>
                  )}

                  {status === 'WRONG' && (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in w-full">
                        <div className="flex gap-3 flex-wrap justify-center">
                          <button 
                            type="button"
                            onClick={() => {
                              setStatus('IDLE');
                              setUserInput('');
                              resetTranscript();
                            }}
                            className="bg-black text-white font-bold py-3 px-8 shadow-lg hover:bg-neutral-800 transition-all flex items-center gap-2 text-xs uppercase tracking-widest"
                          >
                            <RefreshCcw className="w-4 h-4" /> Try Again
                          </button>
                          
                          {attempts >= 1 && (
                            <button 
                              type="button"
                              onClick={revealSpelling}
                              className="bg-purple-600 text-white font-bold py-3 px-6 shadow-lg hover:bg-purple-700 transition-all flex items-center gap-2 text-xs uppercase tracking-widest"
                            >
                              <Eye className="w-4 h-4" /> Reveal Word
                            </button>
                          )}
                        </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-5px); }
          30% { transform: translateX(5px); }
          50% { transform: translateX(-5px); }
          70% { transform: translateX(5px); }
          90% { transform: translateX(-5px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};
