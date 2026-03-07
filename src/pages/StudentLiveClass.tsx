import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Video, Calendar, Clock, ExternalLink, Timer } from 'lucide-react';
import { useLiveSessionStore, getSessionStatus, LiveSession } from '../store/globalStore';
import { cn } from '../lib/utils';

export const StudentLiveClass = () => {
  const { sessions } = useLiveSessionStore();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'live' | 'past'>('live');

  const filteredSessions = sessions.filter(s => {
    const status = getSessionStatus(s.startTime, s.endTime);
    if (activeTab === 'upcoming') return status === 'Upcoming';
    if (activeTab === 'live') return status === 'Live';
    return status === 'Completed';
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Live Class</h1>
        <p className="text-white/60">Join live interactive sessions with our experts.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-white/10 relative">
        {(['upcoming', 'live', 'past'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-4 text-sm font-bold uppercase tracking-widest transition-all relative",
              activeTab === tab ? "text-indigo-400" : "text-white/40 hover:text-white/60"
            )}
          >
            {tab.replace('-', ' ')}
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400"
              />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredSessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full py-20 text-center bg-white/5 border border-white/10 rounded-[2.5rem]"
            >
              <Video className="mx-auto text-white/10 mb-4" size={48} />
              <p className="text-white/40 font-medium">No {activeTab} sessions found.</p>
            </motion.div>
          ) : (
            filteredSessions.map((session) => (
              <div key={session.id}>
                <SessionCard session={session} type={activeTab} />
              </div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface SessionCardProps {
  session: LiveSession;
  type: 'upcoming' | 'live' | 'past';
}

const SessionCard = ({ session, type }: SessionCardProps) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (type !== 'upcoming') return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(session.startTime).getTime();
      const diff = start - now;

      if (diff <= 0) {
        setTimeLeft('Starting now...');
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [session.startTime, type]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "bg-white/5 border rounded-[2rem] p-8 flex flex-col transition-all duration-500",
        type === 'live' 
          ? "border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.1)] ring-1 ring-red-500/20" 
          : "border-white/10"
      )}
    >
      <div className="flex justify-between items-start mb-6">
        <div className={cn(
          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
          type === 'live' ? "bg-red-500/20 text-red-400 border-red-500/20 animate-pulse" :
          type === 'upcoming' ? "bg-blue-500/20 text-blue-400 border-blue-500/20" :
          "bg-white/5 text-white/40 border-white/10"
        )}>
          {type === 'live' ? 'Live Now' : type === 'upcoming' ? 'Upcoming' : 'Completed'}
        </div>
        {type === 'upcoming' && (
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
            <Timer size={14} />
            {timeLeft}
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold mb-3">{session.title}</h3>
      <p className="text-white/40 text-sm mb-8 line-clamp-2 flex-grow">{session.description}</p>

      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-3 text-sm text-white/60">
          <Calendar size={18} className="text-indigo-400" />
          {new Date(session.startTime).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <div className="flex items-center gap-3 text-sm text-white/60">
          <Clock size={18} className="text-indigo-400" />
          {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
          {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {type === 'live' ? (
        <button
          onClick={() => window.open(session.meetingLink, '_blank')}
          className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 group"
        >
          Join Now <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </button>
      ) : type === 'upcoming' ? (
        <button
          disabled
          className="w-full py-4 bg-white/5 border border-white/10 text-white/40 rounded-2xl font-bold cursor-not-allowed"
        >
          Starts at {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </button>
      ) : (
        <div className="w-full py-4 bg-white/5 border border-white/10 text-white/20 rounded-2xl font-bold text-center">
          Session Ended
        </div>
      )}
    </motion.div>
  );
};
