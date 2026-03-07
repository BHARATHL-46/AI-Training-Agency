import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, Mail, Calendar, Edit3, BookOpen, Trophy, 
  Flame, CheckCircle2, Award, Zap, Brain, Rocket, 
  Clock, Save, Lock, Languages, ChevronRight, MessageSquare,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModuleStore, useLanguageStore } from '../store/globalStore';
import { useAuthStore } from '../lib/api';

export const StudentProfilePage = () => {
  const { modules, completedModules, xp, rank, streak, badges, isModuleUnlocked } = useModuleStore();
  const { user, updateUser } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState(user?.name || 'Student');
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Student Name',
    email: user?.email || 'student@example.com',
    password: '••••••••',
    language: language === 'en' ? 'English' : language === 'ta' ? 'Tamil' : language === 'hi' ? 'Hindi' : 'Spanish'
  });

  const progress = Math.round((completedModules.length / modules.length) * 100);
  const lastUnlockedModule = [...modules].reverse().find(m => isModuleUnlocked(m.id));

  const skills = [
    { name: 'Generative AI', level: 85, color: 'from-blue-500 to-indigo-500' },
    { name: 'Prompt Engineering', level: 65, color: 'from-purple-500 to-pink-500' },
    { name: 'AI Agents', level: 45, color: 'from-emerald-500 to-teal-500' },
    { name: 'Machine Learning', level: 30, color: 'from-orange-500 to-red-500' }
  ];

  const activities = [
    { id: 1, type: 'completion', title: 'Completed "Introduction to Generative AI"', time: '2 hours ago', icon: CheckCircle2, color: 'text-emerald-400' },
    { id: 2, type: 'live', title: 'Joined Live Class: Deep Dive into LLMs', time: 'Yesterday', icon: Rocket, color: 'text-indigo-400' },
    { id: 3, type: 'quiz', title: 'Attempted Quiz: Prompt Engineering', time: '2 days ago', icon: Brain, color: 'text-purple-400' },
    { id: 4, type: 'xp', title: 'Earned 150 XP from Daily Challenge', time: '3 days ago', icon: Zap, color: 'text-amber-400' }
  ];

  const notes = [
    { id: 1, module: 'Introduction to Generative AI', preview: 'Transformers use attention mechanisms to process sequences...', date: 'Mar 4, 2024' },
    { id: 2, module: 'Prompt Engineering Mastery', preview: 'Few-shot prompting involves providing examples in the prompt...', date: 'Mar 2, 2024' }
  ];

  const handleSave = () => {
    if (user) {
      updateUser({
        ...user,
        name: profileData.name,
        email: profileData.email
      });
      setLanguage(profileData.language === 'English' ? 'en' : profileData.language === 'Tamil' ? 'ta' : profileData.language === 'Hindi' ? 'hi' : 'es');
    }
    setIsEditing(false);
  };

  const handleAvatarChange = () => {
    const newSeed = Math.random().toString(36).substring(7);
    setAvatarSeed(newSeed);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 relative">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      {/* 1. Profile Hero Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 lg:p-12 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -mr-48 -mt-48 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/5 blur-[100px] rounded-full -ml-24 -mb-24" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
          <div className="relative group">
            <div className="w-44 h-44 rounded-full p-1.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_40px_rgba(99,102,241,0.4)] group-hover:shadow-[0_0_60px_rgba(99,102,241,0.6)] transition-all duration-500">
              <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center overflow-hidden border-4 border-[#050505]">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} 
                  alt="Avatar"
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAvatarChange}
              className="absolute bottom-2 right-2 p-3 bg-indigo-600 rounded-2xl shadow-2xl border border-white/20 hover:bg-indigo-500 transition-all z-20"
              title="Change Avatar"
            >
              <Edit3 size={18} />
            </motion.button>
          </div>

          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <h1 className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">{user?.name}</h1>
                <div className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  Student Elite
                </div>
              </div>
              <p className="text-white/40 font-medium flex items-center justify-center lg:justify-start gap-2 text-lg">
                <Mail size={16} className="text-indigo-400/60" /> {user?.email}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 text-sm font-medium">
              <div className="flex items-center gap-2.5 text-white/60 group cursor-default">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                  <Calendar size={16} className="text-indigo-400" />
                </div>
                <span>Joined March 2024</span>
              </div>
              <div className="flex items-center gap-2.5 text-white/60 group cursor-default">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-amber-500/10 transition-colors">
                  <Trophy size={16} className="text-amber-400" />
                </div>
                <span>Rank #{rank} Global</span>
              </div>
            </div>

            <div className="pt-6 flex flex-wrap justify-center lg:justify-start gap-5">
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="px-10 py-4 bg-white text-black rounded-[1.5rem] font-black text-sm hover:shadow-[0_10px_30px_rgba(255,255,255,0.2)] transition-all"
              >
                Edit Profile
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => alert('Public profile feature coming soon!')}
                className="px-10 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] font-black text-sm hover:bg-white/10 transition-all flex items-center gap-2"
              >
                View Public Profile
                <ExternalLink size={14} />
              </motion.button>
            </div>
          </div>

          <div className="hidden xl:grid grid-cols-2 gap-5">
            {[
              { label: 'Modules', value: completedModules.length, icon: BookOpen, color: 'text-indigo-400' },
              { label: 'XP Earned', value: xp.toLocaleString(), icon: Zap, color: 'text-amber-400' },
              { label: 'Streak', value: `${streak} Days`, icon: Flame, color: 'text-orange-400' },
              { label: 'Badges', value: badges.length, icon: Award, color: 'text-purple-400' }
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -5 }}
                className="bg-white/5 border border-white/10 rounded-[2rem] p-5 w-36 text-center space-y-2 shadow-xl hover:border-white/20 transition-all"
              >
                <div className="flex justify-center mb-1">
                  <stat.icon size={20} className={stat.color} />
                </div>
                <div className="text-2xl font-black tracking-tight">{stat.value}</div>
                <div className="text-[9px] text-white/30 uppercase font-black tracking-[0.15em]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 2. Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {[
          { icon: BookOpen, label: 'Modules Enrolled', value: modules.length, color: 'bg-blue-500/10 text-blue-400' },
          { icon: CheckCircle2, label: 'Completed', value: completedModules.length, color: 'bg-emerald-500/10 text-emerald-400' },
          { icon: Zap, label: 'Total XP', value: xp.toLocaleString(), color: 'bg-amber-500/10 text-amber-400' },
          { icon: Flame, label: 'Learning Streak', value: `${streak} Days`, color: 'bg-orange-500/10 text-orange-400' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.08)' }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center gap-5 shadow-xl transition-all"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${stat.color}`}>
              <stat.icon size={28} />
            </div>
            <div>
              <div className="text-3xl font-black">{stat.value}</div>
              <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* 3. Progress Visualization */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center space-y-6 shadow-xl"
        >
          <h3 className="text-xl font-bold">Overall Learning Progress</h3>
          <div className="relative w-48 h-48">
            <svg className="w-full h-full -rotate-90">
              <circle cx="96" cy="96" r="80" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-white/5" />
              <motion.circle 
                cx="96" cy="96" r="80" fill="transparent" stroke="currentColor" strokeWidth="12" 
                strokeDasharray={502.6}
                initial={{ strokeDashoffset: 502.6 }}
                animate={{ strokeDashoffset: 502.6 - (502.6 * progress) / 100 }}
                transition={{ duration: 2, ease: "easeOut" }}
                strokeLinecap="round"
                className="text-indigo-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black">{progress}%</span>
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Mastery</span>
            </div>
          </div>
          <p className="text-white/50 text-sm max-w-[200px]">
            You've completed {completedModules.length} out of {modules.length} modules in your path.
          </p>
          <button 
            onClick={() => navigate('/student/modules')}
            className="w-full py-4 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-2xl font-bold hover:bg-indigo-600 hover:text-white transition-all"
          >
            View Curriculum
          </button>
        </motion.div>

        {/* 4. Activity Timeline */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-xl"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Recent Activity</h3>
            <button 
              onClick={() => navigate('/student/analytics')}
              className="text-indigo-400 text-sm font-bold hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-8 relative">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-white/10" />
            {activities.map((activity, i) => (
              <div key={activity.id} className="relative flex items-start gap-6 pl-1">
                <div className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center bg-[#0A0A0A] border border-white/10 shadow-lg ${activity.color}`}>
                  <activity.icon size={16} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white/90">{activity.title}</h4>
                  <p className="text-xs text-white/40 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* 5. Achievements & Badges */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-xl"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Achievements</h3>
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{badges.length} Unlocked</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {badges.map((badge) => (
              <motion.div 
                key={badge.id}
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="group relative flex flex-col items-center gap-3"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 flex items-center justify-center text-4xl shadow-lg group-hover:shadow-indigo-500/20 transition-all relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {badge.icon}
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-black text-white/80 uppercase tracking-tighter leading-tight">{badge.name}</div>
                  <div className="text-[8px] text-white/30 uppercase font-bold">{badge.date}</div>
                </div>
              </motion.div>
            ))}
            {/* Locked Badge Example */}
            <div className="flex flex-col items-center gap-3 opacity-30 grayscale">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
                <Lock size={24} />
              </div>
              <div className="text-center">
                <div className="text-[10px] font-black text-white/80 uppercase tracking-tighter">Locked</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 6. Skill Progress */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-xl"
        >
          <h3 className="text-xl font-bold mb-8">Skill Mastery</h3>
          <div className="space-y-6">
            {skills.map((skill, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-white/60">{skill.name}</span>
                  <span className="text-indigo-400">{skill.level}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                    className={`h-full bg-gradient-to-r ${skill.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* 7. Settings Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-xl"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Personal Settings</h3>
            {isEditing && (
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 text-emerald-400 text-sm font-bold hover:underline"
              >
                <Save size={16} /> Save Changes
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="text" 
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  disabled={!isEditing}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="email" 
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  disabled={!isEditing}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="password" 
                  value={profileData.password}
                  onChange={(e) => setProfileData({...profileData, password: e.target.value})}
                  disabled={!isEditing}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Preferred Language</label>
              <div className="relative">
                <Languages className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <select 
                  value={profileData.language}
                  onChange={(e) => setProfileData({...profileData, language: e.target.value})}
                  disabled={!isEditing}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50 appearance-none"
                >
                  <option>English</option>
                  <option>Tamil</option>
                  <option>Hindi</option>
                  <option>Spanish</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 8. Notes Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-xl"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Recent Notes</h3>
            <button 
              onClick={() => navigate('/student/modules')}
              className="text-indigo-400 text-sm font-bold hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {notes.map((note) => (
              <div 
                key={note.id} 
                onClick={() => navigate('/student/modules')}
                className="p-4 bg-black/20 border border-white/5 rounded-2xl space-y-2 hover:border-indigo-500/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">{note.module}</span>
                  <span className="text-[8px] text-white/20 font-bold uppercase">{note.date}</span>
                </div>
                <p className="text-xs text-white/60 line-clamp-2 group-hover:text-white/80 transition-colors">
                  {note.preview}
                </p>
                <div className="flex items-center gap-1 text-[8px] font-bold text-white/20 uppercase group-hover:text-indigo-400 transition-colors">
                  <MessageSquare size={10} /> Read More
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer CTA */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 flex flex-col items-center justify-center py-12 space-y-6"
      >
        <div className="h-px w-full max-w-md bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <p className="text-white/30 text-sm font-medium">Ready to continue your journey?</p>
        <button 
          onClick={() => lastUnlockedModule && navigate(`/student/modules/${lastUnlockedModule.id}`)}
          className="group flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all"
        >
          Resume Learning
          <ChevronRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  );
};
