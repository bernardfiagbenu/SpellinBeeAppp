
import React, { useState } from 'react';
import { ChevronRight, X, Star, Flame, Volume2, Mic, Trophy } from 'lucide-react';

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    title: "The Judge",
    description: "Tap the Judge button to hear your word clearly.",
    icon: <Volume2 className="w-7 h-7 text-jsGold" />,
  },
  {
    title: "Double Input",
    description: "Choose Voice Mode to speak or Keyboard to type.",
    icon: <Mic className="w-7 h-7 text-jsGold" />,
  },
  {
    title: "Study List",
    description: "Star difficult words to practice them in a custom set.",
    icon: <Star className="w-7 h-7 text-jsGold" />,
  },
  {
    title: "Pro Streaks",
    description: "Build your flame streak to beat your personal best score!",
    icon: <Flame className="w-7 h-7 text-orange-500" />,
  },
  {
    title: "Global Ranking",
    description: "Climb the leaderboard by spelling accurately and quickly. Be the champion!",
    icon: <Trophy className="w-7 h-7 text-jsGold" />,
  }
];

interface TutorialOverlayProps {
  onComplete: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < steps.length - 1) setCurrentStep(s => s + 1);
    else onComplete();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-5 sm:p-6 bg-black/95 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-zinc-100 dark:border-zinc-800 transition-colors">
        
        <div className="p-7 pb-2 flex justify-between items-center">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-10 bg-black dark:bg-jsGold' : 'w-2 bg-zinc-100 dark:bg-zinc-800'}`} />
            ))}
          </div>
          <button onClick={onComplete} className="p-2 text-zinc-300 hover:text-zinc-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 pt-6 flex flex-col items-center text-center space-y-6">
          <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] flex items-center justify-center shadow-inner border border-zinc-100 dark:border-zinc-800">
            {steps[currentStep].icon}
          </div>
          
          <div className="space-y-3">
            <h3 className="text-2xl font-black text-black dark:text-jsGold uppercase tracking-tight">
              {steps[currentStep].title}
            </h3>
            <p className="text-[13px] sm:text-sm text-zinc-500 dark:text-zinc-400 font-bold leading-relaxed px-2">
              {steps[currentStep].description}
            </p>
          </div>

          <div className="w-full space-y-3 pt-4">
            <button
              onClick={next}
              className="w-full bg-black dark:bg-jsGold text-jsGold dark:text-black font-black py-5 rounded-3xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl uppercase tracking-widest text-[11px]"
            >
              {currentStep === steps.length - 1 ? "Start Session" : "Continue"}
              <ChevronRight className="w-4 h-4" />
            </button>
            
            <button 
              onClick={onComplete}
              className="w-full py-2 text-[10px] font-black text-zinc-400 hover:text-black dark:hover:text-jsGold uppercase tracking-[0.25em] transition-colors"
            >
              Skip Tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
