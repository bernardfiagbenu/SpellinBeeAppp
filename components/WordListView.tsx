
import React, { useState, useEffect } from 'react';
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

  // Reset local filters when the underlying word list changes (e.g., user selects a new bee level)
  useEffect(() => {
    setSearchTerm('');
    setSelectedLetter(null);
  }, [words]);

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(prev => (prev === letter ? null : letter));
  };

  const filteredWords = words.filter(w => {
    const matchesSearch = w.word.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLetter = selectedLetter ? w.word.toLowerCase().startsWith(selectedLetter.toLowerCase()) : true;
    return matchesSearch && matchesLetter;
  });

  const getDifficultyBadgeClass = (diff: Difficulty) => {
    switch(diff) {
        case Difficulty.ONE_BEE:
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case Difficulty.TWO_BEE:
            return 'bg-orange-100 text-orange-800 border-orange-200';
        case Difficulty.THREE_BEE:
            return 'bg-purple-100 text-purple-800 border-purple-200';
        default:
            return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <div className="bg-white shadow-xl border-t-8 border-[#fdb714] overflow-hidden">
        {/* Header Section */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-600 hover:text-black font-bold transition-colors group uppercase tracking-wider text-xs"
              >
                <div className="bg-white p-2 border border-slate-200 group-hover:border-[#fdb714] transition-colors shadow-sm">
                   <ArrowLeft className="w-4 h-4" />
                </div>
                Back to Stage
              </button>
              <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>
              <h2 className="text-xl font-black font-serif flex items-center gap-2 text-slate-900">
                <BookOpen className="w-6 h-6 text-[#fdb714]" />
                Words of the Champions
              </h2>
            </div>
            
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search words..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-200 focus:border-[#fdb714] outline-none transition-all text-sm font-medium"
              />
            </div>
          </div>
        </div>

        {/* Alphabet Filter Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex flex-wrap justify-center items-center gap-1 md:gap-1.5">
            <button
              onClick={() => setSelectedLetter(null)}
              className={`px-3 py-1.5 h-9 w-12 text-sm font-bold transition-colors ${
                !selectedLetter
                  ? 'bg-black text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            {alphabet.map(letter => (
              <button
                key={letter}
                onClick={() => handleLetterClick(letter)}
                className={`flex items-center justify-center h-9 w-9 text-sm font-bold transition-colors ${
                  selectedLetter === letter
                    ? 'bg-black text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* List Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-black text-white text-xs uppercase tracking-widest font-bold">
              <tr>
                <th className="py-4 px-6 w-16">Status</th>
                <th className="py-4 px-6 w-48">Word</th>
                <th className="py-4 px-6 w-40">Difficulty Level</th>
                <th className="py-4 px-6">Definition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWords.map((word, index) => {
                const isSolved = solvedWordIds.has(`${word.difficulty}:${word.word.toLowerCase()}`);
                return (
                  <tr key={index} className="hover:bg-yellow-50 transition-colors group">
                    <td className="py-4 px-6 text-center">
                       {isSolved && <Award className="w-5 h-5 text-green-500 mx-auto" />}
                    </td>
                    <td className="py-4 px-6 font-serif font-bold text-slate-900 capitalize text-lg group-hover:text-black">
                      <div className="flex items-center gap-2">
                          <Hexagon className="w-2 h-2 text-[#fdb714] fill-[#fdb714] opacity-0 group-hover:opacity-100 transition-opacity" />
                          {word.word}
                      </div>
                      {word.altSpelling && <span className="block text-xs text-slate-400 font-sans font-normal mt-1 ml-4">or {word.altSpelling}</span>}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 text-[10px] uppercase tracking-widest font-bold border ${getDifficultyBadgeClass(word.difficulty)}`}>
                        {word.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 text-sm leading-relaxed font-medium">
                      {word.definition ? (
                        <span className="">{word.definition}</span>
                      ) : (
                        <span className="text-slate-300 select-none">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredWords.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-slate-500 bg-slate-50/30">
                    <div className="flex flex-col items-center gap-3">
                       <Hexagon className="w-12 h-12 text-slate-200" />
                       <p className="font-serif text-lg">No words found</p>
                       {(searchTerm || selectedLetter) && <p className="text-sm">Try adjusting your filters.</p>}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-center text-slate-500 uppercase tracking-widest font-semibold">
           Displaying {filteredWords.length} Words
        </div>
      </div>
    </div>
  );
};
