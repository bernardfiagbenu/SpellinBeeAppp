
import React from 'react';
import { BookOpen, Trophy, Sun, Moon, User, MapPin } from 'lucide-react';
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
    <header className="w-full bg-white dark:bg-slate-900 border-b-4 border-[#FFD700] py-2 px-3 sm:px-4 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        
        {/* Logo Section */}
        <div 
          className="flex items-center cursor-pointer transition-transform hover:scale-105 active:scale-95 shrink-0" 
          onClick={() => onViewChange && onViewChange('GAME')}
        >
          <img 
            src={logoUrl} 
            alt="Junior Speller GH" 
            className="h-8 md:h-12 w-auto object-contain"
          />
        </div>

        {/* User Profile Chip - Desktop & Mobile Friendly */}
        {identity && (
          <div 
            onClick={onShowLeaderboard}
            className="flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-full px-2 py-1 sm:px-3 sm:py-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 group shadow-sm overflow-hidden"
          >
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white shrink-0 mr-2 ${getAvatarStyle(identity.avatarSeed)}`}>
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            <div className="flex flex-col min-w-0 mr-2">
              <span className="text-[9px] sm:text-[10px] font-black text-jsBlue dark:text-blue-300 truncate max-w-[70px] sm:max-w-[120px] uppercase tracking-tight">
                {identity.username}
              </span>
              <div className="flex items-center gap-1">
                <img src={getCountryFlag(identity.countryCode)} alt={identity.country} className="w-3 h-2 object-cover rounded-[1px]" />
                <span className="text-[7px] sm:text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Rank #{userRank || '--'}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onToggleDarkMode}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-yellow-400 transition-all hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center active:scale-95"
            aria-label="Toggle Night Mode"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-500" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-700 text-slate-800" />
            )}
          </button>

          {onViewChange && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {currentView === 'GAME' ? (
                <button
                  onClick={() => onViewChange('LIST')}
                  className="bg-[#003366] text-white px-2.5 py-2 sm:px-5 rounded-xl font-bold text-[9px] sm:text-xs flex items-center gap-1.5 sm:gap-2 hover:bg-[#002244] transition-all shadow-sm border-2 border-transparent active:scale-95"
                >
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFD700]" />
                  <span className="uppercase tracking-widest hidden sm:inline">Archives</span>
                  <span className="uppercase tracking-widest sm:hidden">ABC</span>
                </button>
              ) : (
                <button
                  onClick={() => onViewChange('GAME')}
                  className="bg-[#FFD700] text-[#003366] px-2.5 py-2 sm:px-5 rounded-xl font-bold text-[9px] sm:text-xs flex items-center gap-1.5 sm:gap-2 hover:bg-yellow-400 transition-all shadow-sm border-2 border-[#003366] active:scale-95"
                >
                  <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
