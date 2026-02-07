import React from 'react';
import { Hexagon, BookOpen, Gamepad2 } from 'lucide-react';

interface HeaderProps {
  currentView?: 'GAME' | 'LIST';
  onViewChange?: (view: 'GAME' | 'LIST') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  return (
    <header className="w-full bg-[#fdb714] border-b-[6px] border-black py-5 px-6 shadow-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => onViewChange && onViewChange('GAME')}
        >
          <div className="relative">
             <Hexagon className="w-10 h-10 text-black fill-black" />
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[#fdb714] font-bold text-lg">S</span>
             </div>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-black tracking-tighter leading-none font-serif uppercase">
              Scripps National <br className="hidden md:block" /> Spelling Bee
            </h1>
          </div>
        </div>
        
        {onViewChange && (
          <div className="flex items-center">
            {currentView === 'GAME' ? (
              <button
                onClick={() => onViewChange('LIST')}
                className="bg-black text-[#fdb714] px-5 py-2.5 rounded-none skew-x-[-10deg] font-bold text-sm flex items-center gap-2 hover:bg-neutral-800 transition-all shadow-sm border border-black hover:scale-105"
              >
                <div className="skew-x-[10deg] flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline uppercase tracking-widest text-xs">Word List</span>
                </div>
              </button>
            ) : (
              <button
                onClick={() => onViewChange('GAME')}
                className="bg-black text-[#fdb714] px-5 py-2.5 rounded-none skew-x-[-10deg] font-bold text-sm flex items-center gap-2 hover:bg-neutral-800 transition-all shadow-sm border border-black hover:scale-105"
              >
                <div className="skew-x-[10deg] flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4" />
                  <span className="hidden sm:inline uppercase tracking-widest text-xs">Return to Stage</span>
                </div>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};