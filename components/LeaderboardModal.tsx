
import React, { useEffect, useState } from 'react';
import { X, Trophy, Flame, Medal, Loader2, User, AlertTriangle } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        if (!db) return;
        
        const q = query(
          collection(db, 'leaderboard'),
          orderBy('score', 'desc'),
          limit(100)
        );
        
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          userId: doc.id,
          ...doc.data()
        })) as LeaderboardEntry[];
        
        setEntries(data);
        setError(null);
      } catch (e: any) {
        console.error("Firestore Error:", e);
        if (e.message?.includes('permission')) {
          setError("PERMISSION_ERROR");
        } else if (e.message?.includes('index')) {
          setError("INDEX_ERROR");
        } else {
          setError("GENERAL_ERROR");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-4 border-black dark:border-jsGold">
        <div className="p-6 sm:p-8 bg-zinc-50 dark:bg-zinc-900 border-b-4 border-black dark:border-jsGold flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-jsGold rounded-2xl shadow-lg">
              <Trophy className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-black text-black dark:text-jsGold uppercase tracking-tight">Global Ranks</h2>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Elite Spellers Only</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-black dark:hover:text-jsGold transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 no-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-black dark:text-jsGold" />
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Retrieving Data...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <div className="p-4 bg-red-50 rounded-full mb-4">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-lg font-black text-zinc-800 dark:text-white mb-2 uppercase tracking-tight">
                {error === 'PERMISSION_ERROR' ? 'Setup Required' : 'Connection Error'}
              </h3>
              <p className="text-sm text-zinc-500 mb-6 max-w-sm">
                Database access issue. Please check Firestore Rules.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-12 px-4 py-2 text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                <div className="col-span-1">#</div>
                <div className="col-span-5">Speller</div>
                <div className="col-span-2 text-center">Words</div>
                <div className="col-span-2 text-center">Time</div>
                <div className="col-span-2 text-center">Streak</div>
              </div>
              {entries.map((entry, index) => (
                <div 
                  key={entry.userId}
                  className={`grid grid-cols-12 items-center px-4 py-3 rounded-2xl border-2 transition-all ${
                    entry.userId === currentUserId 
                      ? 'bg-black text-jsGold border-jsGold shadow-lg scale-[1.02]' 
                      : 'bg-white dark:bg-zinc-900 border-zinc-50 dark:border-zinc-800'
                  }`}
                >
                  <div className="col-span-1 font-black text-xs">
                    {index < 3 ? (
                      <Medal className={`w-5 h-5 ${index === 0 ? 'text-jsGold' : index === 1 ? 'text-zinc-300' : 'text-amber-600'}`} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="col-span-5 flex items-center gap-2 overflow-hidden">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 ${getAvatarStyle(entry.avatarSeed)}`}>
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-xs truncate uppercase tracking-tight text-black dark:text-white">
                        {entry.username}
                      </span>
                      {entry.countryCode && (
                        <div className="flex items-center gap-1">
                          <img src={getCountryFlag(entry.countryCode)} alt={entry.country} className="w-2.5 h-1.5" />
                          <span className="text-[7px] uppercase font-black text-zinc-500 dark:text-zinc-300">
                            {entry.countryCode}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`col-span-2 text-center font-black text-xs ${entry.userId === currentUserId ? 'text-jsGold' : 'text-black dark:text-jsGold'}`}>
                    {entry.score || 0}
                  </div>
                  <div className="col-span-2 text-center text-[10px] font-black text-zinc-600 dark:text-zinc-400">
                    {Math.floor((entry.timeTaken || 0) / 60)}:{((entry.timeTaken || 0) % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="col-span-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-orange-500 font-black text-xs">
                      <Flame className="w-3 h-3 fill-current" />
                      {entry.streak || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border-t-4 border-black dark:border-jsGold">
           <p className="text-[8px] text-center font-black text-zinc-400 uppercase tracking-[0.2em]">
             Official 2026 Season Ranking
           </p>
        </div>
      </div>
    </div>
  );
};
