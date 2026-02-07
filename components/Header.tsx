import React from 'react';
import { Hexagon, BookOpen, Trophy } from 'lucide-react';

interface HeaderProps {
  currentView?: 'GAME' | 'LIST';
  onViewChange?: (view: 'GAME' | 'LIST') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  return (
    <header className="w-full bg-[#003366] border-b-[8px] border-[#FFD700] py-4 px-6 shadow-xl sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => onViewChange && onViewChange('GAME')}
        >
          <div className="relative transform group-hover:rotate-12 transition-transform duration-300">
             <Hexagon className="w-10 h-10 text-[#FFD700] fill-[#FFD700]" />
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[#003366] font-black text-xl italic">J</span>
             </div>
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-extrabold text-[#FFD700] tracking-tighter leading-none font-serif italic">
              Junior Speller <br className="md:hidden" /> <span className="text-white">GH</span>
            </h1>
          </div>
        </div>
        
        {onViewChange && (
          <div className="flex items-center">
            {currentView === 'GAME' ? (
              <button
                onClick={() => onViewChange('LIST')}
                className="bg-white text-[#003366] px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 hover:bg-[#FFD700] transition-all shadow-lg border-2 border-transparent hover:border-[#003366]"
              >
                <BookOpen className="w-4 h-4" />
                <span className="uppercase tracking-widest">Words</span>
              </button>
            ) : (
              <button
                onClick={() => onViewChange('GAME')}
                className="bg-[#FFD700] text-[#003366] px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 hover:bg-white transition-all shadow-lg border-2 border-[#003366]"
              >
                <Trophy className="w-4 h-4" />
                <span className="uppercase tracking-widest">Stage</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};