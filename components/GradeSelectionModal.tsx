import React from 'react';
import { Difficulty } from '../types';
import { GraduationCap, School } from 'lucide-react';

interface GradeSelectionModalProps {
  onSelect: (difficulty: Difficulty) => void;
}

export const GradeSelectionModal: React.FC<GradeSelectionModalProps> = ({ onSelect }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 border-4 border-black dark:border-jsGold relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-black via-zinc-500 to-jsGold dark:from-jsGold dark:via-zinc-500 dark:to-black"></div>

        <div className="flex flex-col items-center text-center gap-6">
          <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-2 border-2 border-zinc-200 dark:border-zinc-700">
            <School className="w-10 h-10 text-black dark:text-jsGold" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">
              Welcome, Speller!
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              Please select your grade level to begin.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 w-full">
            <button
              onClick={() => onSelect(Difficulty.GRADE_2_4)}
              className="group relative flex items-center justify-between p-6 bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl hover:border-black dark:hover:border-jsGold hover:shadow-xl transition-all active:scale-95"
            >
              <div className="flex flex-col items-start">
                <span className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1 group-hover:text-black dark:group-hover:text-jsGold transition-colors">Junior Level</span>
                <span className="text-xl font-black text-black dark:text-white">Grade 2-4</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-black dark:group-hover:bg-jsGold transition-colors">
                <GraduationCap className="w-5 h-5 text-zinc-400 group-hover:text-jsGold dark:group-hover:text-black transition-colors" />
              </div>
            </button>

            <button
              onClick={() => onSelect(Difficulty.GRADE_5_9)}
              className="group relative flex items-center justify-between p-6 bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl hover:border-black dark:hover:border-jsGold hover:shadow-xl transition-all active:scale-95"
            >
              <div className="flex flex-col items-start">
                <span className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1 group-hover:text-black dark:group-hover:text-jsGold transition-colors">Senior Level</span>
                <span className="text-xl font-black text-black dark:text-white">Grade 5-9</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-black dark:group-hover:bg-jsGold transition-colors">
                <GraduationCap className="w-5 h-5 text-zinc-400 group-hover:text-jsGold dark:group-hover:text-black transition-colors" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
