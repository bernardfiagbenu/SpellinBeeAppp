
import React, { useEffect, useState } from 'react';
import { X, Trophy, Timer, Flame, Medal, Loader2, User } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getAvatarStyle, getCountryFlag } from '../hooks/useUserIdentity';

interface LeaderboardEntry {
  username: string;
  score: number;
  timeTaken: number;
  streak: number;
  avatarSeed: string;
  userId: string;
  country?: string;
  countryCode?: string;
}

interface LeaderboardModalProps {
  onClose: () => void;
  currentUserId?: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose, currentUserId }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(
          collection(db, 'leaderboard'),
          orderBy('score', 'desc'),
          orderBy('timeTaken', 'asc'),
          orderBy('streak', 'desc'),
          limit(500)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => doc.data() as LeaderboardEntry);
        setEntries(data);
      } catch (e) {
        console.error("Error fetching leaderboard:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100 dark:border-slate-800">
        <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-jsGold rounded-2xl shadow-lg shadow-jsGold/20">
              <Trophy className="w-6 h-6 text-jsBlue" />
            </div>
            <div>
              <h2 className="text-xl font-black text-jsBlue dark:text-blue-300 uppercase tracking-tight">Global Ranks</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top 500 Spellers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-2 sm:p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-jsBlue dark:text-blue-500" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Retrieving Data...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-12 px-4 py-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                <div className="col-span-1">#</div>
                <div className="col-span-5">Speller</div>
                <div className="col-span-2 text-center">Words</div>
                <div className="col-span-2 text-center">Time</div>
                <div className="col-span-2 text-center">Streak</div>
              </div>
              {entries.map((entry, index) => (
                <div 
                  key={entry.userId}
                  className={`grid grid-cols-12 items-center px-4 py-3 rounded-2xl border transition-all ${
                    entry.userId === currentUserId 
                      ? 'bg-jsBlue text-white border-jsBlue shadow-lg scale-[1.02]' 
                      : 'bg-white dark:bg-slate-800 border-slate-50 dark:border-slate-700'
                  }`}
                >
                  <div className="col-span-1 font-black text-xs">
                    {index < 3 ? (
                      <Medal className={`w-5 h-5 ${index === 0 ? 'text-jsGold' : index === 1 ? 'text-slate-300' : 'text-amber-600'}`} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="col-span-5 flex items-center gap-2 overflow-hidden">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 ${getAvatarStyle(entry.avatarSeed)}`}>
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-xs truncate uppercase tracking-tight">{entry.username}</span>
                      {entry.countryCode && (
                        <div className="flex items-center gap-1">
                          <img src={getCountryFlag(entry.countryCode)} alt={entry.country} className="w-2.5 h-1.5" />
                          <span className="text-[7px] uppercase opacity-60 font-black">{entry.countryCode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`col-span-2 text-center font-black text-xs ${entry.userId === currentUserId ? 'text-white' : 'text-jsBlue dark:text-blue-400'}`}>
                    {entry.score}
                  </div>
                  <div className="col-span-2 text-center text-[10px] font-medium opacity-60">
                    {Math.floor(entry.timeTaken / 60)}:{(entry.timeTaken % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="col-span-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-orange-500 font-black text-xs">
                      <Flame className="w-3 h-3 fill-current" />
                      {entry.streak}
                    </div>
                  </div>
                </div>
              ))}
              {entries.length === 0 && (
                <div className="text-center py-20 text-slate-300">
                  <Medal className="w-16 h-16 mx-auto mb-4 opacity-10" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No rankings yet. Be the first!</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
           <p className="text-[8px] text-center font-black text-slate-400 uppercase tracking-[0.2em]">
             Ranked by Score &gt; Efficiency &gt; Tenacity
           </p>
        </div>
      </div>
    </div>
  );
};
