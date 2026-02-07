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
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{level} Level</span>
        <span className="text-sm font-mono text-slate-600">{current + 1} / {total}</span>
      </div>
      <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300">
        <div 
          className="h-full bg-yellow-400 transition-all duration-500 ease-out relative"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white opacity-20" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
        </div>
      </div>
    </div>
  );
};