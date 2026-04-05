import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Lock, CheckCircle2, ChevronRight, PlayCircle, Trophy, Target, Clock, Award, Flame, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModuleStore } from '../store/globalStore';
import { useAuthStore } from '../lib/api';
import { TodayLiveClassCard } from '../components/TodayLiveClassCard';

export const StudentDashboard = () => {
  const { modules, completedModules, xp, rank, streak, weeklyGoal, isModuleUnlocked } = useModuleStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const progress = Math.round((completedModules.length / modules.length) * 100);
  const lastUnlockedModule = [...modules].reverse().find(m => isModuleUnlocked(m.id));

  const getMotivationalText = (p: number) => {
    if (p >= 100) return "Incredible! You've mastered everything. Ready for the next challenge?";
    if (p >= 75) return "You're almost there! Just a few more modules to reach your goal.";
    if (p >= 50) return "Great progress! You're halfway through your learning path.";
    return "Keep going! Every small step brings you closer to mastery.";
  };

  return (
    <div className="space-y-12 pb-12 relative">
      {/* Background Radial Gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Welcome Header */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
            <TrendingUp size={12} /> Student Dashboard
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Welcome back, <br className="lg:hidden" />
            <span className="relative inline-block z-10">
              {user?.name}
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="absolute bottom-1 left-0 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-40 -z-10"
              />
            </span>
            !
          </h1>
          <p className="text-white/50 text-lg max-w-lg">
            You're doing great! You've completed {completedModules.length} modules so far.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {/* Circular Weekly Goal */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 flex items-center gap-5 shadow-2xl shadow-black/20">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90">
                <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-white/5" />
                <motion.circle 
                  cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="6" 
                  strokeDasharray={175.9}
                  initial={{ strokeDashoffset: 175.9 }}
                  animate={{ strokeDashoffset: 175.9 - (175.9 * weeklyGoal) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-indigo-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                {weeklyGoal}%
              </div>
            </div>
            <div>
              <span className="block text-[10px] text-white/40 uppercase font-bold tracking-widest mb-0.5">Weekly Goal</span>
              <span className="text-sm font-medium text-white/80">Almost there!</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 flex items-center gap-4 shadow-2xl shadow-black/20">
            <div className="w-12 h-12 bg-amber-400/10 rounded-2xl flex items-center justify-center text-amber-400 shadow-inner">
              <Trophy size={24} />
            </div>
            <div>
              <span className="block text-[10px] text-white/40 uppercase font-bold tracking-widest">Total XP</span>
              <span className="font-black text-2xl bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60">{xp.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 flex items-center gap-4 shadow-2xl shadow-black/20">
            <div className="w-12 h-12 bg-emerald-400/10 rounded-2xl flex items-center justify-center text-emerald-400 shadow-inner">
              <Target size={24} />
            </div>
            <div>
              <span className="block text-[10px] text-white/40 uppercase font-bold tracking-widest">Global Rank</span>
              <span className="font-black text-2xl bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60">#{rank}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Live Class */}
      <div className="relative z-10">
        <TodayLiveClassCard />
      </div>

      {/* Progress Overview */}
      <div className="relative z-10 bg-gradient-to-br from-indigo-600/10 via-purple-600/5 to-transparent border border-white/10 rounded-[2.5rem] p-10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Overall Progress</h2>
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-400">
                <Flame size={20} />
                <span className="font-bold">{streak} Day Streak!</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="relative h-6 bg-black/40 rounded-full border border-white/5 overflow-hidden p-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)] relative flex items-center justify-end px-3"
                >
                  <span className="text-[10px] font-black text-white drop-shadow-md">{progress}%</span>
                </motion.div>
              </div>
              <p className="text-white/60 italic font-medium">
                "{getMotivationalText(progress)}"
              </p>
            </div>

            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <span className="block text-xs text-white/40 font-bold uppercase">Completed</span>
                  <span className="text-lg font-bold">{completedModules.length} Modules</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <PlayCircle size={20} />
                </div>
                <div>
                  <span className="block text-xs text-white/40 font-bold uppercase">Remaining</span>
                  <span className="text-lg font-bold">{modules.length - completedModules.length} Modules</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center lg:justify-end">
            <motion.button 
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => lastUnlockedModule && navigate(`/student/modules/${lastUnlockedModule.id}`)}
              className="group relative bg-white text-black px-10 py-5 rounded-[2rem] font-black text-lg transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:shadow-[0_25px_50px_rgba(255,255,255,0.15)]"
            >
              Continue Learning
              <div className="absolute inset-0 rounded-[2rem] bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold tracking-tight">My Learning Path</h2>
          <button 
            onClick={() => navigate('/student/modules')}
            className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400 text-sm font-bold hover:bg-white/10 transition-all"
          >
            View All Modules
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {modules.map((module, i) => {
            const isUnlocked = isModuleUnlocked(module.id);
            const isCompleted = completedModules.includes(module.id);
            const isInProgress = isUnlocked && !isCompleted;

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={isUnlocked ? { y: -10, scale: 1.02 } : {}}
                onClick={() => isUnlocked && navigate(`/student/modules/${module.id}`)}
                className={`group relative p-10 rounded-[2.5rem] border transition-all duration-500 shadow-xl ${
                  isUnlocked 
                    ? 'bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer hover:border-indigo-500/40 shadow-black/20' 
                    : 'bg-black/40 border-white/5 opacity-50 grayscale cursor-not-allowed'
                }`}
              >
                <div className="flex justify-between items-start mb-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner ${
                    isUnlocked ? 'bg-indigo-600/20 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-white/5 text-white/20'
                  }`}>
                    <BookOpen size={32} />
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {!isUnlocked && (
                      <div className="bg-black/60 backdrop-blur-md p-2.5 rounded-xl border border-white/10 shadow-lg">
                        <Lock size={20} className="text-white/40" />
                      </div>
                    )}
                    {isUnlocked && (
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                        isCompleted ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        isInProgress ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                        'bg-white/5 text-white/40 border-white/10'
                      }`}>
                        {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Unlocked'}
                      </div>
                    )}
                    <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold text-white/40 uppercase tracking-tighter">
                      {module.difficulty || 'Intermediate'}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <h3 className="text-2xl font-bold group-hover:text-indigo-400 transition-colors duration-300">{module.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed line-clamp-2">{module.description}</p>
                </div>

                <div className="h-px bg-gradient-to-r from-white/10 to-transparent mb-8" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-xs text-white/40 font-medium">
                      <Clock size={16} className="text-indigo-400" /> {module.duration}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/40 font-medium">
                      <Award size={16} className="text-amber-400" /> {module.xp} XP
                    </div>
                  </div>
                  
                  {isUnlocked && (
                    <div className="relative w-10 h-10">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="20" cy="20" r="18" fill="transparent" stroke="currentColor" strokeWidth="3" className="text-white/5" />
                        <circle cx="20" cy="20" r="18" fill="transparent" stroke="currentColor" strokeWidth="3" strokeDasharray={113.1} strokeDashoffset={isCompleted ? 0 : 113.1 * 0.6} className="text-indigo-500" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ChevronRight size={16} className="text-white group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
