
import React from 'react';
import { BookOpen, Trophy, Sun, Moon, User, Loader2 } from 'lucide-react';
import { UserIdentity, getAvatarStyle, getCountryFlag } from '../hooks/useUserIdentity';

interface HeaderProps {
  currentView?: 'GAME' | 'LIST';
  onViewChange?: (view: 'GAME' | 'LIST') => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onShowLeaderboard: () => void;
  identity: UserIdentity | null;
  userRank: number | string;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentView, 
  onViewChange, 
  darkMode, 
  onToggleDarkMode, 
  onShowLeaderboard,
  identity,
  userRank
}) => {
  const logoUrl = "https://juniorspellergh.com/wp-content/uploads/2024/01/3d-junior-speller-logo-2048x1172.png";

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b-4 border-jsGold py-2 px-2 sm:px-4 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Logo Section */}
        <div 
          className="flex items-center cursor-pointer transition-transform hover:scale-105 active:scale-95 shrink-0" 
          onClick={() => onViewChange && onViewChange('GAME')}
        >
          <img 
            src={logoUrl} 
            alt="Junior Speller GH" 
            className="h-8 sm:h-10 md:h-12 w-auto object-contain"
          />
        </div>

        {/* User Profile Chip - Enhanced to ensure visibility */}
        <div className="flex-1 flex justify-center min-w-0">
          {identity ? (
            <div 
              onClick={onShowLeaderboard}
              className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full px-2 py-1 sm:px-4 sm:py-2 cursor-pointer hover:bg-white dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm min-w-0 max-w-[120px] sm:max-w-[200px]"
            >
              <div className={`w-6 h-6 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white shrink-0 mr-1 sm:mr-3 ${getAvatarStyle(identity.avatarSeed)}`}>
                <User className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                <span className="text-[9px] sm:text-[11px] font-black text-jsBlue dark:text-blue-300 truncate tracking-tight uppercase">
                  {identity.username}
                </span>
                <div className="flex items-center gap-1">
                  <img 
                    src={getCountryFlag(identity.countryCode)} 
                    alt={identity.country} 
                    className="w-3 h-2 sm:w-4 sm:h-2.5 object-cover rounded-[1px] shadow-sm" 
                  />
                  <span className="text-[7px] sm:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">
                    #{userRank || '--'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 animate-pulse bg-slate-50 dark:bg-slate-800 rounded-full px-4 py-2 opacity-50">
              <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
              <div className="h-2 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-yellow-400 transition-all hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center active:scale-95"
            aria-label="Toggle Night Mode"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-500" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-700 text-slate-800" />
            )}
          </button>

          {onViewChange && (
            <div className="flex items-center gap-1 sm:gap-2">
              {currentView === 'GAME' ? (
                <button
                  onClick={() => onViewChange('LIST')}
                  className="bg-jsBlue text-white px-2 py-2 sm:px-4 rounded-xl font-bold text-[8px] sm:text-xs flex items-center gap-1 sm:gap-2 hover:bg-[#002244] transition-all shadow-sm active:scale-95"
                >
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-jsGold" />
                  <span className="uppercase tracking-widest hidden sm:inline">Archives</span>
                  <span className="uppercase tracking-widest sm:hidden">ABC</span>
                </button>
              ) : (
                <button
                  onClick={() => onViewChange('GAME')}
                  className="bg-jsGold text-jsBlue px-2 py-2 sm:px-4 rounded-xl font-bold text-[8px] sm:text-xs flex items-center gap-1 sm:gap-2 hover:bg-yellow-400 transition-all shadow-sm border-2 border-jsBlue active:scale-95"
                >
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
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
