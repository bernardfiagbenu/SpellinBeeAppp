import React, { useState } from 'react';
import { SpellingWord, Difficulty } from '../types';
import { ArrowLeft, Search, BookOpen, Hexagon, Award, Star } from 'lucide-react';

interface WordListViewProps {
  words: SpellingWord[];
  onBack: () => void;
  solvedWordIds: Set<string>;
  starredWordIds: Set<string>;
  onToggleStar: (word: SpellingWord) => void;
}

export const WordListView: React.FC<WordListViewProps> = ({ words, onBack, solvedWordIds, starredWordIds, onToggleStar }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const filteredWords = words.filter(w => {
    const matchesSearch = w.word.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLetter = selectedLetter ? w.word.toLowerCase().startsWith(selectedLetter.toLowerCase()) : true;
    return matchesSearch && matchesLetter;
  });

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

  return (
    <div className="w-full space-y-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl overflow-hidden border-t-8 border-[#003366] dark:border-blue-600 transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="p-2 -ml-2 text-[#003366] dark:text-blue-400"><ArrowLeft className="w-6 h-6" /></button>
            <h2 className="text-lg font-black serif italic text-[#003366] dark:text-blue-300 flex items-center gap-2"><BookOpen className="w-5 h-5" /> Word Archives</h2>
            <div className="w-6 h-6"></div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search words..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-[#003366] dark:focus:border-blue-500 rounded-2xl outline-none text-sm font-semibold transition-all dark:text-white"
            />
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-4 border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar flex items-center gap-2">
           <button onClick={() => setSelectedLetter(null)} className={`px-5 py-2 shrink-0 rounded-full text-[10px] font-black transition-all ${!selectedLetter ? 'bg-[#003366] dark:bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 uppercase'}`}>ALL</button>
           {alphabet.map(l => (
             <button key={l} onClick={() => setSelectedLetter(l === selectedLetter ? null : l)} className={`h-10 w-10 shrink-0 flex items-center justify-center rounded-full text-[10px] font-black transition-all ${selectedLetter === l ? 'bg-[#003366] dark:bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800'}`}>{l}</button>
           ))}
        </div>

        <div className="max-h-[55vh] overflow-y-auto bg-white dark:bg-slate-900">
          {filteredWords.length > 0 ? (
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredWords.map((word, i) => {
                const id = `${word.difficulty}:${word.word.toLowerCase()}`;
                const isSolved = solvedWordIds.has(id);
                const isStarred = starredWordIds.has(id);
                return (
                  <div key={i} className={`p-5 flex gap-4 transition-colors ${isSolved ? 'bg-green-50/20 dark:bg-green-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                    <div className="flex flex-col gap-3 pt-1">
                      {isSolved ? <Award className="w-5 h-5 text-green-500" /> : <Hexagon className="w-5 h-5 text-slate-200 dark:text-slate-800" />}
                      <button onClick={() => onToggleStar(word)} className={`transition-all ${isStarred ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 hover:text-yellow-200'}`}>
                        <Star className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-serif font-black text-[#003366] dark:text-blue-300 text-lg uppercase tracking-tight">{word.word}</h4>
                      <div className="flex items-center gap-2 my-1.5">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                          word.difficulty === Difficulty.ONE_BEE ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                          word.difficulty === Difficulty.TWO_BEE ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                          'bg-purple-50 text-purple-700 border-purple-100'
                        }`}>{word.difficulty}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">{word.definition || "Definition hidden for competition."}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-24 text-center text-slate-300 dark:text-slate-700 flex flex-col items-center">
              <BookOpen className="w-16 h-16 mb-4 opacity-10" />
              <p className="font-black text-[10px] uppercase tracking-widest">No matching entries</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};