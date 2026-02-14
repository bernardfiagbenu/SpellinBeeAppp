
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  level: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, level }) => {
  const percentage = total > 0 ? Math.min(100, Math.max(0, ((current) / total) * 100)) : 0;

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-end mb-2 px-1">
        <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{level} LEVEL</span>
        <span className="text-[10px] font-black text-black dark:text-jsGold uppercase tracking-[0.2em]">{current + 1} OF {total}</span>
      </div>
      <div className="h-2.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-100 dark:border-zinc-900">
        <div 
          className="h-full bg-jsGold transition-all duration-700 ease-out relative"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white opacity-20" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
        </div>
      </div>
    </div>
  );
};
