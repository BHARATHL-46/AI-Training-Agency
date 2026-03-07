import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Video, ExternalLink, Timer, Clock, User, Tag } from 'lucide-react';
import { useLiveSessionStore, getSessionStatus, LiveSession } from '../store/globalStore';
import { cn } from '../lib/utils';

export const TodayLiveClassCard = () => {
  const { sessions } = useLiveSessionStore();
  const [todaySession, setTodaySession] = useState<LiveSession | null>(null);
  const [status, setStatus] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState('');

  const updateStatus = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const session = sessions.find(s => {
      const sessionDate = s.startTime.split('T')[0];
      const sessionStatus = getSessionStatus(s.startTime, s.endTime);
      return sessionDate === today && (sessionStatus === 'Upcoming' || sessionStatus === 'Live');
    });

    if (session) {
      setTodaySession(session);
      setStatus(getSessionStatus(session.startTime, session.endTime));
    } else {
      setTodaySession(null);
    }
  };

  useEffect(() => {
    updateStatus();
    const interval = setInterval(updateStatus, 60000);
    return () => clearInterval(interval);
  }, [sessions]);

  useEffect(() => {
    if (!todaySession || status !== 'Upcoming') return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(todaySession.startTime).getTime();
      const diff = start - now;

      if (diff <= 0) {
        setStatus('Live');
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [todaySession, status]);

  if (!todaySession) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative p-10 rounded-[2.5rem] border transition-all duration-500 overflow-hidden shadow-2xl",
        status === 'Live' 
          ? "bg-red-600/10 border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)] ring-2 ring-red-500/20" 
          : "bg-indigo-600/10 border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.1)]"
      )}
    >
      {/* Animated Glow Effect */}
      {status === 'Live' && (
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 pointer-events-none"
        />
      )}

      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
      
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="flex items-start sm:items-center gap-8">
          <div className={cn(
            "w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-inner shrink-0",
            status === 'Live' ? "bg-red-600/20 text-red-400" : "bg-indigo-600/20 text-indigo-400"
          )}>
            <Video size={40} />
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                status === 'Live' ? "bg-red-500/20 text-red-400 border-red-500/20 animate-pulse" : "bg-indigo-500/20 text-indigo-400 border-indigo-500/20"
              )}>
                {status === 'Live' ? 'Live Now' : 'Upcoming Session'}
              </span>
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white/60 uppercase tracking-wider">
                <Tag size={12} className="text-indigo-400" />
                {todaySession.type || 'Workshop'}
              </div>
              <span className="text-white/40 text-xs font-bold flex items-center gap-2 ml-2">
                <Clock size={16} className="text-indigo-400" />
                {new Date(todaySession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h3 className="text-3xl font-black tracking-tight">{todaySession.title}</h3>
            <div className="flex items-center gap-3 text-white/50 text-sm font-medium">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                <User size={14} />
              </div>
              <span>Instructor: <span className="text-white/80 font-bold">{todaySession.instructorName || 'Dr. Sarah Chen'}</span></span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-8">
          {status === 'Upcoming' && (
            <div className="text-center sm:text-right">
              <p className="text-[10px] text-white/40 uppercase font-black tracking-[0.2em] mb-1">Starts In</p>
              <div className="flex items-center gap-2 text-2xl font-black text-indigo-400 font-mono">
                <Timer size={24} />
                {timeLeft}
              </div>
            </div>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.open(todaySession.meetingLink, '_blank')}
            className={cn(
              "w-full sm:w-auto px-10 py-5 rounded-[2rem] font-black text-lg transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 group",
              status === 'Live' 
                ? "bg-red-600 text-white hover:bg-red-500 shadow-red-600/30" 
                : "bg-white text-black hover:bg-white/90 shadow-white/20"
            )}
          >
            {status === 'Live' ? 'Join Now' : 'Join Class'}
            <ExternalLink size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
