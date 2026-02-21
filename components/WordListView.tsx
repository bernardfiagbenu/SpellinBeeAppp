
import React, { useState } from 'react';
import { SpellingWord, Difficulty } from '../types';
import { ArrowLeft, Search, BookOpen, Hexagon, Award, Star } from 'lucide-react';
import { playUISound } from '../utils/audioUtils';

interface WordListViewProps {
  words: SpellingWord[];
  onBack: () => void;
  solvedWordIds: Set<string>;
  starredWordIds: Set<string>;
  onToggleStar: (word: SpellingWord) => void;
  userGrade?: Difficulty | null;
}

export const WordListView: React.FC<WordListViewProps> = ({ words, onBack, solvedWordIds, starredWordIds, onToggleStar, userGrade }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'ALL'>(userGrade || 'ALL');

  const filteredWords = words.filter(w => {
    const matchesSearch = w.word.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLetter = selectedLetter ? w.word.toLowerCase().startsWith(selectedLetter.toLowerCase()) : true;
    const matchesDifficulty = selectedDifficulty === 'ALL' ? true : w.difficulty === selectedDifficulty;
    return matchesSearch && matchesLetter && matchesDifficulty;
  });

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

  const handleBack = () => {
    playUISound('pop');
    onBack();
  };

  const handleToggleStarWord = (word: SpellingWord) => {
    playUISound('star');
    onToggleStar(word);
  };

  const handleLetterSelect = (l: string | null) => {
    playUISound('click');
    setSelectedLetter(l);
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in">
      <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] shadow-xl overflow-hidden border-t-8 border-black dark:border-jsGold transition-colors">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button onClick={handleBack} className="p-2 -ml-2 text-black dark:text-jsGold hover:scale-110 transition-transform"><ArrowLeft className="w-6 h-6" /></button>
            <h2 className="text-lg font-black text-black dark:text-jsGold flex items-center gap-2 uppercase tracking-tight"><BookOpen className="w-5 h-5" /> Word Archives</h2>
            <div className="w-6 h-6"></div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search words..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 focus:border-black dark:focus:border-jsGold rounded-2xl outline-none text-sm font-bold transition-all dark:text-white"
            />
          </div>

          {!userGrade && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <button 
                onClick={() => { playUISound('click'); setSelectedDifficulty('ALL'); }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedDifficulty === 'ALL' ? 'bg-black dark:bg-jsGold text-jsGold dark:text-black border-black dark:border-jsGold' : 'bg-white dark:bg-zinc-950 text-zinc-400 border-zinc-200 dark:border-zinc-800'}`}
              >
                All Grades
              </button>
              <button 
                onClick={() => { playUISound('click'); setSelectedDifficulty(Difficulty.GRADE_2_4); }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedDifficulty === Difficulty.GRADE_2_4 ? 'bg-black dark:bg-jsGold text-jsGold dark:text-black border-black dark:border-jsGold' : 'bg-white dark:bg-zinc-950 text-zinc-400 border-zinc-200 dark:border-zinc-800'}`}
              >
                Grade 2-4
              </button>
              <button 
                onClick={() => { playUISound('click'); setSelectedDifficulty(Difficulty.GRADE_5_9); }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedDifficulty === Difficulty.GRADE_5_9 ? 'bg-black dark:bg-jsGold text-jsGold dark:text-black border-black dark:border-jsGold' : 'bg-white dark:bg-zinc-950 text-zinc-400 border-zinc-200 dark:border-zinc-800'}`}
              >
                Grade 5-9
              </button>
            </div>
          )}
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900 p-4 border-b border-zinc-100 dark:border-zinc-800 overflow-x-auto no-scrollbar flex items-center gap-2">
           <button onClick={() => handleLetterSelect(null)} className={`px-5 py-2 shrink-0 rounded-full text-[10px] font-black transition-all ${!selectedLetter ? 'bg-black dark:bg-jsGold text-jsGold dark:text-black shadow-lg' : 'bg-white dark:bg-zinc-950 text-zinc-500 border border-zinc-200 dark:border-zinc-800 uppercase'}`}>ALL</button>
           {alphabet.map(l => (
             <button key={l} onClick={() => handleLetterSelect(l === selectedLetter ? null : l)} className={`h-10 w-10 shrink-0 flex items-center justify-center rounded-full text-[10px] font-black transition-all ${selectedLetter === l ? 'bg-black dark:bg-jsGold text-jsGold dark:text-black shadow-lg' : 'bg-white dark:bg-zinc-950 text-zinc-500 border border-zinc-200 dark:border-zinc-800'}`}>{l}</button>
           ))}
        </div>

        <div className="max-h-[55vh] overflow-y-auto bg-white dark:bg-zinc-950 no-scrollbar">
          {filteredWords.length > 0 ? (
            <div className="divide-y divide-zinc-50 dark:divide-zinc-900">
              {filteredWords.map((word, i) => {
                const id = `${word.difficulty}:${word.word.toLowerCase()}`;
                const isSolved = solvedWordIds.has(id);
                const isStarred = starredWordIds.has(id);
                return (
                  <div key={i} className={`p-5 flex gap-4 transition-colors ${isSolved ? 'bg-green-50/20 dark:bg-green-900/10' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50'}`}>
                    <div className="flex flex-col gap-3 pt-1">
                      {isSolved ? <Award className="w-5 h-5 text-green-500" /> : <Hexagon className="w-5 h-5 text-zinc-200 dark:text-zinc-800" />}
                      <button onClick={() => handleToggleStarWord(word)} className={`transition-all ${isStarred ? 'text-jsGold fill-jsGold' : 'text-zinc-200 hover:text-jsGold'}`}>
                        <Star className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-black text-black dark:text-jsGold text-lg uppercase tracking-tight">{word.word}</h4>
                      <div className="flex items-center gap-2 my-1.5">
                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800">{word.difficulty}</span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 italic font-medium leading-relaxed">{word.definition || "Definition restricted for competition."}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-24 text-center text-zinc-300 dark:text-zinc-700 flex flex-col items-center">
              <BookOpen className="w-16 h-16 mb-4 opacity-10" />
              <p className="font-black text-[10px] uppercase tracking-widest">No matching entries</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
