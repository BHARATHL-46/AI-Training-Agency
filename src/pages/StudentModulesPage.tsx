import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, ChevronRight, BookOpen, Lock, CheckCircle2, 
  Clock, Award, BarChart3, Flame, Trophy, X, FileText, 
  PlayCircle, Download, ExternalLink, ArrowRight, LayoutGrid, List
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModuleStore } from '../store/globalStore';
import { cn } from '../lib/utils';

export const StudentModulesPage = () => {
  const { modules, completedModules, xp, streak, badges, isModuleUnlocked } = useModuleStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'In Progress' | 'Completed' | 'Locked'>('All');
  const [sortBy, setSortBy] = useState<'Newest' | 'Difficulty' | 'Progress'>('Newest');
  const [selectedModule, setSelectedModule] = useState<any | null>(null);

  const filteredModules = modules.filter(m => {
    const isUnlocked = isModuleUnlocked(m.id);
    const isCompleted = completedModules.includes(m.id);
    const isInProgress = isUnlocked && !isCompleted;
    
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      activeFilter === 'All' ||
      (activeFilter === 'In Progress' && isInProgress) ||
      (activeFilter === 'Completed' && isCompleted) ||
      (activeFilter === 'Locked' && !isUnlocked);
    
    return matchesSearch && matchesFilter && m.published;
  });

  return (
    <div className="space-y-10 pb-20 relative">
      {/* Background Radial Gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Header & Stats */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <nav className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase tracking-widest">
            <span className="hover:text-white transition-colors cursor-pointer" onClick={() => navigate('/student/dashboard')}>Dashboard</span>
            <ChevronRight size={12} />
            <span className="text-indigo-400">My Modules</span>
          </nav>
          <h1 className="text-5xl font-black tracking-tight">Learning Path</h1>
          <p className="text-white/50 text-lg max-w-lg">
            Master Generative AI through our structured curriculum.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="px-6 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center gap-4 shadow-2xl">
            <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center text-amber-400">
              <Trophy size={20} />
            </div>
            <div>
              <span className="block text-[10px] text-white/40 font-black uppercase tracking-widest">Total XP</span>
              <span className="font-bold text-lg">{xp.toLocaleString()}</span>
            </div>
          </div>
          <div className="px-6 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center gap-4 shadow-2xl">
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-400">
              <Flame size={20} />
            </div>
            <div>
              <span className="block text-[10px] text-white/40 font-black uppercase tracking-widest">Streak</span>
              <span className="font-bold text-lg">{streak} Days</span>
            </div>
          </div>
          <div className="px-6 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center gap-4 shadow-2xl">
            <div className="flex -space-x-2">
              {badges.slice(0, 3).map(b => (
                <div key={b.id} className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-[#050505] flex items-center justify-center text-sm" title={b.name}>
                  {b.icon}
                </div>
              ))}
            </div>
            <div>
              <span className="block text-[10px] text-white/40 font-black uppercase tracking-widest">Badges</span>
              <span className="font-bold text-lg">{badges.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 p-2 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-xl">
        <div className="flex items-center gap-2 p-1 bg-black/20 rounded-2xl w-full md:w-auto">
          {(['All', 'In Progress', 'Completed', 'Locked'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                activeFilter === filter 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto px-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm group"
            />
          </div>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-xs font-bold text-white/60 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="Newest">Newest First</option>
            <option value="Difficulty">Difficulty</option>
            <option value="Progress">Progress</option>
          </select>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredModules.map((module) => {
            const isUnlocked = isModuleUnlocked(module.id);
            const isCompleted = completedModules.includes(module.id);
            const isInProgress = isUnlocked && !isCompleted;

            return (
              <motion.div
                key={module.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={isUnlocked ? { y: -10, scale: 1.02 } : {}}
                onClick={() => setSelectedModule(module)}
                className={cn(
                  "group relative p-8 rounded-[2.5rem] border transition-all duration-500 cursor-pointer overflow-hidden",
                  isUnlocked 
                    ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/40 shadow-2xl shadow-black/40" 
                    : "bg-black/40 border-white/5 opacity-50 grayscale blur-[0.5px]",
                  isCompleted && "border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.05)]"
                )}
              >
                {/* Completion Checkmark Animation */}
                {isCompleted && (
                  <div className="absolute top-6 right-6 text-emerald-400">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-emerald-500/20 p-2 rounded-full border border-emerald-500/20"
                    >
                      <CheckCircle2 size={20} />
                    </motion.div>
                  </div>
                )}

                <div className="flex items-center gap-5 mb-8">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner",
                    isUnlocked ? "bg-indigo-600/20 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white" : "bg-white/5 text-white/20"
                  )}>
                    <BookOpen size={32} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                        module.difficulty === 'Beginner' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        module.difficulty === 'Intermediate' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        "bg-red-500/10 text-red-400 border-red-500/20"
                      )}>
                        {module.difficulty || 'Intermediate'}
                      </span>
                      {isInProgress && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-black uppercase tracking-widest animate-pulse">
                          In Progress
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-indigo-400 transition-colors">{module.title}</h3>
                  </div>
                </div>

                <p className="text-white/40 text-sm leading-relaxed mb-8 line-clamp-2">
                  {isUnlocked ? module.description : "Complete previous module to unlock"}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-white/40 font-bold">
                      <Clock size={14} className="text-indigo-400" /> {module.duration}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/40 font-bold">
                      <Award size={14} className="text-amber-400" /> {module.xp} XP
                    </div>
                  </div>

                  <div className="relative w-12 h-12">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                      <motion.circle 
                        cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" 
                        strokeDasharray={125.6}
                        initial={{ strokeDashoffset: 125.6 }}
                        animate={{ strokeDashoffset: 125.6 - (125.6 * (isCompleted ? 100 : isInProgress ? 45 : 0)) / 100 }}
                        className="text-indigo-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isUnlocked ? <ArrowRight size={16} className="text-white group-hover:translate-x-1 transition-transform" /> : <Lock size={16} className="text-white/20" />}
                    </div>
                  </div>
                </div>

                {isInProgress && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/student/modules/${module.id}`);
                    }}
                    className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                  >
                    Continue Learning <PlayCircle size={16} />
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Module Detail Drawer */}
      <AnimatePresence>
        {selectedModule && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedModule(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-xl bg-[#0A0A0A] border-l border-white/10 z-[101] shadow-2xl overflow-y-auto custom-scrollbar"
            >
              <div className="p-10 space-y-10">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setSelectedModule(null)}
                    className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all"
                  >
                    <X size={24} />
                  </button>
                  <div className="flex gap-3">
                    <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all">
                      <Download size={20} />
                    </button>
                    <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all">
                      <ExternalLink size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest">
                      {selectedModule.difficulty}
                    </span>
                    <span className="text-white/40 text-xs font-bold flex items-center gap-2">
                      <Clock size={14} /> {selectedModule.duration}
                    </span>
                  </div>
                  <h2 className="text-4xl font-black tracking-tight leading-tight">{selectedModule.title}</h2>
                  <p className="text-white/50 text-lg leading-relaxed">{selectedModule.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                    <div className="text-indigo-400 mb-2"><Award size={24} /></div>
                    <div className="text-2xl font-black">{selectedModule.xp}</div>
                    <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">XP Reward</div>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                    <div className="text-emerald-400 mb-2"><BarChart3 size={24} /></div>
                    <div className="text-2xl font-black">{selectedModule.passingScore}%</div>
                    <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Passing Score</div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-3">
                    <List size={20} className="text-indigo-400" /> Module Outline
                  </h3>
                  <div className="space-y-3">
                    {selectedModule.headings?.map((h: string, i: number) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl group hover:bg-white/10 transition-all cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center text-xs font-bold text-white/40 group-hover:text-indigo-400 transition-colors">
                          {i + 1}
                        </div>
                        <span className="font-medium text-white/80">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-3">
                    <FileText size={20} className="text-indigo-400" /> RAG Knowledge Base
                  </h3>
                  <div className="p-6 bg-indigo-600/5 border border-indigo-500/20 rounded-[2rem] text-center">
                    <p className="text-sm text-white/60 mb-4">Access specialized AI documentation for this module.</p>
                    <button className="text-indigo-400 text-sm font-bold hover:underline flex items-center gap-2 mx-auto">
                      View Documents <ExternalLink size={14} />
                    </button>
                  </div>
                </div>

                <div className="pt-10 sticky bottom-0 bg-[#0A0A0A] pb-10">
                  <button
                    disabled={!isModuleUnlocked(selectedModule.id)}
                    onClick={() => navigate(`/student/modules/${selectedModule.id}`)}
                    className={cn(
                      "w-full py-5 rounded-[2rem] font-black text-lg transition-all shadow-2xl flex items-center justify-center gap-3",
                      isModuleUnlocked(selectedModule.id)
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
                        : "bg-white/5 text-white/20 cursor-not-allowed"
                    )}
                  >
                    {!isModuleUnlocked(selectedModule.id) ? (
                      <>
                        <Lock size={20} /> Locked
                      </>
                    ) : (
                      <>
                        {completedModules.includes(selectedModule.id) ? 'Review Module' : 'Start Module'}
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
