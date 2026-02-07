import React from 'react';
import { BookOpen, Trophy, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  currentView?: 'GAME' | 'LIST';
  onViewChange?: (view: 'GAME' | 'LIST') => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange, darkMode, onToggleDarkMode }) => {
  const logoUrl = "https://juniorspellergh.com/wp-content/uploads/2024/01/3d-junior-speller-logo-2048x1172.png";

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b-4 border-[#FFD700] py-2 px-4 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center cursor-pointer transition-transform hover:scale-105 active:scale-95" 
          onClick={() => onViewChange && onViewChange('GAME')}
        >
          <img 
            src={logoUrl} 
            alt="Junior Speller GH" 
            className="h-10 md:h-14 w-auto object-contain"
          />
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {/* Day/Night Toggle - Improved visibility */}
          <button
            onClick={onToggleDarkMode}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-yellow-400 transition-all hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center"
            aria-label="Toggle Night Mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 fill-yellow-400 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 fill-slate-700 text-slate-800" />
            )}
          </button>

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
                  <Trophy className="w-4 h-4" />
                  <span className="uppercase tracking-widest">Stage</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};