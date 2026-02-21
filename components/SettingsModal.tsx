
import React from 'react';
import { X, Settings, Volume2, FastForward } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';

interface SettingsModalProps {
  onClose: () => void;
  rate: number;
  onRateChange: (rate: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, rate, onRateChange }) => {
  const { speak, isSpeaking } = useSpeech();

  const handleTest = () => {
    speak("The Judge's voice is now set to this speed.");
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-4 border-black dark:border-jsGold">
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border-b-2 border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-black dark:text-jsGold" />
            <h2 className="text-lg font-black text-black dark:text-jsGold uppercase tracking-tight">Preferences</h2>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-black dark:hover:text-jsGold transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5" /> Speech Speed
              </label>
              <span className="text-xs font-black text-black dark:text-jsGold bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                {rate.toFixed(2)}x
              </span>
            </div>
            
            <input 
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={rate}
              onChange={(e) => onRateChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-jsGold"
            />
            
            <div className="flex justify-between text-[8px] font-black text-zinc-400 uppercase tracking-widest">
              <span>Slower</span>
              <span>Normal (1.0)</span>
              <span>Faster</span>
            </div>
          </div>

          <button
            onClick={handleTest}
            disabled={isSpeaking}
            className="w-full py-4 bg-zinc-50 dark:bg-zinc-900 border-2 border-black dark:border-jsGold text-black dark:text-jsGold rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
          >
            <FastForward className="w-4 h-4" /> 
            Test Voice Speed
          </button>
        </div>

        <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border-t-2 border-zinc-100 dark:border-zinc-800 text-center">
          <button
            onClick={onClose}
            className="text-[9px] font-black text-zinc-400 hover:text-black dark:hover:text-jsGold uppercase tracking-[0.3em] transition-colors"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
