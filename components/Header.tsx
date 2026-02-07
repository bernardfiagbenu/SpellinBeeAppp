import React from 'react';
import { BookOpen, Trophy } from 'lucide-react';

interface HeaderProps {
  currentView?: 'GAME' | 'LIST';
  onViewChange?: (view: 'GAME' | 'LIST') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  return (
    <header className="w-full bg-white border-b-4 border-[#FFD700] py-2 px-4 shadow-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center cursor-pointer transition-transform hover:scale-105 active:scale-95" 
          onClick={() => onViewChange && onViewChange('GAME')}
        >
          <img 
            src="./logo.png" 
            alt="Junior Speller GH" 
            className="h-10 md:h-14 w-auto object-contain"
            onError={(e) => {
              // Fallback to official web URL if logo.png is missing or broken
              (e.target as HTMLImageElement).src = "https://juniorspellergh.com/wp-content/uploads/2021/04/Junior-Speller-Logo-e1619616056586.png";
            }}
          />
        </div>
        
        {onViewChange && (
          <div className="flex items-center gap-2">
            {currentView === 'GAME' ? (
              <button
                onClick={() => onViewChange('LIST')}
                className="bg-[#003366] text-white px-3 py-2 md:px-5 rounded-xl font-bold text-[10px] md:text-xs flex items-center gap-2 hover:bg-[#002244] transition-all shadow-sm border-2 border-transparent active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-[#FFD700]" />
                <span className="uppercase tracking-widest hidden sm:inline">Dictionary</span>
                <span className="uppercase tracking-widest sm:hidden">Words</span>
              </button>
            ) : (
              <button
                onClick={() => onViewChange('GAME')}
                className="bg-[#FFD700] text-[#003366] px-3 py-2 md:px-5 rounded-xl font-bold text-[10px] md:text-xs flex items-center gap-2 hover:bg-yellow-400 transition-all shadow-sm border-2 border-[#003366] active:scale-95"
              >
                < Trophy className="w-4 h-4" />
                <span className="uppercase tracking-widest">Stage</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};