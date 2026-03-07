import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Medal, Crown, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useAuthStore } from '../lib/api';

const mockLeaderboard = [
  { id: '1', name: 'Alex Rivera', score: 2850, rank: 1, trend: 'up', avatar: 'https://picsum.photos/seed/alex/100' },
  { id: '2', name: 'Sarah Chen', score: 2720, rank: 2, trend: 'down', avatar: 'https://picsum.photos/seed/sarah/100' },
  { id: '3', name: 'Marcus Thorne', score: 2680, rank: 3, trend: 'same', avatar: 'https://picsum.photos/seed/marcus/100' },
  { id: '4', name: 'Elena Gilbert', score: 2450, rank: 4, trend: 'up', avatar: 'https://picsum.photos/seed/elena/100' },
  { id: '5', name: 'David Kim', score: 2310, rank: 5, trend: 'down', avatar: 'https://picsum.photos/seed/david/100' },
  { id: '6', name: 'Jordan Hayes', score: 2100, rank: 6, trend: 'up', avatar: 'https://picsum.photos/seed/jordan/100' },
];

export const LeaderboardPage = () => {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState(mockLeaderboard);
  const isAdmin = user?.role === 'ADMIN';

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLeaderboard(prev => {
        const next = [...prev];
        const idx = Math.floor(Math.random() * next.length);
        next[idx] = { ...next[idx], score: next[idx].score + Math.floor(Math.random() * 50) };
        return next.sort((a, b) => b.score - a.score).map((item, i) => ({ ...item, rank: i + 1 }));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="text-amber-400" size={24} />;
      case 2: return <Medal className="text-slate-300" size={24} />;
      case 3: return <Medal className="text-amber-700" size={24} />;
      default: return <span className="text-white/40 font-bold">{rank}</span>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="text-emerald-400" size={14} />;
      case 'down': return <ArrowDown className="text-red-400" size={14} />;
      default: return <Minus className="text-white/20" size={14} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-indigo-600/20 border border-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Trophy className="text-indigo-400" size={40} />
        </div>
        <h1 className="text-4xl font-bold mb-2">{isAdmin ? 'Global Agency Leaderboard' : 'Top Learners'}</h1>
        <p className="text-white/60">{isAdmin ? 'Monitor top performers across all departments.' : 'Compete with top learners across the agency.'}</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-xl">
        <div className="grid grid-cols-12 gap-4 p-6 border-b border-white/10 text-xs font-bold uppercase tracking-widest text-white/40">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-7">Learner</div>
          <div className="col-span-2 text-right">Trend</div>
          <div className="col-span-2 text-right">Score</div>
        </div>

        <div className="divide-y divide-white/5">
          <AnimatePresence mode="popLayout">
            {leaderboard.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`grid grid-cols-12 gap-4 p-6 items-center transition-colors ${
                  item.name === user?.name ? 'bg-indigo-600/10' : 'hover:bg-white/5'
                }`}
              >
                <div className="col-span-1 flex justify-center">
                  {getRankIcon(item.rank)}
                </div>
                <div className="col-span-7 flex items-center gap-4">
                  <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-xl border border-white/10" />
                  <div>
                    <span className="font-bold block">{item.name}</span>
                    {item.name === user?.name && <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded uppercase font-bold">You</span>}
                  </div>
                </div>
                <div className="col-span-2 flex justify-end">
                  <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                    {getTrendIcon(item.trend)}
                    <span className="text-[10px] font-bold text-white/60 uppercase">{item.trend}</span>
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <span className="font-mono font-bold text-indigo-400">{item.score.toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {!isAdmin && (
        <div className="mt-8 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-white/10 rounded-3xl p-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img src="https://picsum.photos/seed/user/100" className="w-16 h-16 rounded-2xl border-2 border-indigo-500" />
              <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-4 border-[#050505]">
                12
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold">Your Ranking</h3>
              <p className="text-white/60">You're in the top 15% of all learners!</p>
            </div>
          </div>
          <div className="text-right">
            <span className="block text-xs text-white/40 uppercase font-bold mb-1">Current Points</span>
            <span className="text-3xl font-mono font-bold text-white">1,420</span>
          </div>
        </div>
      )}
    </div>
  );
};
