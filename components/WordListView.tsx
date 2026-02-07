import React, { useState } from 'react';
import { SpellingWord, Difficulty } from '../types';
import { ArrowLeft, Search, BookOpen, Hexagon, Award } from 'lucide-react';

interface WordListViewProps {
  words: SpellingWord[];
  onBack: () => void;
  solvedWordIds: Set<string>;
}

export const WordListView: React.FC<WordListViewProps> = ({ words, onBack, solvedWordIds }) => {
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
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-t-8 border-[#003366]">
        {/* Mobile Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="p-2 -ml-2 text-[#003366]"><ArrowLeft className="w-6 h-6" /></button>
            <h2 className="text-lg font-black serif italic text-[#003366] flex items-center gap-2"><BookOpen className="w-5 h-5" /> Word Archives</h2>
            <div className="w-6 h-6"></div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search dictionary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 focus:border-[#003366] rounded-xl outline-none text-sm font-semibold transition-all"
            />
          </div>
        </div>

        {/* Scrollable Letters */}
        <div className="bg-slate-50 p-3 border-b border-slate-100 overflow-x-auto no-scrollbar flex items-center gap-2">
           <button onClick={() => setSelectedLetter(null)} className={`px-4 py-2 shrink-0 rounded-full text-xs font-bold ${!selectedLetter ? 'bg-[#003366] text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}>ALL</button>
           {alphabet.map(l => (
             <button key={l} onClick={() => setSelectedLetter(l === selectedLetter ? null : l)} className={`h-9 w-9 shrink-0 flex items-center justify-center rounded-full text-xs font-bold ${selectedLetter === l ? 'bg-[#003366] text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}>{l}</button>
           ))}
        </div>

        {/* List Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {filteredWords.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {filteredWords.map((word, i) => {
                const isSolved = solvedWordIds.has(`${word.difficulty}:${word.word.toLowerCase()}`);
                return (
                  <div key={i} className={`p-4 flex gap-4 transition-colors ${isSolved ? 'bg-green-50/30' : 'hover:bg-slate-50'}`}>
                    <div className="shrink-0 pt-1">
                      {isSolved ? <Award className="w-5 h-5 text-green-500" /> : <Hexagon className="w-5 h-5 text-slate-200" />}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-serif font-black text-[#003366] text-lg uppercase tracking-tight">{word.word}</h4>
                      <div className="flex items-center gap-2 my-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                          word.difficulty === Difficulty.ONE_BEE ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                          word.difficulty === Difficulty.TWO_BEE ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                          'bg-purple-50 text-purple-700 border-purple-100'
                        }`}>{word.difficulty}</span>
                        {word.altSpelling && <span className="text-[9px] text-slate-400 font-bold uppercase">Alt: {word.altSpelling}</span>}
                      </div>
                      <p className="text-xs text-slate-500 italic mt-2 line-clamp-2">{word.definition || "No definition provided."}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-20 text-center text-slate-300">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="font-bold text-sm uppercase">No matches found</p>
            </div>
          )}
        </div>
        
        <div className="bg-[#003366] p-3 text-center text-[10px] text-blue-200 font-bold uppercase tracking-[0.2em]">
          Total: {filteredWords.length} Official Entry Words
        </div>
      </div>
    </div>
  );
};